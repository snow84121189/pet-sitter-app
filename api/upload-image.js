const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY    = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { data, filename } = req.body; // data = base64 字串（含 data:image/...;base64, 前綴）

    // 產生 Cloudinary 簽名
    const timestamp = Math.round(Date.now() / 1000);
    const folder = 'pet-sitter';

    // 用 Node.js 內建 crypto 產生 SHA-1 簽名
    const crypto = await import('crypto');
    const signString = `folder=${folder}&timestamp=${timestamp}${API_SECRET}`;
    const signature = crypto.createHash('sha1').update(signString).digest('hex');

    // 呼叫 Cloudinary Upload API
    const formData = new URLSearchParams();
    formData.append('file', data);
    formData.append('api_key', API_KEY);
    formData.append('timestamp', timestamp);
    formData.append('signature', signature);
    formData.append('folder', folder);
    if (filename) formData.append('public_id', `${folder}/${Date.now()}`);

    const r = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      { method: 'POST', body: formData }
    );

    const result = await r.json();
    if (!r.ok || result.error) {
      return res.status(400).json({ error: result.error?.message || '上傳失敗' });
    }

    return res.json({ url: result.secure_url });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
