import axios from 'axios'

const validAgents = ['luminai', 'naruto', 'mari', 'ambatron', 'hoshino', 'latukam']

function generateRandomUser() {
  const randomNumber = Math.floor(Math.random() * 100000)
  return `user-${randomNumber.toString().padStart(5, '0')}`
}

function getRandomAgent() {
  return validAgents[Math.floor(Math.random() * validAgents.length)]
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ status: false, message: 'Method Not Allowed' })
  }

  const { q } = req.q

  if (!q) {
    return res.status(400).json({
      creator: 'Zypher',
      message: 'Missing content query parameter'
    })
  }

  const user = generateRandomUser()
  const agent = getRandomAgent()

  try {
    const response = await axios.post(
      'https://luminai.my.id/',
      { q, user, agent },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-XSS-Protection': '1; mode=block',
          'X-Content-Type-Options': 'nosniff',
          'Referrer-Policy': 'strict-origin-when-cross-origin'
        },
        timeout: 10000
      }
    )

    return res.status(200).json({
      creator: 'Zypher',
      result: response.data
    })
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: 'Failed to fetch from LuminAI',
      error: error.response?.data || error.message
    })
  }
}
