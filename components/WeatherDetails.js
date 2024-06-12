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
      className="bg-white bg-opacity-70 p-6 rounded-lg shadow-lg"
      id="weather-details"
    >
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
        Detailed Weather Information
      </h2>
      <ul className="space-y-2">
        <li className="flex justify-between">
          <span>Temperature:</span>
          <span>
            {isCelsius
              ? `${Math.round(temp)}°C`
              : `${Math.round(toFahrenheit(temp))}°F`}
          </span>
        </li>
        <li className="flex justify-between">
          <span>Feels Like:</span>
          <span>
            {isCelsius
              ? `${Math.round(feels_like)}°C`
              : `${Math.round(toFahrenheit(feels_like))}°F`}
          </span>
        </li>
        <li className="flex justify-between">
          <span>Pressure:</span>
          <span>{pressure} hPa</span>
        </li>
        <li className="flex justify-between">
          <span>Humidity:</span>
          <span>{humidity}%</span>
        </li>
        <li className="flex justify-between">
          <span>Dew Point:</span>
          <span>
            {isCelsius
              ? `${Math.round(dew_point)}°C`
              : `${Math.round(toFahrenheit(dew_point))}°F`}
          </span>
        </li>
        <li className="flex justify-between">
          <span>UV Index:</span>
          <span>{uvi}</span>
        </li>
        <li className="flex justify-between">
          <span>Cloudiness:</span>
          <span>{clouds}%</span>
        </li>
        <li className="flex justify-between">
          <span>Visibility:</span>
          <span>{visibility} meters</span>
        </li>
        <li className="flex justify-between">
          <span>Wind Speed:</span>
          <span>{wind_speed} m/s</span>
        </li>
        <li className="flex justify-between">
          <span>Wind Direction:</span>
          <span>{wind_deg}°</span>
        </li>
        <li className="flex justify-between">
          <span>Sunrise:</span>
          <span>{new Date(sunrise * 1000).toLocaleTimeString()}</span>
        </li>
        <li className="flex justify-between">
          <span>Sunset:</span>
          <span>{new Date(sunset * 1000).toLocaleTimeString()}</span>
        </li>
        <li className="flex justify-between">
          <span>Weather:</span>
          <span className="capitalize">{weather[0].description}</span>
        </li>
      </ul>
    </div>
  )
}

export default WeatherDetails
