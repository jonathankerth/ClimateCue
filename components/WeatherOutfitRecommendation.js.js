import React, { useState, useEffect } from "react"
import axios from "axios"

const WeatherOutfitRecommendation = ({ weatherData }) => {
  const [recommendation, setRecommendation] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (weatherData) {
      getOutfitRecommendation()
    }
  }, [weatherData])

  const getOutfitRecommendation = async () => {
    setIsLoading(true)
    try {
      const weatherCondition = weatherData.weather[0].main
      const temperature = Math.round(weatherData.main.temp)
      const message = `Can you provide a brief 2-3 sentence clothing recommendation for weather that is ${weatherCondition} and ${temperature} degrees?`

      const response = await axios.post(
        "https://kitchengpt.herokuapp.com/chat",
        {
          message: message,
        }
      )

      setRecommendation(response.data)
    } catch (error) {
      console.error("Error fetching outfit recommendation:", error)
      setRecommendation("Could not get recommendation.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative flex flex-col max-w-[500px] w-full m-auto p-4 text-gray-300 z-10 bg-black/50 backdrop-blur-md rounded-lg shadow-lg">
      <di id="outfit-rec" v>
        <h3 className="text-xl font-bold mb-2">What to Wear?</h3>
        {isLoading ? <p>Loading recommendation...</p> : <p>{recommendation}</p>}
      </di>
    </div>
  )
}

export default WeatherOutfitRecommendation
