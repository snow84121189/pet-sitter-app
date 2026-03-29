const NOTION_TOKEN = process.env.NOTION_TOKEN;
const DB_ID = process.env.NOTION_VISITFORMS_DB_ID;

const headers = {
  'Authorization': `Bearer ${NOTION_TOKEN}`,
  'Content-Type': 'application/json',
  'Notion-Version': '2022-06-28',
};

function toNotion(f) {
  const r = t => [{ text: { content: t || '' } }];
  return {
    '家訪表名稱': { title: r(f.title || '') },
    '飼主姓名': { rich_text: r(f.飼主姓名 || '') },
    '飼主電話': { phone_number: f.飼主電話 || null },
    '緊急聯絡人': { rich_text: r(f.contact || '') },
    '寵物名稱': { rich_text: r(f.寵物名稱 || '') },
    '寵物種類': { select: f.寵物種類 ? { name: f.寵物種類 } : null },
    '服務類型': { select: f.服務類型 ? { name: f.服務類型 } : null },
    '是否結紮': { select: f.neutered ? { name: f.neutered } : null },
    '疫苗驅蟲': { select: f.vaccine ? { name: f.vaccine } : null },
    '可與其他寵物相處': { select: f.withPets ? { name: f.withPets } : null },
    '食物過敏': { rich_text: r(f.snack || '') },
    '用餐習慣': { rich_text: r(f.mealHabit || '') },
    '個性描述': { rich_text: r(f.personality || '') },
    '健康狀況/用藥': { rich_text: r(f.health || '') },
    '分離焦慮': { select: f.anxiety ? { name: f.anxiety } : null },
    '攻擊性': { select: f.aggressive ? { name: f.aggressive } : null },
    '特殊注意事項': { rich_text: r(f.special || '') },
    '常去動物醫院': { rich_text: r(f.vet || '') },
    '寵物保險': { select: f.insurance ? { name: f.insurance } : null },
    '鑰匙交付方式': { rich_text: r(f.keyHandover || '') },
    '家訪完成': { checkbox: !!f.done },
    ...(f.visitDate ? { '家訪日期': { date: { start: f.visitDate } } } : {}),
  };
}

function fromNotion(page) {
  const p = page.properties;
  const getT = f => p[f]?.title?.[0]?.plain_text || '';
  const getR = f => p[f]?.rich_text?.[0]?.plain_text || '';
  const getS = f => p[f]?.select?.name || '';
  const getC = f => p[f]?.checkbox ?? false;
  const getP = f => p[f]?.phone_number || '';
  return {
    id: page.id,
    title: getT('家訪表名稱'),
    飼主姓名: getR('飼主姓名'),
    飼主電話: getP('飼主電話'),
    contact: getR('緊急聯絡人'),
    寵物名稱: getR('寵物名稱'),
    寵物種類: getS('寵物種類'),
    服務類型: getS('服務類型'),
    neutered: getS('是否結紮'),
    vaccine: getS('疫苗驅蟲'),
    withPets: getS('可與其他寵物相處'),
    snack: getR('食物過敏'),
    mealHabit: getR('用餐習慣'),
    personality: getR('個性描述'),
    health: getR('健康狀況/用藥'),
    anxiety: getS('分離焦慮'),
    aggressive: getS('攻擊性'),
    special: getR('特殊注意事項'),
    vet: getR('常去動物醫院'),
    insurance: getS('寵物保險'),
    keyHandover: getR('鑰匙交付方式'),
    done: getC('家訪完成'),
  };
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
