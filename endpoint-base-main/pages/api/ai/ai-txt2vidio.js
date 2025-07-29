import axios from 'axios';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({
          creator: "Zypher",
          error: 'Hanya GET method yang didukung'
        });
    }

    const { prompt } = req.query;
    if (!prompt) {
        return res.status(400).json({
          creator: "Zypher",
          error: 'Prompt tidak boleh kosong'
        });
    }

    try {
        const { data: k } = await axios.post('https://soli.aritek.app/txt2videov3', {
            deviceID: Math.random().toString(16).substr(2, 8) + Math.random().toString(16).substr(2, 8),
            prompt: prompt,
            used: [],
            versionCode: 51
        }, {
            headers: {
                authorization: 'eyJzdWIiwsdeOiIyMzQyZmczNHJ0MzR0weMzQiLCJuYW1lIjorwiSm9objMdf0NTM0NT',
                'content-type': 'application/json; charset=utf-8',
                'accept-encoding': 'gzip',
                'user-agent': 'okhttp/4.11.0'
            }
        });

        const { data } = await axios.post('https://soli.aritek.app/video', {
            keys: [k.key]
        }, {
            headers: {
                authorization: 'eyJzdWIiwsdeOiIyMzQyZmczNHJ0MzR0weMzQiLCJuYW1lIjorwiSm9objMdf0NTM0NT',
                'content-type': 'application/json; charset=utf-8',
                'accept-encoding': 'gzip',
                'user-agent': 'okhttp/4.11.0'
            }
        });

        return res.status(200).json({
          creator: "Zypher",
          url: data.datas[0].url
        });

    } catch (error) {
        console.error(error.message);
        return res.status(500).json({
          creator: "Zypher",
          error: 'Gagal menghasilkan video'
        });
    }
}
