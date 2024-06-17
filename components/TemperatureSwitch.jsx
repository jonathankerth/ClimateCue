import React from "react"

const TemperatureSwitch = ({ isCelsius, onToggle }) => {
  return (
    <div className="flex items-center justify-center">
      <span className="mr-2 font-medium text-lg text-white">°C</span>
      <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
        <input
          type="checkbox"
          name="temp-switch"
          id="temp-switch"
          className="opacity-0 absolute w-6 h-6"
          checked={isCelsius}
          onChange={onToggle}
        />
        <label
          htmlFor="temp-switch"
          className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
            isCelsius ? "bg-gray-400" : "bg-gray-400"
          }`}
        >
          <span
            className={`block w-6 h-6 bg-blue-400 rounded-full shadow transform transition-transform duration-300 ease-in-out ${
              isCelsius ? "translate-x-0" : "translate-x-4"
            }`}
          ></span>
        </label>
      </div>
      <span className="font-medium text-lg text-white">°F</span>
    </div>
  )
}

export default TemperatureSwitch
