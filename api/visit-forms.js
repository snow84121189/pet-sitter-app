const NOTION_TOKEN = process.env.NOTION_TOKEN;
const DB_ID = process.env.NOTION_VISITFORMS_DB_ID;

const headers = {
  'Authorization': `Bearer ${NOTION_TOKEN}`,
  'Content-Type': 'application/json',
  'Notion-Version': '2022-06-28',
};

// 所有家訪表欄位對應 Notion 欄位名稱
const FIELD_MAP = {
  // 通用
  vaccine:     '疫苗驅蟲',
  neutered:    '是否結紮',
  withPets:    '可與其他寵物相處',
  withKids:    '與小孩相處',
  snack:       '食物過敏',
  mealHabit:   '用餐習慣',
  mealNote:    '用餐情況',
  personality: '個性描述',
  health:      '健康狀況/用藥',
  aggressive:  '攻擊性',
  destructive: '拆家行為',
  anxiety:     '分離焦慮',
  special:     '特殊注意事項',
  vet:         '常去動物醫院',
  contact:     '緊急聯絡人',
  insurance:   '寵物保險',
  keyHandover: '鑰匙交付方式',
  camera:      '攝影機需求',
  // 安親寄宿專屬
  sleepHabit:  '睡眠習慣',
  carReact:    '對車輛反應',
  dogReact:    '對狗狗反應',
  streetReact: '對街道反應',
  // 到府照顧 / 陪伴散步 專屬
  timeSlot:    '指定時段',
  restArea:    '休息區域',
  cleanArea:   '清理區域',
  catLitter:   '貓砂處理',
  comfort:     '安撫方式',
  extraService:'其他服務',
  multiPet:    '多寵相處',
  // 陪伴散步專屬
  humanReact:  '對陌生人反應',
  walkRoute:   '散步路線',
  // 美容專屬
  skinAllergy: '皮膚過敏',
  shampoo:     '洗毛精提供',
  nailTrim:    '剪指甲',
  pawTrim:     '修腳底毛',
  buttTrim:    '修屁股毛',
  // 圖片（儲存逗號分隔的 Cloudinary URL，遠短於 2000 字元限制）
  imageUrls:   '圖片網址',
};

// Select 欄位（用 select，其餘用 rich_text）
const SELECT_FIELDS = new Set(['vaccine','neutered','withPets','aggressive','anxiety','insurance']);

function toNotion(f) {
  const r = t => [{ text: { content: (t || '').slice(0, 2000) } }];
  const petDetail = (f.pets || []).length > 0
    ? f.pets.map(p => `${p.name}(${p.type})`).join('、')
    : (f.寵物名稱 ? `${f.寵物名稱}(${f.寵物種類 || '其他'})` : '');

  const props = {
    '家訪表名稱':   { title: r(f.title || '') },
    '飼主姓名':     { rich_text: r(f.飼主姓名 || '') },
    '飼主電話':     { phone_number: f.飼主電話 || null },
    '寵物名稱':     { rich_text: r(f.寵物名稱 || '') },
    '寵物種類':     { select: f.寵物種類 ? { name: f.寵物種類 } : null },
    '寵物詳細資訊': { rich_text: r(petDetail) },
    '預約ID':       { rich_text: r(f.bookingId || '') },
    '服務類型':     { select: f.服務類型 ? { name: f.服務類型 } : null },
    '家訪完成':     { checkbox: !!f.done },
    ...(f.visitDate ? { '家訪日期': { date: { start: f.visitDate } } } : {}),
  };

  // 動態寫入所有家訪欄位
  for (const [key, notionField] of Object.entries(FIELD_MAP)) {
    const val = f[key];
    if (val === undefined || val === null) continue;
    if (SELECT_FIELDS.has(key)) {
      props[notionField] = val ? { select: { name: val } } : { select: null };
    } else {
      props[notionField] = { rich_text: r(String(val)) };
    }
  }

  return props;
}

function fromNotion(page) {
  const p = page.properties;
  const getT = f => p[f]?.title?.[0]?.plain_text || '';
  const getR = f => p[f]?.rich_text?.[0]?.plain_text || '';
  const getS = f => p[f]?.select?.name || '';
  const getC = f => p[f]?.checkbox ?? false;
  const getP = f => p[f]?.phone_number || '';

  const result = {
    id:       page.id,
    bookingId: getR('預約ID'),
    title:    getT('家訪表名稱'),
    飼主姓名: getR('飼主姓名'),
    飼主電話: getP('飼主電話'),
    寵物名稱: getR('寵物名稱'),
    寵物種類: getS('寵物種類'),
    服務類型: getS('服務類型'),
    done:     getC('家訪完成'),
  };

  // 動態讀取所有家訪欄位
  for (const [key, notionField] of Object.entries(FIELD_MAP)) {
    if (!p[notionField]) continue;
    result[key] = SELECT_FIELDS.has(key) ? getS(notionField) : getR(notionField);
  }

  return result;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,OPTIONS');
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

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
