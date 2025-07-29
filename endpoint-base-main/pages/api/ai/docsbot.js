import axios from 'axios';
import UserAgent from 'user-agents';

const vibeList = ['fun', 'joke', 'funny', 'happy', 'serious', 'sad', 'angry', 'ecstatic', 'curious', 'informative', 'cute', 'cool', 'controversial'];
const typeList = ['ocr', 'toprompt', 'todesc', 'tocaption'];

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Gunakan method GET' });
  }

  const { url, type = 'ocr', vibe = 'fun' } = req.query;

  if (!url) return res.status(400).json({ error: 'Parameter url diperlukan' });
  if (!typeList.includes(type)) return res.status(400).json({ error: `Tipe tidak valid. Pilih: ${typeList.join(', ')}` });
  if (type === 'tocaption' && !vibeList.includes(vibe)) return res.status(400).json({ error: `Vibe tidak valid. Pilih: ${vibeList.join(', ')}` });

  try {
    // Ambil gambar dari URL
    const imageResponse = await axios.get(url, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(imageResponse.data, 'binary');

    // Kirim ke docsbot
    const { data } = await axios.post('https://docsbot.ai/api/tools/image-prompter', {
      image: buffer.toString('base64'),
      type: type === 'toprompt' ? 'prompt' : type === 'todesc' ? 'description' : type === 'ocr' ? 'text' : 'caption',
      ...(type === 'tocaption' && { vibe }),
    }, {
      headers: {
        'content-type': 'application/json',
        'user-agent': new UserAgent().toString(),
      },
    });

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Gagal mengambil atau memproses gambar' });
  }
}
