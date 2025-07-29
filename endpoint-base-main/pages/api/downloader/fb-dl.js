import axios from 'axios'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      creator: 'Zypher',
      message: 'Method Not Allowed'
    })
  }

  const { url } = req.query

  if (!url) {
    return res.status(400).json({
      creator: 'Zypher',
      message: '"url" mana anjir Adohh '
    })
  }

  try {
    const response = await axios.post(
      'https://kithubs.com/api/video/facebook/download',
      { url },
      {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0',
          'Accept': '*/*',
          'Referer': 'https://kithubs.com/facebook-video-downloader'
        },
        timeout: 10000
      }
    )

    const { sd_url, hd_url, title } = response.data.data || {}

    if (!sd_url && !hd_url) {
      return res.status(404).json({
        creator: 'Zypher',
        message: '❌ Tidak ada link video ditemukan.'
      })
    }

    return res.status(200).json({
      creator: 'Zypher',
      title: title || 'Tanpa Judul',
      sd: sd_url || null,
      hd: hd_url || null
    })

  } catch (err) {
    return res.status(500).json({
      status: false,
      message: '❌ Gagal menghubungi server.',
      error: err.response?.data || err.message
    })
  }
}
