import { BsSearch } from "react-icons/bs"
import Head from "next/head"
import axios from "axios"
import { useState, useEffect, useCallback } from "react"
import { db } from "@/lib/firebase"
import {
  collection,
  updateDoc,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore"
import { getAuth, onAuthStateChanged } from "firebase/auth"
import dynamic from "next/dynamic"
import Weather from "../components/Weather"
import FiveDayForecast from "@/components/FiveDayForecast"
import AuthComponent from "../components/AuthComponent"
import WeatherOutfitRecommendation from "@/components/WeatherOutfitRecommendation.js"
import EightDayForecast from "@/components/EightDayForecast"
import ScrollToTop from "@/components/ScrollToTop"
import Navbar from "@/components/NavBar"

const WeatherMap = dynamic(() => import("../components/WeatherMap"), {
  ssr: false,
})

export default function Home({ handleCityClick }) {
  const [city, setCity] = useState("")
  const [weather, setWeather] = useState({})
  const [forecast, setForecast] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [randomCityKey, setRandomCityKey] = useState(0)
  const [weatherMapKey, setWeatherMapKey] = useState(0)
  const [currentCityCoords, setCurrentCityCoords] = useState({
    lat: 0,
    lon: 0,
  })
  const [isCelsius, setIsCelsius] = useState(true)
  const auth = getAuth()

  const citiesCollectionRef = collection(db, "favoriteCities")
  const [favoriteCities, setFavoriteCities] = useState([])
  const [isUserSubscribed, setIsUserSubscribed] = useState(false)
  const [showNotification, setShowNotification] = useState(false)

  const setCityFromProfile = (cityName) => {
    setCity(cityName)
    fetchWeather(cityName)
  }

  const onToggle = () => {
    setIsCelsius((prevIsCelsius) => !prevIsCelsius)
  }

  const toggleTemperatureUnit = () => {
    setIsCelsius((prevIsCelsius) => !prevIsCelsius)
  }

  const fetchFavoriteCities = useCallback(async () => {
    if (!auth.currentUser || favoriteCities.length > 0) {
      return
    }

    setLoading(true)
    setCity("")

    try {
      const q = query(
        collection(db, "favoriteCities"),
        where("userId", "==", auth.currentUser.uid)
      )

      const querySnapshot = await getDocs(q)
      const cities = querySnapshot.docs.map((doc) => doc.data().city)
      setFavoriteCities(cities)
    } catch (error) {
      console.error("Error fetching favorite cities for user:", error)
      setFavoriteCities([])
    }
  }, [auth.currentUser])
  useEffect(() => {
    fetchFavoriteCities()
  }, [])

  const [currentUser, setCurrentUser] = useState(null)

  const [initialLoad, setInitialLoad] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user)

        const userRef = doc(db, "users", user.uid)
        const userDoc = await getDoc(userRef)
        if (userDoc.exists()) {
          setIsUserSubscribed(userDoc.data().isSubscribed)

          const cities = userDoc.data().favoriteCities || []
          setFavoriteCities(cities)

          if (cities.length > 0) {
            setCity(cities[0])
            fetchWeather(cities[0])
          } else {
            fetchRandomWeather()
          }
        } else {
          console.log("User document does not exist")
          fetchRandomWeather()
        }
      } else {
        setCurrentUser(null)
        setIsUserSubscribed(false)
        setFavoriteCities([])
        fetchRandomWeather()
      }
      setInitialLoad(false)
    })

    return () => unsubscribe()
  }, [auth])

  const handleSubmit = (e) => {
    e.preventDefault()
    fetchWeather()
  }

  const updateCityFromProfile = (cityName) => {
    setCity(cityName)
    fetchWeather(cityName)
  }
  const saveFavoriteCity = async (cityName) => {
    if (!auth.currentUser) {
      console.error("No user logged in")
      return
    }

    if (!cityName || cityName.trim() === "") {
      console.error("No city selected")
      return
    }

    try {
      const userRef = doc(db, "users", auth.currentUser.uid)
      const userDoc = await getDoc(userRef)
      if (userDoc.exists()) {
        const userData = userDoc.data()
        const updatedFavoriteCities = userData.favoriteCities
          ? [...userData.favoriteCities, cityName.trim()]
          : [cityName.trim()]

        await updateDoc(userRef, {
          favoriteCities: updatedFavoriteCities,
        })

        console.log(`${cityName} added to favorites`)
        setFavoriteCities(updatedFavoriteCities)
        setShowNotification(true)
        setTimeout(() => setShowNotification(false), 3000)
      } else {
        console.error("User document does not exist")
      }
    } catch (error) {
      console.error("Error adding favorite city:", error)
    }
  }

  const fetchWeather = async (cityName = city) => {
    if (!cityName) {
      setError("City name cannot be empty")
      return
    }
    setLoading(true)
    try {
      const geocodingUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${process.env.NEXT_PUBLIC_WEATHER_KEY}`
      const geocodingResponse = await axios.get(geocodingUrl)

      if (geocodingResponse.data.length === 0) {
        throw new Error("City not found")
      }

      const { lat, lon, country, state } = geocodingResponse.data[0]

      const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${process.env.NEXT_PUBLIC_WEATHER_KEY}`
      const currentWeatherResponse = await axios.get(currentWeatherUrl)

      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${process.env.NEXT_PUBLIC_WEATHER_KEY}`
      const forecastResponse = await axios.get(forecastUrl)

      setWeather({
        ...currentWeatherResponse.data,
        country,
        state,
      })
      if (forecastResponse.data && forecastResponse.data.list) {
        const dailyData = forecastResponse.data.list.filter(
          (forecast) => new Date(forecast.dt * 1000).getUTCHours() === 12
        )
        setForecast(dailyData)
      } else {
        setForecast([])
      }

      setCurrentCityCoords({ lat, lon })

      setError(null)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchRandomWeather = async () => {
    setLoading(true)
    setCity("")
    try {
      const min_population = 2697000
      const max_population = 100000000

      const cityUrl = `https://api.api-ninjas.com/v1/city?min_population=${min_population}&max_population=${max_population}&limit=30`
      const cityResponse = await axios.get(cityUrl, {
        headers: { "X-Api-Key": process.env.NEXT_PUBLIC_API_NINJA_KEY },
      })
      const cities = cityResponse.data

      const randomCity = cities[Math.floor(Math.random() * cities.length)]

      const geocodingUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${randomCity.name}&limit=1&appid=${process.env.NEXT_PUBLIC_WEATHER_KEY}`
      const geocodingResponse = await axios.get(geocodingUrl)
      const { lat, lon, country, state } = geocodingResponse.data[0]

      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${process.env.NEXT_PUBLIC_WEATHER_KEY}`
      const weatherResponse = await axios.get(weatherUrl)
      setWeather({
        ...weatherResponse.data,
        country,
        state,
      })

      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${process.env.NEXT_PUBLIC_WEATHER_KEY}`
      const forecastResponse = await axios.get(forecastUrl)
      if (forecastResponse.data && forecastResponse.data.list) {
        const dailyData = forecastResponse.data.list.filter(
          (forecast) => new Date(forecast.dt * 1000).getUTCHours() === 12
        )
        setForecast(dailyData)
      } else {
        setForecast([])
      }

      setError(null)

      setCurrentCityCoords({ lat, lon })
      setWeatherMapKey((prevKey) => prevKey + 1)

      setRandomCityKey((prevKey) => prevKey + 1)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!initialLoad && !currentUser) {
      fetchRandomWeather()
    }
  }, [currentUser, initialLoad])
  return (
    <div className="flex flex-col min-h-screen w-full bg-gray-200">
      <Head>
        <title>Climate Cue</title>
        <meta
          name="description"
          content="Weather Website created by Jonathan Gallardo-Kerth"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div id="top" className="absolute top-0 left-0 right-0 bottom-0 z-0" />

      <div className="relative z-10">
        <Navbar isUserSubscribed={isUserSubscribed} className="z-100" />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-end w-full lg:absolute lg:top-0 lg:right-0 mt-16 lg:mt-16 lg:mr-8 z-20">
          <AuthComponent
            favoriteCities={favoriteCities}
            setCityFromProfile={setCityFromProfile}
            fetchWeather={fetchWeather}
            setFavoriteCities={setFavoriteCities}
            handleCityClick={handleCityClick}
            isCelsius={isCelsius}
            onToggle={toggleTemperatureUnit}
            setIsCelsius={setIsCelsius}
          />
        </div>

        <div className="flex flex-col items-center lg:flex-row lg:items-stretch lg:justify-center lg:mt-32">
          <form
            onSubmit={handleSubmit}
            className="bg-white bg-opacity-60 shadow-lg rounded-2xl p-2 flex flex-col lg:flex-row items-stretch lg:items-center space-y-2 lg:space-x-2 lg:space-y-0"
          >
            .
            <input
              onChange={(e) => setCity(e.target.value)}
              value={city}
              className="flex-grow px-2 py-1 text-black focus:outline-none text-lg rounded-md lg:rounded-none"
              type="text"
              placeholder="Search city"
              aria-label="Search for a city"
            />
            <button
              type="submit"
              className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md lg:rounded-none"
            >
              <BsSearch size={20} />
            </button>
            <button
              type="button"
              onClick={fetchRandomWeather}
              className="p-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md lg:rounded-none"
            >
              Random City
            </button>
          </form>
        </div>

        {error && (
          <div className="bg-red-500 text-white px-4 rounded-md text-center">
            {error}
          </div>
        )}

        {showNotification && (
          <div className="bg-green-500 text-white p-2 rounded text-center">
            {weather.name} added to favorites!
          </div>
        )}

        <div className="bg-gray-200 rounded-lg p-4 lg:mx-16">
          <h2 className="text-2xl text-gray-800 font-bold text-center">
            Weather in {weather.name}
            {weather.state && `, ${weather.state}`}
            {weather.sys?.country && `, ${weather.sys.country}`}
          </h2>
        </div>

        <div className="flex flex-col items-center">
          {Object.keys(weather).length !== 0 && (
            <Weather data={weather} isCelsius={isCelsius} onToggle={onToggle} />
          )}
          {isUserSubscribed && Object.keys(weather).length !== 0 && (
            <WeatherOutfitRecommendation
              weatherData={weather}
              className="mt-4"
            />
          )}
          {!isUserSubscribed && forecast.length > 0 && (
            <FiveDayForecast
              city={city}
              forecast={forecast}
              isCelsius={isCelsius}
            />
          )}
          {isUserSubscribed && forecast.length > 0 && (
            <EightDayForecast
              city={city}
              forecast={forecast}
              isCelsius={isCelsius}
            />
          )}
          {loading && <div className="text-center text-white">Loading...</div>}
          {error && (
            <div className="mt-2 bg-red-500 text-white py-2 px-4 rounded-md text-center">
              {error}
            </div>
          )}
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
    </div>
  )
}
