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
    return (
      <div className="flex items-center justify-center space-x-4 py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
        <span className="text-white/70 font-medium">Loading news...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-400 font-medium">{error}</div>
      </div>
    )
  }

  return (
    <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6 shadow-lg" id="news">
      <h2 className="text-xl font-bold mb-6 text-white text-center">
        Interesting News Around the World
      </h2>
      {news.length === 0 ? (
        <p className="text-center text-white/70">No interesting news available.</p>
      ) : (
        <div className="space-y-4">
          {news.map((article, index) => (
            <div key={index} className="backdrop-blur-md bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-all duration-200 transform hover:scale-[1.02] cursor-pointer">
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 text-white hover:text-blue-200 transition-colors duration-200"
              >
                <h3 className="text-lg font-semibold text-white mb-2 hover:text-blue-300 transition-colors duration-200">{article.title}</h3>
                <p className="text-sm text-white/70 mb-3">{article.description}</p>
                {article.urlToImage && (
                  <img
                    src={article.urlToImage}
                    alt={article.title}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                )}
                <p className="text-xs text-white/50">{article.source.name}</p>
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default WeatherNews
