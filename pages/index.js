import Image from "next/image"
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
import TemperatureSwitch from "../components/TemperatureSwitch"
import FiveDayForecast from "@/components/FiveDayForecast"
import AuthComponent from "../components/AuthComponent"
import WeatherOutfitRecommendation from "@/components/WeatherOutfitRecommendation.js"
import EightDayForecast from "@/components/EightDayForecast"
import ScrollToTop from "@/components/ScrollToTop"
import Navbar from "@/components/NavBar"

const WeatherMap = dynamic(() => import("../components/WeatherMap"), {
  ssr: false,
})

export default function Home(setGlobalCity) {
  const [isCelsius, setIsCelsius] = useState(false)
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
  const auth = getAuth()

  const citiesCollectionRef = collection(db, "favoriteCities")
  const [favoriteCities, setFavoriteCities] = useState([])
  const [isUserSubscribed, setIsUserSubscribed] = useState(false)
  const [showNotification, setShowNotification] = useState(false)

  const setCityFromProfile = (cityName) => {
    setCity(cityName)
    fetchWeather(cityName)
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

  const toggleTemperatureUnit = () => {
    setIsCelsius(!isCelsius)
  }

  return (
    <div className="relative flex flex-col min-h-screen w-full">
      <Head>
        <title>Climate Cue</title>
        <meta
          name="Climate Cue"
          content="Weather Website created by Jonathan Gallardo-Kerth"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div
        id="top"
        className="absolute top-0 left-0 right-0 bottom-0 bg-black/30 z-0"
      />

      <div className="relative z-10 flex flex-col w-full">
        <div className="relative z-20 flex flex-col w-full">
          <Navbar isUserSubscribed={isUserSubscribed} />
        </div>
        {/* AuthComponent with responsive positioning */}
        <div className="md:absolute md:top-4 md:right-4 z-15 mt-10">
          <AuthComponent
            favoriteCities={favoriteCities}
            setCityFromProfile={setCityFromProfile}
            fetchWeather={fetchWeather}
            setFavoriteCities={setFavoriteCities}
          />
        </div>
        <div className="flex flex-col w-full z-10">
          {/* Main Content Area */}
          <div className="flex flex-col flex-1">
            <div className="max-w-[400px] mx-auto my-8">
              <form
                onSubmit={handleSubmit}
                className="bg-white bg-opacity-60 shadow-lg rounded-2xl p-3 flex space-x-2"
              >
                <input
                  onChange={(e) => setCity(e.target.value)}
                  value={city}
                  className="w-full px-2 py-1 text-black focus:outline-none text-xl rounded-md"
                  type="text"
                  placeholder="Search city"
                  aria-label="Search for a city"
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

              {/* Error Message */}
              {error && (
                <div className="mt-2 bg-red-500 text-white py-2 px-4 rounded-md text-center">
                  {error}
                </div>
              )}
            </div>

            {/* Temperature Switch */}
            <div className="flex justify-center my-4">
              <TemperatureSwitch
                isCelsius={isCelsius}
                onToggle={toggleTemperatureUnit}
              />
            </div>

            {/* Notification */}
            {showNotification && (
              <div className="fixed top-0 right-0 m-4 bg-green-500 text-white p-2 rounded">
                {weather.name} added to favorites!
              </div>
            )}

            {weather.name && (
              <div className="text-center my-4">
                <h2 className="text-2xl text-white font-bold">
                  Weather in {weather.name}
                  {weather.state && `, ${weather.state}`}
                  {weather.sys?.country && `, ${weather.sys.country}`}
                </h2>

                {auth.currentUser && !favoriteCities.includes(weather.name) && (
                  <button
                    onClick={() => saveFavoriteCity(weather.name)}
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
            {/* GPT Outfit Recommendation */}
            {isUserSubscribed && Object.keys(weather).length !== 0 && (
              <div className="flex flex-col items-center mt-4">
                <WeatherOutfitRecommendation weatherData={weather} />
              </div>
            )}

            {/* Five-Day Forecast */}
            {!isUserSubscribed && forecast.length > 0 && (
              <div className="p-4">
                <FiveDayForecast
                  city={city}
                  forecast={forecast}
                  isCelsius={isCelsius}
                />
              </div>
            )}

            {/* Eight-Day Forecast (for subscribed users) */}
            {isUserSubscribed && forecast.length > 0 && (
              <div className="p-4">
                <EightDayForecast
                  city={city}
                  forecast={forecast}
                  isCelsius={isCelsius}
                />
              </div>
            )}

            {/* Loading and Error Messages */}
            {loading && (
              <div className="text-center text-white">Loading...</div>
            )}
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
            <ScrollToTop />
          </div>
        </div>
      </div>
    </div>
  )
}
