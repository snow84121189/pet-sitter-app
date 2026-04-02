const NOTION_TOKEN = process.env.NOTION_TOKEN;
const DB_ID = process.env.NOTION_BOOKINGS_DB_ID;
const VF_DB_ID = process.env.NOTION_VISITFORMS_DB_ID;

const headers = {
  'Authorization': `Bearer ${NOTION_TOKEN}`,
  'Content-Type': 'application/json',
  'Notion-Version': '2022-06-28',
};

function toNotion(b) {
  const dates = b.dates || [];
  const noteLines = [];
  if (dates.length > 1) noteLines.push(`📅 服務日期：${dates.join('、')}`);
  if (b.pets && b.pets.length > 0) {
    noteLines.push(`🐾 寵物資訊：${b.pets.map(p => `${p.name}(${p.type})`).join('、')}`);
  }
  if (b.notes) noteLines.push(b.notes);

  return {
    '預約名稱':       { title: [{ text: { content: b.title || '' } }] },
    '飼主姓名':       { rich_text: [{ text: { content: b.ownerName || '' } }] },
    '飼主電話':       { phone_number: b.ownerPhone || null },
    '寵物名稱':       { rich_text: [{ text: { content: (b.pets||[]).map(p=>p.name).join('、') } }] },
    '寵物種類':       { select: b.pets?.[0]?.type ? { name: b.pets[0].type } : null },
    '服務類型':       { select: b.serviceType ? { name: b.serviceType } : null },
    '時段':           { select: b.timeOfDay ? { name: b.timeOfDay } : null },
    '指定時間':       { rich_text: [{ text: { content: b.appointmentTime || '' } }] },
    '服務時長(分鐘)': { number: b.duration || null },
    '服務金額':       { number: b.price || null },
    '付款狀態':       { select: b.paid ? { name: '已付款' } : { name: '未付款' } },
    '預約狀態':       { status: { name: b.status === 'completed' ? '完成' : b.status === 'confirmed' ? '進行中' : '未開始' } },
    '服務地址':       { rich_text: [{ text: { content: b.address || '' } }] },
    '備註':           { rich_text: [{ text: { content: noteLines.join('\n') } }] },
    '家訪表':         { checkbox: !!b.hasVisitForm },
    ...(dates[0] ? { '服務開始日': { date: { start: dates[0] } } } : {}),
    ...(dates.length > 1 ? { '服務結束日': { date: { start: dates[dates.length - 1] } } } : {}),
  };
}

function fromNotion(page) {
  const p = page.properties;
  const getT  = f => p[f]?.title?.[0]?.plain_text || '';
  const getR  = f => p[f]?.rich_text?.[0]?.plain_text || '';
  const getS  = f => p[f]?.select?.name || '';
  const getN  = f => p[f]?.number ?? null;
  const getC  = f => p[f]?.checkbox ?? false;
  const getD  = f => p[f]?.date?.start || '';
  const getP  = f => p[f]?.phone_number || '';
  const getSt = f => p[f]?.status?.name || '';
  const statusMap = { '完成': 'completed', '進行中': 'confirmed', '未開始': 'pending' };

  const rawNote = getR('備註');
  let dates = [], pets = [], cleanNotes = rawNote;

  const dateLineMatch = rawNote.match(/^📅 服務日期：([^\n]+)/m);
  if (dateLineMatch) {
    dates = dateLineMatch[1].split('、').map(d => d.trim()).filter(Boolean);
  } else {
    const start = getD('服務開始日'), end = getD('服務結束日');
    if (start) dates = (end && end !== start) ? [start, end] : [start];
  }

  const petLineMatch = rawNote.match(/🐾 寵物資訊：([^\n]+)/m);
  if (petLineMatch) {
    pets = petLineMatch[1].split('、').map(s => {
      const m = s.match(/^(.+)\((.+)\)$/);
      return m ? { name: m[1].trim(), type: m[2].trim() } : { name: s.trim(), type: '其他' };
    });
  } else {
    const petNames = getR('寵物名稱').split('、').filter(Boolean);
    const petType  = getS('寵物種類');
    pets = petNames.map((name, i) => ({ name, type: i === 0 ? petType : '其他' }));
  }

  cleanNotes = rawNote
    .replace(/^📅 服務日期：[^\n]+\n?/m, '')
    .replace(/^🐾 寵物資訊：[^\n]+\n?/m, '')
    .trim();

  return {
    id: page.id, title: getT('預約名稱'),
    ownerName: getR('飼主姓名'), ownerPhone: getP('飼主電話'),
    pets, serviceType: getS('服務類型'), dates,
    timeOfDay: getS('時段'), appointmentTime: getR('指定時間'),
    duration: getN('服務時長(分鐘)'), price: getN('服務金額'),
    paid: getS('付款狀態') === '已付款',
    status: statusMap[getSt('預約狀態')] || 'pending',
    address: getR('服務地址'), notes: cleanNotes,
    hasVisitForm: getC('家訪表'),
  };
}

// 查詢並刪除對應家訪表
async function deleteRelatedVisitForms(bookingId) {
  if (!VF_DB_ID) return;
  try {
    // 查詢家訪表資料庫中 預約ID = bookingId 的記錄
    const r = await fetch(`https://api.notion.com/v1/databases/${VF_DB_ID}/query`, {
      method: 'POST', headers,
      body: JSON.stringify({
        filter: {
          property: '預約ID',
          rich_text: { equals: bookingId }
        },
        page_size: 10,
      }),
    });
    const data = await r.json();
    if (!r.ok || !data.results?.length) return;

    // 逐一封存（移入垃圾桶）
    await Promise.all(data.results.map(page =>
      fetch(`https://api.notion.com/v1/pages/${page.id}`, {
        method: 'PATCH', headers,
        body: JSON.stringify({ archived: true, in_trash: true }),
      })
    ));
  } catch (e) {
    console.error('刪除家訪表失敗:', e.message);
    // 不阻斷主流程
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      const r = await fetch(`https://api.notion.com/v1/databases/${DB_ID}/query`, {
        method: 'POST', headers, body: JSON.stringify({ page_size: 100 }),
      });
      const data = await r.json();
      if (!r.ok) return res.status(r.status).json(data);
      return res.json(data.results.map(fromNotion));
    }

    if (req.method === 'POST') {
      const r = await fetch('https://api.notion.com/v1/pages', {
        method: 'POST', headers,
        body: JSON.stringify({ parent: { database_id: DB_ID }, properties: toNotion(req.body) }),
      });
      const data = await r.json();
      if (!r.ok) return res.status(r.status).json(data);
      return res.json(fromNotion(data));
    }

    if (req.method === 'PATCH') {
      const { id, ...body } = req.body;
      const r = await fetch(`https://api.notion.com/v1/pages/${id}`, {
        method: 'PATCH', headers,
        body: JSON.stringify({ properties: toNotion(body) }),
      });
      const data = await r.json();
      if (!r.ok) return res.status(r.status).json(data);
      return res.json(fromNotion(data));
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;

      // 同步刪除對應家訪表
      await deleteRelatedVisitForms(id);

      // 刪除預約本身
      const r = await fetch(`https://api.notion.com/v1/pages/${id}`, {
        method: 'PATCH', headers,
        body: JSON.stringify({ archived: true, in_trash: true }),
      });
      const data = await r.json();
      if (!r.ok) return res.status(r.status).json(data);
      return res.json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
