import React from "react";
import Image from "next/image";

const FiveDayForecast = ({ forecast }) => {
	if (!forecast || !Array.isArray(forecast) || forecast.length === 0) {
		return (
			<div className="text-center text-gray-500 text-lg">
				No forecast data available.
			</div>
		);
	}

	return (
		<div className="relative flex flex-col max-w-[500px] w-full m-auto my-6 p-4 text-gray-300 bg-black/50 backdrop-blur-md rounded-lg shadow-lg">
			<h2 className="text-center text-3xl font-bold mb-4">
				5-Day Weather Forecast
			</h2>
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
				{forecast.map((day) => (
					<div
						key={day.dt} // Assuming day.dt is a unique timestamp
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
						<p className="font-bold text-2xl">{Math.round(day.main.temp)}°F</p>
						<p className="text-sm capitalize">{day.weather[0].description}</p>
					</div>
				))}
			</div>
		</div>
	);
};

export default FiveDayForecast;
