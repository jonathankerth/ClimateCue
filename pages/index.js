import Image from "next/image";
import { BsSearch } from "react-icons/bs";
import Head from "next/head";
import axios from "axios";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import dynamic from "next/dynamic";
import Weather from "../components/Weather";
import TemperatureSwitch from "../components/TemperatureSwitch";
import FiveDayForecast from "@/components/FiveDayForecast";
import AuthComponent from "../components/AuthComponent";

const WeatherMap = dynamic(() => import("../components/WeatherMap"), {
	ssr: false,
});

export default function Home(setGlobalCity) {
	const [isCelsius, setIsCelsius] = useState(false);
	const [city, setCity] = useState("");
	const [weather, setWeather] = useState({});
	const [forecast, setForecast] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [randomCityKey, setRandomCityKey] = useState(0);
	const [weatherMapKey, setWeatherMapKey] = useState(0);
	const [currentCityCoords, setCurrentCityCoords] = useState({
		lat: 0,
		lon: 0,
	});
	const auth = getAuth();
	const citiesCollectionRef = collection(db, "favoriteCities");
	const [favoriteCities, setFavoriteCities] = useState([]);
	const fetchFavoriteCities = async () => {
		try {
			const citiesCollectionRef = collection(db, "favoriteCities");
			const querySnapshot = await getDocs(citiesCollectionRef);
			const cities = querySnapshot.docs.map((doc) => doc.data().city);
			setFavoriteCities(cities);
		} catch (error) {
			console.error("Error fetching favorite cities:", error);
		}
	};
	const [currentUser, setCurrentUser] = useState(null);
	useEffect(() => {
		const auth = getAuth();
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			if (user) {
				// User is signed in
				setCurrentUser(user);
			} else {
				// No user is signed in
				setCurrentUser(null);
			}
		});

		// Cleanup subscription on unmount
		return () => unsubscribe();
	}, []);

	useEffect(() => {
		fetchFavoriteCities();
	}, []);

	const handleSubmit = (e) => {
		e.preventDefault();
		fetchWeather();
	};

	const updateCityFromProfile = (cityName) => {
		setCity(cityName);
		fetchWeather(cityName);
	};

	const saveFavoriteCity = async (cityName) => {
		if (!auth.currentUser) {
			console.error("No user logged in");
			return;
		}

		if (!cityName || cityName.trim() === "") {
			console.error("No city selected");
			return;
		}

		try {
			await addDoc(citiesCollectionRef, {
				userId: auth.currentUser.uid,
				city: cityName.trim(),
			});
			console.log(`${cityName} added to favorites`);
			// Fetch the updated list of favorite cities
			fetchFavoriteCities();
		} catch (error) {
			console.error("Error adding favorite city:", error);
		}
	};
	const fetchWeather = async (cityName = city) => {
		if (!cityName) {
			setError("City name cannot be empty");
			return;
		}
		setLoading(true);
		try {
			const geocodingUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${process.env.NEXT_PUBLIC_WEATHER_KEY}`;
			const geocodingResponse = await axios.get(geocodingUrl);

			if (geocodingResponse.data.length === 0) {
				throw new Error("City not found");
			}

			const { lat, lon, country, state } = geocodingResponse.data[0];

			// Fetch current weather
			const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${process.env.NEXT_PUBLIC_WEATHER_KEY}`;
			const weatherResponse = await axios.get(weatherUrl);
			setWeather({
				...weatherResponse.data,
				country,
				state,
			});
			setCurrentCityCoords({ lat, lon });
			setRandomCityKey((prevKey) => prevKey + 1);
			setWeatherMapKey((prevKey) => prevKey + 1);

			// Fetch 5-day forecast
			const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${process.env.NEXT_PUBLIC_WEATHER_KEY}`;
			const forecastResponse = await axios.get(forecastUrl);
			if (forecastResponse.data && forecastResponse.data.list) {
				const dailyData = forecastResponse.data.list.filter(
					(forecast) => new Date(forecast.dt * 1000).getUTCHours() === 12
				);
				setForecast(dailyData);
			} else {
				setForecast([]);
			}

			// Update currentCityCoords
			setCurrentCityCoords({ lat, lon });

			setError(null);
		} catch (error) {
			setError(error.message);
		} finally {
			setLoading(false);
		}
	};

	const fetchRandomWeather = async () => {
		setLoading(true);
		setCity("");
		try {
			const min_population = 2697000;
			const max_population = 100000000;

			const cityUrl = `https://api.api-ninjas.com/v1/city?min_population=${min_population}&max_population=${max_population}&limit=30`;
			const cityResponse = await axios.get(cityUrl, {
				headers: { "X-Api-Key": process.env.NEXT_PUBLIC_API_NINJA_KEY },
			});
			const cities = cityResponse.data;

			const randomCity = cities[Math.floor(Math.random() * cities.length)];

			const geocodingUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${randomCity.name}&limit=1&appid=${process.env.NEXT_PUBLIC_WEATHER_KEY}`;
			const geocodingResponse = await axios.get(geocodingUrl);
			const { lat, lon, country, state } = geocodingResponse.data[0];

			// Fetch current weather
			const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${process.env.NEXT_PUBLIC_WEATHER_KEY}`;
			const weatherResponse = await axios.get(weatherUrl);
			setWeather({
				...weatherResponse.data,
				country,
				state,
			});

			// Fetch 5-day forecast
			const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${process.env.NEXT_PUBLIC_WEATHER_KEY}`;
			const forecastResponse = await axios.get(forecastUrl);
			if (forecastResponse.data && forecastResponse.data.list) {
				const dailyData = forecastResponse.data.list.filter(
					(forecast) => new Date(forecast.dt * 1000).getUTCHours() === 12
				);
				setForecast(dailyData);
			} else {
				setForecast([]);
			}

			setError(null);

			// Update currentCityCoords
			setCurrentCityCoords({ lat, lon });
			setWeatherMapKey((prevKey) => prevKey + 1);

			// Increment randomCityKey to force WeatherMap to update
			setRandomCityKey((prevKey) => prevKey + 1);
		} catch (error) {
			setError(error.message);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		console.log("Component mounted, fetching random weather");
		fetchRandomWeather();
	}, []);

	const toggleTemperatureUnit = () => {
		setIsCelsius(!isCelsius);
	};

	return (
		<div className="relative flex flex-col bg-cover bg-no-repeat min-h-screen w-full">
			<Head>
				<title>Weather Website</title>
				<meta
					name="description"
					content="Weather Website created by Jonathan Gallardo-Kerth"
				/>
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<Image
				src="https://images.unsplash.com/photo-1580193769210-b8d1c049a7d9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1474&q=80"
				alt="background img"
				layout="fill"
				objectFit="cover"
				className="z-[-1]"
				priority
			/>
			<div className="absolute top-0 left-0 right-0 bottom-0 bg-black/40 z-0" />

			<div className="relative z-10 flex flex-col w-full">
				{/* Conditional rendering based on user authentication */}
				{currentUser ? (
					// When user is logged in, AuthComponent takes full width on all screen sizes
					<div className="w-full md:sticky md:top-4 md:right-4 z-20 md:w-auto md:self-start">
						{" "}
						{/* Use "sticky" for mobile and "self-start" for larger screens */}
						<AuthComponent
							favoriteCities={favoriteCities}
							setCityFromProfile={updateCityFromProfile}
						/>
					</div>
				) : (
					// When not logged in, position AuthComponent to the right on all screen sizes
					<div className="w-full md:w-auto md:self-start">
						{" "}
						{/* Use "self-start" for larger screens */}
						<AuthComponent
							favoriteCities={favoriteCities}
							setCityFromProfile={updateCityFromProfile}
						/>
					</div>
				)}

				<div className="max-w-[400px] mx-auto my-8">
					{/* Search Form */}
					<div className="relative">
						<form
							onSubmit={fetchWeather}
							className="bg-white bg-opacity-60 shadow-lg rounded-2xl p-3 flex space-x-2"
						>
							<input
								onChange={(e) => setCity(e.target.value)}
								value={city}
								className="w-full px-2 py-1 text-black focus:outline-none text-xl rounded-md"
								type="text"
								placeholder="Search city"
							/>
							<button
								type="submit"
								className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
							>
								<BsSearch size={20} />
							</button>
							<button
								type="button"
								onClick={fetchRandomWeather}
								className="p-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md"
							>
								Random City
							</button>
						</form>
					</div>
				</div>

				{/* Temperature Switch */}
				<div className="flex justify-center my-4">
					<TemperatureSwitch
						isCelsius={isCelsius}
						onToggle={toggleTemperatureUnit}
					/>
				</div>

				{/* City Name Display */}
				{weather.name && (
					<div className="text-center my-4">
						<h2 className="text-2xl text-white font-bold">
							Weather in {weather.name}
							{weather.state && `, ${weather.state}`}
							{weather.sys?.country && `, ${weather.sys.country}`}
						</h2>
						{auth.currentUser && (
							<button
								onClick={() => saveFavoriteCity(weather.name)} // Pass the current city name here
								className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
							>
								Add to Favorites
							</button>
						)}
					</div>
				)}

				{/* Weather Data */}
				<div className="flex flex-col items-center">
					{Object.keys(weather).length !== 0 && (
						<Weather data={weather} isCelsius={isCelsius} />
					)}
				</div>

				{/* Five-Day Forecast */}
				{forecast.length > 0 && (
					<div className="p-4">
						<FiveDayForecast forecast={forecast} isCelsius={isCelsius} />
					</div>
				)}

				{/* Loading and Error Messages */}
				{loading && <div className="text-center text-white">Loading...</div>}
				{error && (
					<div className="mt-2 bg-red-500 text-white py-2 px-4 rounded-md text-center">
						{error}
					</div>
				)}

				{/* Weather Map */}
				<div className="w-full max-w-[600px] mx-auto">
					<WeatherMap
						lat={currentCityCoords.lat}
						lon={currentCityCoords.lon}
						isCelsius={isCelsius}
						cityName={weather.name}
						key={weatherMapKey}
					/>
				</div>
			</div>
		</div>
	);
}
