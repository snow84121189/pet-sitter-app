const CLOUD_NAME    = process.env.CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = 'pet_sitter'; // Cloudinary unsigned preset 名稱

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { data } = req.body;
    if (!data) return res.status(400).json({ error: '缺少圖片資料' });

    // 使用 FormData（瀏覽器/Node 18+ 原生支援）
    const body = new FormData();
    body.append('file', data);
    body.append('upload_preset', UPLOAD_PRESET);
    // ⚠️ 不傳 folder，避免 "Display name cannot contain slashes" 錯誤
    // folder 統一在 Cloudinary preset 裡設定

    const r = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      { method: 'POST', body }
    );

    const result = await r.json();

    if (!r.ok || result.error) {
      console.error('Cloudinary error:', result.error);
      return res.status(400).json({ error: result.error?.message || '上傳失敗' });
    }

    return res.json({ url: result.secure_url });
  } catch (e) {
    console.error('Upload error:', e);
    return res.status(500).json({ error: e.message });
  }
}
