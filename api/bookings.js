const NOTION_TOKEN = process.env.NOTION_TOKEN;
const DB_ID = process.env.NOTION_BOOKINGS_DB_ID;

const headers = {
  'Authorization': `Bearer ${NOTION_TOKEN}`,
  'Content-Type': 'application/json',
  'Notion-Version': '2022-06-28',
};

function toNotion(b) {
  const dates = b.dates || [];
  const noteLines = [];
  // 若有多個日期，把完整清單存進備註方便在 Notion 查看
  if (dates.length > 1) {
    noteLines.push(`📅 服務日期：${dates.join('、')}`);
  }
  if (b.notes) noteLines.push(b.notes);
  const notesText = noteLines.join('\n');

  return {
    '預約名稱':    { title: [{ text: { content: b.title || '' } }] },
    '飼主姓名':    { rich_text: [{ text: { content: b.ownerName || '' } }] },
    '飼主電話':    { phone_number: b.ownerPhone || null },
    '寵物名稱':    { rich_text: [{ text: { content: (b.pets||[]).map(p=>p.name).join('、') } }] },
    '寵物種類':    { select: b.pets?.[0]?.type ? { name: b.pets[0].type } : null },
    '服務類型':    { select: b.serviceType ? { name: b.serviceType } : null },
    '時段':        { select: b.timeOfDay ? { name: b.timeOfDay } : null },
    '指定時間':    { rich_text: [{ text: { content: b.appointmentTime || '' } }] },
    '服務時長(分鐘)': { number: b.duration || null },
    '服務金額':    { number: b.price || null },
    '付款狀態':    { select: b.paid ? { name: '已付款' } : { name: '未付款' } },
    '預約狀態':    { status: { name: b.status === 'completed' ? '完成' : b.status === 'confirmed' ? '進行中' : '未開始' } },
    '服務地址':    { rich_text: [{ text: { content: b.address || '' } }] },
    '備註':        { rich_text: [{ text: { content: notesText } }] },
    '家訪表':      { checkbox: !!b.hasVisitForm },
    // 服務開始日 = 第一天；服務結束日 = 最後一天（讓 Notion 月曆視圖可以顯示跨日範圍）
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

  // 從備註中還原完整日期清單
  const rawNote = getR('備註');
  let dates = [];
  let cleanNotes = rawNote;
  const dateLineMatch = rawNote.match(/^📅 服務日期：([^\n]+)/);
  if (dateLineMatch) {
    dates = dateLineMatch[1].split('、').map(d => d.trim()).filter(Boolean);
    cleanNotes = rawNote.replace(/^📅 服務日期：[^\n]+\n?/, '').trim();
  } else {
    // 沒有多日期備註，從開始/結束日重建
    const start = getD('服務開始日');
    const end   = getD('服務結束日');
    if (start) dates = (end && end !== start) ? [start, end] : [start];
  }

  const petNames = getR('寵物名稱').split('、').filter(Boolean);
  const petType  = getS('寵物種類');

  return {
    id:             page.id,
    title:          getT('預約名稱'),
    ownerName:      getR('飼主姓名'),
    ownerPhone:     getP('飼主電話'),
    pets:           petNames.map((name, i) => ({ name, type: i === 0 ? petType : '其他' })),
    serviceType:    getS('服務類型'),
    dates,
    timeOfDay:      getS('時段'),
    appointmentTime: getR('指定時間'),
    duration:       getN('服務時長(分鐘)'),
    price:          getN('服務金額'),
    paid:           getS('付款狀態') === '已付款',
    status:         statusMap[getSt('預約狀態')] || 'pending',
    address:        getR('服務地址'),
    notes:          cleanNotes,
    hasVisitForm:   getC('家訪表'),
  };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      const r = await fetch(`https://api.notion.com/v1/databases/${DB_ID}/query`, {
        method: 'POST', headers,
        body: JSON.stringify({ page_size: 100 }),
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
      const r = await fetch(`https://api.notion.com/v1/pages/${id}`, {
        method: 'PATCH', headers,
        body: JSON.stringify({ archived: true }),
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
