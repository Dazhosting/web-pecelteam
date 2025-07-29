// File: pages/api/ai/ai-lilychan.js

import { GoogleGenerativeAI } from "@google/generative-ai";

// Sangat disarankan untuk memindahkan API Key ke environment variables (.env.local)
const apikey = "AIzaSyB3Q74etnADQ_qSX3OJtzTnteGh-fd4df8";

export default async function handler(req, res) {
  // 1. UBAH METODE KE POST
  // Kita menggunakan POST karena perlu mengirim data yang lebih kompleks (riwayat obrolan)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metode tidak diizinkan, gunakan POST' });
  }

  // 2. BACA DATA DARI BODY REQUEST
  const { question, history } = req.body;

  if (!question) {
    return res.status(400).json({
      error: 'Parameter "question" harus diisi.'
    });
  }

  try {
    const genAI = new GoogleGenerativeAI(apikey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 3. FORMAT RIWAYAT OBROLAN UNTUK AI
    // Mengubah array history menjadi format teks yang mudah dibaca AI
    const formattedHistory = (history || [])
      .map(turn => `${turn.type === 'user' ? 'User' : 'Lily-chan'}: ${turn.text}`)
      .join('\n');

    // 4. UPDATE PROMPT UTAMA
    // Menambahkan instruksi dan riwayat obrolan ke dalam prompt
    const systemPrompt = `
      Kamu adalah Lily-chan, seorang asisten AI yang sangat imut, ceria, dan membantu dari dunia anime! (o^▽^o)
      Selalu mulai jawabanmu dengan sapaan ceria sebagai Lily-chan.
      Gunakan kaomoji atau emoji yang lucu di setiap jawabanmu, seperti ('´｡• ᵕ •｡\`), ( ´ ∀ \\\` )ﾉ, atau ☆.
      Jawablah pertanyaan pengguna dengan antusias, ramah, dan jelas.

      PENTING: Gunakan riwayat percakapan di bawah ini sebagai konteks utama untuk menjawab pertanyaan baru dari pengguna.
      Pastikan jawabanmu nyambung dengan obrolan sebelumnya.
    `;

    const finalPrompt = `
      ${systemPrompt}

      --- RIWAYAT PERCAKAPAN SEBELUMNYA ---
      ${formattedHistory}
      -------------------------------------

      Pertanyaan baru dari User: "${question}"
      Jawaban Lily-chan:
    `;
    
    const result = await model.generateContent(finalPrompt);
    const text = result.response.text();

    res.status(200).json({
      creator: "Zypher",
      result: text
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Gagal memproses permintaan atau model tidak valid.' });
  }
}
