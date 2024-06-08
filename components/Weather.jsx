import Image from "next/image"
import React from "react"
import TemperatureSwitch from "./TemperatureSwitch"

const Weather = ({ data, isCelsius, onToggle }) => {
  if (
    !data ||
    !data.current ||
    !data.current.weather ||
    data.current.weather.length === 0
  ) {
    console.log("No data to display")
    return null
  }

  const { temp, feels_like, humidity, wind_speed, weather } = data.current
  const location = data.name ? data.name : ""
  const state = data.state ? data.state : ""
  const country = data.country ? data.country : ""

  const toFahrenheit = (celsius) => (celsius * 9) / 5 + 32

  const displayTemp = isCelsius ? temp : toFahrenheit(temp)
  const displayFeelsLike = isCelsius ? feels_like : toFahrenheit(feels_like)

  console.log("Display temperature:", displayTemp)
  console.log("Display feels like:", displayFeelsLike)

  return (
    <div
      id="weather-data"
      className="relative flex flex-col max-w-[500px] w-full m-auto p-6 text-gray-800 bg-white bg-opacity-70 backdrop-blur-md rounded-lg shadow-lg"
    >
      {/* Location */}
      <div className="text-center mb-4">
        <h2 className="text-3xl font-bold">{location}</h2>
        <p className="text-lg">
          {state ? `${state}, ` : ""}
          {country}
        </p>
      </div>

      {/* Current Weather */}
      <div className="flex flex-col items-center text-center mb-6">
        <Image
          src={`http://openweathermap.org/img/wn/${weather[0].icon}.png`}
          alt="weather icon"
          width={100}
          height={100}
        />
        <p className="text-2xl capitalize">{weather[0].description}</p>
        <p className="text-7xl font-bold">
          {isCelsius
            ? `${Math.round(displayTemp)}°C`
            : `${Math.round(displayTemp)}°F`}
        </p>
        <TemperatureSwitch isCelsius={isCelsius} onToggle={onToggle} />
      </div>

      {/* Weather Details */}
      <div className="flex justify-between p-4 border-t border-gray-400/50">
        <div className="text-center">
          <p className="font-bold text-xl">
            {isCelsius
              ? `${Math.round(displayFeelsLike)}°C`
              : `${Math.round(displayFeelsLike)}°F`}
          </p>
          <p>Feels Like</p>
        </div>
        <div className="text-center">
          <p className="font-bold text-xl">{humidity}%</p>
          <p>Humidity</p>
        </div>
        <div className="text-center">
          <p className="font-bold text-xl">{Math.round(wind_speed)} m/s</p>
          <p>Winds</p>
        </div>
      </div>
    </div>
  )
}

export default Weather
