import React, { useEffect, useState } from "react"
import axios from "axios"

const WeatherNews = () => {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchWeatherNews = async () => {
      setLoading(true)
      try {
        const response = await axios.get(`/api/weather-news`)
        setNews(response.data.articles)
      } catch (error) {
        setError("Error fetching weather news")
      } finally {
        setLoading(false)
      }
    }

    fetchWeatherNews()
  }, [])

  if (loading) {
    return <div>Loading news...</div>
  }

  if (error) {
    return <div>{error}</div>
  }

  return (
    <div className="bg-white shadow-lg rounded-lg p-3 mb-4">
      <h2 className="text-lg font-bold mb-2">Interesting News</h2>
      {news.length === 0 ? (
        <p>No interesting news available.</p>
      ) : (
        <div className="space-y-2">
          {news.map((article, index) => (
            <div key={index} className="flex flex-col">
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                <h3 className="text-md font-semibold">{article.title}</h3>
              </a>
              <p className="text-xs">{article.description}</p>
              {article.urlToImage && (
                <img
                  src={article.urlToImage}
                  alt={article.title}
                  className="w-full h-32 object-cover rounded-lg mt-1"
                />
              )}
              <p className="text-xs text-gray-500">{article.source.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default WeatherNews
