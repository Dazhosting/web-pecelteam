import fetch from 'node-fetch';
import unzipper from 'unzipper';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '25mb', // bisa diubah kalau perlu lebih besar
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      creator: "Zypher",
      error: 'Only POST method allowed',
    });
  }

  const { file, mimetype, name, token } = req.body;

  // Validasi input wajib
  if (!file || !name || !mimetype || !token) {
    return res.status(400).json({
      creator: "Zypher",
      error: 'Missing required fields: file, name, mimetype, token',
    });
  }

  const webName = name.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');
  const domainCheckUrl = `https://${webName}.vercel.app`;

  // Cek apakah domain sudah dipakai
  try {
    const check = await fetch(domainCheckUrl);
    if (check.status === 200) {
      return res.status(409).json({
        creator: "Zypher",
        error: `❌ Nama ${webName} sudah dipakai.`,
      });
    }
  } catch (e) {
    // Kalau error berarti belum ada, lanjut deploy
  }

  const filesToUpload = [];

  try {
    // === Kalau ZIP ===
    if (mimetype === 'application/zip') {
      const buffer = Buffer.from(file, 'base64');
      const zip = await unzipper.Open.buffer(buffer);

      for (const entry of zip.files) {
        if (entry.type === 'File') {
          const content = await entry.buffer();
          const filePath = entry.path.replace(/^(\.\/|\/)+/, '').replace(/\\/g, '/');
          filesToUpload.push({
            file: filePath,
            data: content.toString('base64'),
            encoding: 'base64',
          });
        }
      }

      if (!filesToUpload.some(f => f.file.toLowerCase().endsWith('index.html'))) {
        return res.status(400).json({
          creator: "Zypher",
          error: 'File index.html tidak ditemukan dalam ZIP!',
        });
      }

    // === Kalau HTML langsung ===
    } else if (mimetype === 'text/html') {
      filesToUpload.push({
        file: 'index.html',
        data: file,
        encoding: 'base64',
      });

    } else {
      return res.status(400).json({
        creator: "Zypher",
        error: 'Hanya menerima file ZIP (application/zip) atau HTML (text/html)',
      });
    }

    // === Deploy ke Vercel ===
    const deployRes = await fetch('https://api.vercel.com/v13/deployments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: webName,
        files: filesToUpload,
        projectSettings: { framework: null },
      }),
    });

    const deployData = await deployRes.json();

    if (!deployData.url) {
      return res.status(500).json({
        creator: "Zypher",
        error: 'Deploy gagal',
        detail: deployData,
      });
    }

    return res.status(200).json({
      creator: "Zypher",
      message: '✅ Web berhasil dideploy!',
      url: `https://${deployData.url}`
    });

  } catch (err) {
    return res.status(500).json({
      creator: "Zypher",
      error: 'Internal error',
      detail: err.message,
    });
  }
        }
