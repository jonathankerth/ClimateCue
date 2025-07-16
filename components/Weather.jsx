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
      className="relative w-full max-w-2xl mx-auto"
    >
      {/* Main Weather Card */}
      <div className="backdrop-blur-md bg-gradient-to-br from-white/20 to-white/10 border border-white/30 rounded-3xl p-8 shadow-2xl">
        {/* Current Weather Display */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Left side - Temperature and Icon */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            <div className="flex items-center gap-6 mb-4">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full blur opacity-30"></div>
                <Image
                  src={`http://openweathermap.org/img/wn/${weather[0].icon}@2x.png`}
                  alt="weather icon"
                  width={120}
                  height={120}
                  className="relative z-10 drop-shadow-lg"
                />
              </div>
              <div>
                <p className="text-8xl font-bold text-white drop-shadow-lg">
                  {Math.round(displayTemp)}°
                </p>
                <p className="text-xl text-white/80 font-medium">
                  {isCelsius ? "Celsius" : "Fahrenheit"}
                </p>
              </div>
            </div>
            <p className="text-2xl capitalize text-white/90 font-semibold mb-4">
              {weather[0].description}
            </p>
            <TemperatureSwitch isCelsius={isCelsius} onToggle={onToggle} />
          </div>

          {/* Right side - Weather Stats */}
          <div className="grid grid-cols-3 gap-6 w-full lg:w-auto">
            <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-white mb-2">
                {Math.round(displayFeelsLike)}°
              </div>
              <p className="text-white/70 text-sm font-medium">Feels Like</p>
            </div>
            <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-white mb-2">
                {humidity}%
              </div>
              <p className="text-white/70 text-sm font-medium">Humidity</p>
            </div>
            <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-white mb-2">
                {Math.round(wind_speed)}
              </div>
              <p className="text-white/70 text-sm font-medium">Wind m/s</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Weather
