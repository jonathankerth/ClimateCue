// WeatherMap.js
import React, { useState, useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const WeatherMap = ({ lat, lon }) => {
	// Remove forceUpdate prop
	const [map, setMap] = useState(null);
	const [layer, setLayer] = useState("temp_new"); // Default layer: Temp

	// Convert lat and lon to numbers and check if they are valid
	const latitude = Number(lat);
	const longitude = Number(lon);
	const isValidLocation = !isNaN(latitude) && !isNaN(longitude);

	useEffect(() => {
		if (!map && isValidLocation) {
			const initializedMap = L.map("map").setView([latitude, longitude], 13);
			L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
				maxZoom: 8,
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
				maxZoom: 19,
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
		</div>
	);
};

export default WeatherMap;
