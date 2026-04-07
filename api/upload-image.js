const CLOUD_NAME   = process.env.CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = 'pet_sitter'; // Cloudinary unsigned preset 名稱

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { data } = req.body; // base64 字串，含 data:image/...;base64, 前綴

    if (!data) return res.status(400).json({ error: '缺少圖片資料' });

    // 用 FormData 傳送到 Cloudinary（unsigned upload 不需要簽名）
    const formData = new URLSearchParams();
    formData.append('file', data);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', 'pet-sitter');

    const r = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      }
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
