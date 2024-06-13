import axios from "axios"

export default async (req, res) => {
  try {
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
