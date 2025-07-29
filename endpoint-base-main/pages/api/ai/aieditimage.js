import axios from 'axios';
import FileType from 'file-type';
import FormData from 'form-data';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const config = {
  api: {
    bodyParser: false,
  },
};

// Upload ke ulzneko-ups
async function uploadNeko(buffer) {
  try {
    const type = await FileType.fromBuffer(buffer);
    const form = new FormData();
    form.append('file', buffer, {
      filename: 'upload.' + (type?.ext || 'bin'),
      contentType: type?.mime || 'application/octet-stream',
    });

    const { data } = await axios.post('https://ulzneko-ups.hf.space/upload', form, {
      headers: form.getHeaders(),
      maxBodyLength: Infinity,
    });

    if (!data?.success) throw new Error(data.message || 'Upload gagal.');
    return data.url;
  } catch (err) {
    throw new Error('Gagal upload: ' + err.message);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Only GET allowed' });
  }

  const { prompt, image } = req.query;

  if (!prompt || !image) {
    return res.status(400).json({
      creator: "Zypher",
      error: 'Missing `prompt` or `image` URL'
    });
  }

  try {
    // Ambil gambar dari URL
    const imageRes = await axios.get(image, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(imageRes.data);
    const imageBase64 = imageBuffer.toString('base64');

    // Inisialisasi Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyB8T-3WnKqDbK3GSYYUtTiyDfIV-vBxoPw');

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
    });

    // Generate konten dengan format yang benar
    const result = await model.generateContent([
      { text: prompt },
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: imageBase64,
        },
      },
    ]);

    const response = result?.response;
    const parts = response?.candidates?.[0]?.content?.parts || [];
    const imagePart = parts.find(p => p.inlineData?.data);

    if (!imagePart) {
      return res.status(500).json({
        creator: "Zypher",
        error: 'Tidak ada gambar yang dihasilkan dari Gemini'
      });
    }

    const resultBuffer = Buffer.from(imagePart.inlineData.data, 'base64');
    const uploadedUrl = await uploadNeko(resultBuffer);

    return res.status(200).json({
      creator: "Zypher",
      message: '✅ Gambar berhasil diedit dan diupload',
      imageUrl: uploadedUrl,
    });

  } catch (err) {
    console.error('Error:', err.message);
    return res.status(500).json({
      creator: "Zypher",
      error: 'Internal Error',
      detail: err.message
    });
  }
}
