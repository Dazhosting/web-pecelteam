import axios from 'axios';

const models = [
  "chatgpt41mini",
  "chatgpt",
  "chatgpto1p",
  "claude",
  "gemini",
  "mistral",
  "grok",
];

async function getCsrfToken() {
  const res = await axios.get("https://app.claila.com/api/v2/getcsrftoken", {
    headers: {
      authority: "app.claila.com",
      accept: "*/*",
      origin: "https://www.claila.com",
      referer: "https://www.claila.com/",
      "user-agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36",
    },
  });
  return res.data;
}

async function sendMessageToModel(model, message = "hai") {
  const csrfToken = await getCsrfToken();

  const res = await axios.post(
    `https://app.claila.com/api/v2/unichat1/${model}`,
    new URLSearchParams({
      calltype: "completion",
      message: message,
      sessionId: Date.now(),
    }),
    {
      headers: {
        authority: "app.claila.com",
        accept: "*/*",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        origin: "https://app.claila.com",
        referer: "https://app.claila.com/chat?uid=5044b9eb&lang=en",
        "user-agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36",
        "x-csrf-token": csrfToken,
        "x-requested-with": "XMLHttpRequest",
      },
    }
  );

  return res.data;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Gunakan method GET' });
  }

  const { query, model = "claude" } = req.query;

  if (!query) {
    return res.status(400).json({
      creator: "Zypher",
      error: "Query Harus di isi query=hallo"
    });
  }

  if (!model || !models.includes(model)) {
    return res.status(400).json({
      creator: "Zypher",
      error: `Model tidak valid. Gunakan salah satu dari: ${models.join(', ')}`
    });
  }

  try {
    const response = await sendMessageToModel(model, query);
    res.status(200).json({
    creator: "Zypher",
    response: response
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Terjadi kesalahan saat menghubungi Claila' });
  }
}
  
