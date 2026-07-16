const CLOUD_NAME    = process.env.CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = 'pet_sitter';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { data } = req.body;
    if (!data) return res.status(400).json({ error: '缺少圖片資料' });

    // 用原生 FormData（Node 18+ 支援）
    const form = new FormData();
    form.append('file', data);                 // base64 data URI
    form.append('upload_preset', UPLOAD_PRESET);

    const r = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      { method: 'POST', body: form }
    );

    const text = await r.text();               // 先拿 text，避免 JSON parse 錯誤遮蓋原始訊息
    let result;
    try { result = JSON.parse(text); }
    catch { return res.status(500).json({ error: `Cloudinary 回應非 JSON：${text.slice(0,200)}` }); }

    if (!r.ok || result.error) {
      return res.status(400).json({ error: result.error?.message || `HTTP ${r.status}` });
    }

    return res.json({ url: result.secure_url });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

// 告訴 Vercel 允許較大的 body（上限 10MB）
export const config = { api: { bodyParser: { sizeLimit: '10mb' } } };
