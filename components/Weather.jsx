// Weather.jsx
import Image from "next/image";
import React from "react";

const Weather = ({ data, forecast }) => {
	const location = data.name ? data.name : "";
	const state = data.state ? data.state : "";
	const country = data.country ? data.country : "";

	return (
		<div className="relative flex flex-col max-w-[500px] w-full m-auto p-4 text-gray-300 z-10 bg-black/50 backdrop-blur-md rounded-lg shadow-lg">
			{/* Current Weather */}
			<div className="flex flex-col items-center text-center">
				<Image
					src={`http://openweathermap.org/img/wn/${data.weather[0].icon}.png`}
					alt="weather icon"
					width="100"
					height="100"
				/>
				<p className="text-2xl">{data.weather[0].main}</p>
				<p className="text-9xl">{Math.round(data.main.temp)}&#176;</p>
				<p className="text-2xl">
					Weather in {location}
					{state ? `, ${state}` : ""}
					{country ? `, ${country}` : ""}
				</p>
			</div>

			{/* Weather Details */}
			<div className="flex justify-between p-4 border-t border-gray-400/50">
				<div>
					<p className="font-bold text-xl">
						{Math.round(data.main.feels_like)}&#176;
					</p>
					<p>Feels Like</p>
				</div>
				<div>
					<p className="font-bold text-xl">{data.main.humidity}%</p>
					<p>Humidity</p>
				</div>
				<div>
					<p className="font-bold text-xl">{Math.round(data.wind.speed)} MPH</p>
					<p>Winds</p>
				</div>
			</div>
		</div>
	);
};

export default Weather;
