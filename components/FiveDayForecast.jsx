import React from "react"
import Image from "next/image"

const FiveDayForecast = ({ forecast, isCelsius }) => {
  const toCelsius = (fahrenheit) => {
    return ((fahrenheit - 32) * 5) / 9
  }

  if (!forecast || !Array.isArray(forecast) || forecast.length === 0) {
    return (
      <div className="text-center text-gray-500 text-lg">
        No forecast data available.
      </div>
    )
  }

  return (
    <div
      id="five-day-forecast"
      className="w-full animate-slide-in-up"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {forecast.map((day, index) => (
          <div
            key={day.dt}
            className="group backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/20 rounded-xl p-6 shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex flex-col items-center text-center space-y-3">
              <p className="font-semibold text-lg text-white/90">
                {new Date(day.dt * 1000).toLocaleDateString(undefined, {
                  weekday: "short",
                })}
              </p>
              <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-400/20 to-purple-600/20 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Image
                  src={`http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
                  alt="weather icon"
                  width={64}
                  height={64}
                  className="relative z-10 drop-shadow-lg"
                />
              </div>
              <div className="space-y-2">
                <p className="font-bold text-2xl text-white">
                  {isCelsius
                    ? `${Math.round(toCelsius(day.temp.day))}°`
                    : `${Math.round(day.temp.day)}°`}
                </p>
                <p className="text-sm text-white/70 capitalize font-medium">
                  {day.weather[0].description}
                </p>
              </div>
              <div className="flex justify-between w-full text-xs text-white/60">
                <span>H: {isCelsius ? `${Math.round(toCelsius(day.temp.max))}°` : `${Math.round(day.temp.max)}°`}</span>
                <span>L: {isCelsius ? `${Math.round(toCelsius(day.temp.min))}°` : `${Math.round(day.temp.min)}°`}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default FiveDayForecast
