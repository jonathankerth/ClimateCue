import axios from "axios"

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Check if NEWS_API_KEY is available
    if (!process.env.NEWS_API_KEY) {
      return res.status(500).json({ error: 'NEWS_API_KEY not configured' })
    }

    const response = await axios.get("https://newsapi.org/v2/everything", {
      params: {
        q: "weather",
        pageSize: 3,
        apiKey: process.env.NEWS_API_KEY,
        language: "en",
      },
    })

    res.status(200).json(response.data)
  } catch (error) {
    console.error("Error fetching weather news:", error)
    res.status(500).json({ error: "Error fetching weather news" })
  }
}
