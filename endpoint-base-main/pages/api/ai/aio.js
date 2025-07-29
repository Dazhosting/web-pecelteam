import crypto from 'crypto';
import axios from 'axios';

function generateSessionId() {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let s = "";
  for (let i = 0; i < 10; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `4ksave_${s}_${Date.now()}`;
}

const pemKey = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDCAdf/EyIbLBxjGqmh7qLU6/CPCzru+75+82OSPZ+nf4BFvg88drpZ6KigNW0J8TNgxe6Yms1irCZNVDyu+RXsl4y/7c2KOHc4OGTzHB5fUMiMasFUvcEs2P70e6yA/sKHZfBLG1XPhlb84Ibs3nhD3W5e2SuC+4EuVkaqzN08LQIDAQAB
-----END PUBLIC KEY-----`;

const createDlUrl = (token, sessionId) =>
  token && `https://api.4ksave.com/st-tik/token/${token}?sessionid=${sessionId}&wh=www.4ksave.com&status=download`;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      creator: "Zypher",
      error: 'Gunakan method GET.'
    });
  }

  const { url } = req.query;
  if (!url) return res.status(400).json({
    creator: "Zypher",
    error: 'Parameter ?url= tidak ada.'
  });

  const sessionId = generateSessionId();

  let xSecureMessage;
  try {
    xSecureMessage = crypto.publicEncrypt(
      {
        key: pemKey,
        padding: crypto.constants.RSA_PKCS1_PADDING
      },
      Buffer.from(Date.now().toString())
    ).toString('base64');
  } catch (err) {
    return res.status(500).json({
      creator: "Zypher",
      error: 'Error encrypt: ' + err.message
    });
  }

  const urlType =
    /(fb|facebook)\./i.test(url) ? 'fb' :
    url.includes('instagram.') ? 'ig' : 'tt';

  const urlMapping = {
    fb: {
      path: '-video/fb',
      parse: (data) => ({
        type: 'facebook',
        download: data.fbBos.map(v => ({
          ...v,
          cover: createDlUrl(v.cover, sessionId),
          url: createDlUrl(v.url, sessionId),
          thumb: createDlUrl(v.thumb, sessionId)
        }))
      })
    },
    ig: {
      path: '/ins',
      parse: (data) => ({
        type: 'instagram',
        download: data.insBos.map(v => ({
          ...v,
          cover: createDlUrl(v.cover, sessionId),
          url: createDlUrl(v.url, sessionId),
          thumb: createDlUrl(v.thumb, sessionId)
        }))
      })
    },
    tt: {
      path: '/tiktok',
      parse: (data) => ({
        type: 'tiktok',
        download: {
          withoutWatermark: createDlUrl(data.withoutWaterMarkMp4, sessionId),
          watermark: createDlUrl(data.waterMarkMp4, sessionId),
          audio: createDlUrl(data.mp3, sessionId)
        },
        info: {
          desc: data.desc,
          author: data.author,
          duration: data.duration,
          cover: data.cover
        }
      })
    }
  };

  const target = urlMapping[urlType];
  if (!target) return res.status(400).json({
    creator: "Zypher",
    error: 'URL tidak valid atau tidak didukung.'
  });

  const apiUrl = `https://api.4ksave.com/st-tik${target.path}/dl?url=${encodeURIComponent(url)}&sessionid=${sessionId}`;
  const headers = {
    'accept': 'application/json, text/plain, */*',
    'x-secure-message': xSecureMessage,
    'x-robots-tag': 'noindex, nofollow',
    'user-agent': 'okhttp/4.12.0'
  };

  try {
    const response = await axios.get(apiUrl, {
      headers,
      referrer: 'https://www.4ksave.com/',
      referrerPolicy: 'strict-origin-when-cross-origin'
    });

    const parsed = target.parse(response.data?.result);

    return res.status(200).json({
      creator: "Zypher",
      ...parsed
    });
  } catch (err) {
    return res.status(500).json({
      status: 'error',
      creator: "Zypher",
      message: err.message,
      detail: err.response?.data || null
    });
  }
}
