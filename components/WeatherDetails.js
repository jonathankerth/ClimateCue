import React from "react"

const WeatherDetails = ({ weatherData, isCelsius }) => {
  if (!weatherData || !weatherData.current) {
    return null
  }

  const {
    temp,
    feels_like,
    pressure,
    humidity,
    dew_point,
    uvi,
    clouds,
    visibility,
    wind_speed,
    wind_deg,
    weather,
  } = weatherData.current
  const { sunrise, sunset } = weatherData.current

  const toFahrenheit = (celsius) => (celsius * 9) / 5 + 32

  return (
    <div
      className="space-y-6 animate-slide-in-up"
      id="weather-details"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-4 hover:bg-white/20 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-white/70 text-sm font-medium">Temperature</span>
            <span className="text-white font-semibold text-lg">
              {isCelsius
                ? `${Math.round(temp)}°C`
                : `${Math.round(toFahrenheit(temp))}°F`}
            </span>
          </div>
        </div>
        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-4 hover:bg-white/20 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-white/70 text-sm font-medium">Feels Like</span>
            <span className="text-white font-semibold text-lg">
              {isCelsius
                ? `${Math.round(feels_like)}°C`
                : `${Math.round(toFahrenheit(feels_like))}°F`}
            </span>
          </div>
        </div>
        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-4 hover:bg-white/20 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-white/70 text-sm font-medium">Pressure</span>
            <span className="text-white font-semibold text-lg">{pressure} hPa</span>
          </div>
        </div>
        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-4 hover:bg-white/20 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-white/70 text-sm font-medium">Humidity</span>
            <span className="text-white font-semibold text-lg">{humidity}%</span>
          </div>
        </div>
        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-4 hover:bg-white/20 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-white/70 text-sm font-medium">Dew Point</span>
            <span className="text-white font-semibold text-lg">
              {isCelsius
                ? `${Math.round(dew_point)}°C`
                : `${Math.round(toFahrenheit(dew_point))}°F`}
            </span>
          </div>
        </div>
        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-4 hover:bg-white/20 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-white/70 text-sm font-medium">UV Index</span>
            <span className="text-white font-semibold text-lg">{uvi}</span>
          </div>
        </div>
        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-4 hover:bg-white/20 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-white/70 text-sm font-medium">Cloudiness</span>
            <span className="text-white font-semibold text-lg">{clouds}%</span>
          </div>
        </div>
        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-4 hover:bg-white/20 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-white/70 text-sm font-medium">Visibility</span>
            <span className="text-white font-semibold text-lg">{(visibility / 1000).toFixed(1)} km</span>
          </div>
        </div>
        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-4 hover:bg-white/20 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-white/70 text-sm font-medium">Wind Speed</span>
            <span className="text-white font-semibold text-lg">{wind_speed} m/s</span>
          </div>
        </div>
        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-4 hover:bg-white/20 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-white/70 text-sm font-medium">Wind Direction</span>
            <span className="text-white font-semibold text-lg">{wind_deg}°</span>
          </div>
        </div>
        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-4 hover:bg-white/20 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-white/70 text-sm font-medium">Sunrise</span>
            <span className="text-white font-semibold text-lg">{new Date(sunrise * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          </div>
        </div>
        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-4 hover:bg-white/20 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-white/70 text-sm font-medium">Sunset</span>
            <span className="text-white font-semibold text-lg">{new Date(sunset * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          </div>
        </div>
      </div>
      <div className="backdrop-blur-md bg-gradient-to-r from-blue-500/20 to-purple-600/20 border border-white/20 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <span className="text-white/70 text-sm font-medium">Current Conditions</span>
          <span className="text-white font-semibold text-lg capitalize">{weather[0].description}</span>
        </div>
      </div>
    </div>
  )
}

export default WeatherDetails
