import React, { useState, useEffect } from "react"
import axios from "axios"
import Image from "next/image"

const EightDayForecast = ({ city, isCelsius }) => {
  const [forecast, setForecast] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchEightDayForecast = async () => {
      if (!city) {
        setError("City name cannot be empty")
        return
      }
      setLoading(true)
      try {
        const geocodingUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${process.env.NEXT_PUBLIC_WEATHER_KEY}`
        const geocodingResponse = await axios.get(geocodingUrl)

        if (geocodingResponse.data.length === 0) {
          throw new Error("City not found")
        }

        const { lat, lon } = geocodingResponse.data[0]

        const forecastUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=imperial&exclude=minutely,hourly,current,alerts&appid=${process.env.NEXT_PUBLIC_WEATHER_KEY}`
        const forecastResponse = await axios.get(forecastUrl)

        if (forecastResponse.data && forecastResponse.data.daily) {
          setForecast(forecastResponse.data.daily.slice(0, 8))
        } else {
          setForecast([])
        }

        setError(null)
      } catch (error) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchEightDayForecast()
  }, [city])

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  const toCelsius = (fahrenheit) => {
    return ((fahrenheit - 32) * 5) / 9
  }

  return (
    <div className="relative flex flex-col max-w-[800px] w-full m-auto my-6 p-4 text-gray-300 bg-black/50 backdrop-blur-md rounded-lg shadow-lg">
      <h2 className="text-center text-3xl font-bold mb-4">
        8-Day Average Temperatures
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {forecast.map((day) => (
          <div
            key={day.dt}
            className="flex flex-col items-center p-4 bg-white/30 rounded-lg shadow-lg transform transition duration-500 hover:scale-105"
          >
            <p className="font-medium text-lg">
              {new Date(day.dt * 1000).toLocaleDateString(undefined, {
                weekday: "short",
              })}
            </p>
            <Image
              src={`http://openweathermap.org/img/wn/${day.weather[0].icon}.png`}
              alt="weather icon"
              width={64}
              height={64}
            />
            <p className="font-bold text-2xl">
              {isCelsius
                ? `${Math.round(toCelsius(day.temp.day))}°C`
                : `${Math.round(day.temp.day)}°F`}
            </p>
            <p className="text-sm capitalize">{day.weather[0].description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default EightDayForecast
