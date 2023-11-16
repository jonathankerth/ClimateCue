// WeatherMap.js
import React, { useState, useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const WeatherMap = ({ lat, lon, isCelsius }) => {
	// Remove forceUpdate prop
	const [map, setMap] = useState(null);
	const [layer, setLayer] = useState("temp_new"); // Default layer: Temp

	// Define the legends for each layer

	const legends = {
		precipitation_new: {
			title: "Classic Rain (mm)",
			colors: [
				{ color: "rgba(225, 200, 100, 0)", value: "0 mm" },
				{ color: "rgba(200, 150, 150, 0)", value: "0.1 mm" },
				{ color: "rgba(150, 150, 170, 0)", value: "0.2 mm" },
				{ color: "rgba(120, 120, 190, 0)", value: "0.5 mm" },
				{ color: "rgba(110, 110, 205, 0.3)", value: "1 mm" },
				{ color: "rgba(80, 80, 225, 0.7)", value: "10 mm" },
				{ color: "rgba(20, 20, 255, 0.9)", value: "140 mm" },
			],
		},
		snow: {
			title: "Snow (mm)",
			colors: [
				{ color: "transparent", value: "0 mm" },
				{ color: "#00d8ff", value: "5 mm" },
				{ color: "#00b6ff", value: "10 mm" },
				{ color: "#9549ff", value: "25.076 mm" },
			],
		},
		clouds_new: {
			title: "Classic Clouds (0-100%)",
			colors: [
				{ color: "rgba(255, 255, 255, 0.0)", value: "0%" },
				{ color: "rgba(253, 253, 255, 0.1)", value: "10%" },
				{ color: "rgba(252, 251, 255, 0.2)", value: "20%" },
				{ color: "rgba(250, 250, 255, 0.3)", value: "30%" },
				{ color: "rgba(249, 248, 255, 0.4)", value: "40%" },
				{ color: "rgba(247, 247, 255, 0.5)", value: "50%" },
				{ color: "rgba(246, 245, 255, 0.75)", value: "60%" },
				{ color: "rgba(244, 244, 255, 1)", value: "70%" },
				{ color: "rgba(243, 242, 255, 1)", value: "80%" },
				{ color: "rgba(242, 241, 255, 1)", value: "90%" },
				{ color: "rgba(240, 240, 255, 1)", value: "100%" },
			],
		},
		temp_new: {
			title: "Temperature (°C/°F)",
			colors: [
				{ color: "rgba(130, 22, 146, 1)", value: "-65°C to -40°C" },
				{ color: "rgba(130, 87, 219, 1)", value: "-30°C" },
				{ color: "rgba(32, 140, 236, 1)", value: "-20°C" },
				{ color: "rgba(32, 196, 232, 1)", value: "-10°C" },
				{ color: "rgba(35, 221, 221, 1)", value: "0°C" },
				{ color: "rgba(194, 255, 40, 1)", value: "10°C" },
				{ color: "rgba(255, 240, 40, 1)", value: "20°C" },
				{ color: "rgba(255, 194, 40,1)", value: "25°C" },
				{ color: "rgba(252, 128, 20, 1)", value: "30°C" },
			],
		},
		pressure_new: {
			title: "Pressure (Pa)",
			colors: [
				{ color: "rgba(0,115,255,1)", value: "94000 Pa" },
				{ color: "rgba(0,170,255,1)", value: "96000 Pa" },
				{ color: "rgba(75,208,214,1)", value: "98000 Pa" },
				{ color: "rgba(141,231,199,1)", value: "100000 Pa" },
				{ color: "rgba(176,247,32,1)", value: "101000 Pa" },
				{ color: "rgba(240,184,0,1)", value: "102000 Pa" },
				{ color: "rgba(251,85,21,1)", value: "104000 Pa" },
				{ color: "rgba(243,54,59,1)", value: "106000 Pa" },
				{ color: "rgba(198,0,0,1)", value: "108000 Pa" },
			],
		},
		wind_new: {
			title: "Wind (m/s)",
			colors: [
				{ color: "rgba(255,255,255, 0)", value: "1 m/s" },
				{ color: "rgba(238,206,206, 0.4)", value: "5 m/s" },
				{ color: "rgba(179,100,188, 0.7)", value: "15 m/s" },
				{ color: "rgba(63,33,59, 0.8)", value: "25 m/s" },
				{ color: "rgba(116,76,172, 0.9)", value: "50 m/s" },
				{ color: "rgba(70,0,175,1)", value: "100 m/s" },
				{ color: "rgba(13,17,38,1)", value: "200 m/s" },
			],
		},
		// Add other layers if needed
	};

	const renderLegend = () => {
		const currentLegend = legends[layer];
		if (!currentLegend) {
			return (
				<div className="bg-white p-4 rounded-lg shadow-md">
					No legend available for this layer.
				</div>
			);
		}
		return (
			<div className="bg-white p-4 rounded-lg shadow-md">
				<h3 className="font-semibold text-lg mb-4 text-center">
					{currentLegend.title}
				</h3>
				<div className="flex justify-center items-center">
					{currentLegend.colors.map((item, index) => {
						let displayValue = item.value;
						if (layer === "temp_new" && !isCelsius) {
							const tempRange = item.value.split(" to ");
							const tempValues = tempRange.map((temp) => {
								const celsiusValue = parseInt(temp.replace("°C", ""), 10);
								return `${Math.round((celsiusValue * 9) / 5 + 32)}°F`;
							});
							displayValue = tempValues.join(" to ");
						}
						return (
							<div key={index} className="flex flex-col items-center mx-1">
								<span className="text-sm mb-1">{displayValue}</span>
								<div
									className="w-10 h-3"
									style={{ backgroundColor: item.color }}
								></div>
							</div>
						);
					})}
				</div>
			</div>
		);
	};

	// Convert lat and lon to numbers and check if they are valid
	const latitude = Number(lat);
	const longitude = Number(lon);
	const isValidLocation = !isNaN(latitude) && !isNaN(longitude);

	useEffect(() => {
		if (!map && isValidLocation) {
			const initializedMap = L.map("map").setView([latitude, longitude], 8);
			L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
				maxZoom: 30,
				attribution: "© OpenStreetMap contributors",
			}).addTo(initializedMap);

			setMap(initializedMap);
		}
	}, [latitude, longitude, map, isValidLocation]);

	useEffect(() => {
		if (map) {
			const weatherLayerURL = `https://tile.openweathermap.org/map/${layer}/{z}/{x}/{y}.png?appid=${process.env.NEXT_PUBLIC_WEATHER_KEY}`;
			console.log("Weather Layer URL:", weatherLayerURL); // Log the URL for debugging

			const weatherLayer = L.tileLayer(weatherLayerURL, {
				maxZoom: 30,
				attribution: "© OpenWeatherMap",
			});

			weatherLayer.addTo(map);

			return () => {
				map.removeLayer(weatherLayer);
			};
		}
	}, [map, layer]);

	if (!isValidLocation) {
		return (
			<div className="text-center text-gray-500 text-lg">
				No valid location data available.
			</div>
		);
	}

	return (
		<div className="text-center my-4">
			<select value={layer} onChange={(e) => setLayer(e.target.value)}>
				<option value="clouds_new">Clouds</option>
				<option value="precipitation_new">Precipitation</option>
				<option value="pressure_new">Sea Level Pressure</option>
				<option value="wind_new">Wind Speed</option>
				<option value="temp_new">Temperature</option>
			</select>
			<div id="map" style={{ height: "400px", width: "100%" }} />
			<div className="legend">{renderLegend()}</div>
		</div>
	);
};

export default WeatherMap;
