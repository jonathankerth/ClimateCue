import React from "react"

const TemperatureSwitch = ({ isCelsius, onToggle }) => {
  return (
    <div className="flex items-center justify-center space-x-4 mt-4">
      <span className={`font-semibold text-lg transition-all duration-200 ${
        isCelsius ? "text-white" : "text-white/50"
      }`}>
        °C
      </span>
      <div className="relative">
        <input
          type="checkbox"
          name="temp-switch"
          id="temp-switch"
          className="sr-only"
          checked={!isCelsius}
          onChange={onToggle}
        />
        <label
          htmlFor="temp-switch"
          className={`relative inline-flex items-center h-8 w-16 rounded-full cursor-pointer transition-all duration-300 ${
            isCelsius 
              ? "bg-gradient-to-r from-blue-500 to-purple-600" 
              : "bg-gradient-to-r from-orange-500 to-red-600"
          }`}
        >
          <span
            className={`inline-block w-6 h-6 bg-white rounded-full shadow-lg transform transition-transform duration-300 ease-in-out ${
              isCelsius ? "translate-x-1" : "translate-x-9"
            }`}
          ></span>
        </label>
      </div>
      <span className={`font-semibold text-lg transition-all duration-200 ${
        !isCelsius ? "text-white" : "text-white/50"
      }`}>
        °F
      </span>
    </div>
  )
}

export default TemperatureSwitch
