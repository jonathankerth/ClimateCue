import React from "react";

const TemperatureSwitch = ({ isCelsius, onToggle }) => {
	return (
		<div className="flex items-center justify-center mb-4">
			<label
				htmlFor="temp-switch"
				className="mr-2 font-medium text-lg text-white"
			>
				{isCelsius ? "°C" : "°F"}
			</label>
			<div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
				<input
					type="checkbox"
					name="temp-switch"
					id="temp-switch"
					className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
					checked={isCelsius}
					onChange={onToggle}
				/>
				<label
					htmlFor="temp-switch"
					className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"
				></label>
			</div>
			<label htmlFor="temp-switch" className="font-medium text-lg text-white">
				{isCelsius ? "°F" : "°C"}
			</label>
		</div>
	);
};

export default TemperatureSwitch;
