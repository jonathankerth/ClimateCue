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
import WeatherDetails from "@/components/WeatherDetails"
import Navbar from "@/components/NavBar"
import WeatherNews from "@/components/WeatherNews"
import { BsSearch } from "react-icons/bs"
import Head from "next/head"
import axios from "axios"

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
  const [currentCityCoords, setCurrentCityCoords] = useState({ lat: 0, lon: 0 })
  const [isCelsius, setIsCelsius] = useState(true)
  const auth = getAuth()
  const [favoriteCities, setFavoriteCities] = useState([])
  const [isUserSubscribed, setIsUserSubscribed] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [firstName, setFirstName] = useState("")
  const [initialLoad, setInitialLoad] = useState(true)

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
    } finally {
      setLoading(false)
    }
  }, [auth.currentUser])

  useEffect(() => {
    fetchFavoriteCities()
  }, [])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user)

        const userRef = doc(db, "users", user.uid)
        const userDoc = await getDoc(userRef)
        if (userDoc.exists()) {
          setIsUserSubscribed(userDoc.data().isSubscribed)
          setFirstName(userDoc.data().firstName)

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
        setFirstName("")
        fetchRandomWeather()
      }
      setInitialLoad(false)
    })

    return () => unsubscribe()
  }, [auth])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (city.trim() !== "") {
      fetchWeather(city)
    }
  }

  const fetchWeather = async (cityName) => {
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

      const oneCallUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&units=metric&exclude=minutely,hourly,alerts&appid=${process.env.NEXT_PUBLIC_WEATHER_KEY}`
      const oneCallResponse = await axios.get(oneCallUrl)

      setWeather({
        ...oneCallResponse.data,
        name: cityName,
        state,
        country,
      })

      if (oneCallResponse.data.daily) {
        setForecast(oneCallResponse.data.daily.slice(0, 5))
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
        setTimeout(() => {
          setShowNotification(false)
        }, 3000)
      } else {
        console.error("User document does not exist")
      }
    } catch (error) {
      console.error("Error adding favorite city:", error)
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

      const oneCallUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&units=metric&exclude=minutely,hourly,alerts&appid=${process.env.NEXT_PUBLIC_WEATHER_KEY}`
      const oneCallResponse = await axios.get(oneCallUrl)

      setWeather({
        ...oneCallResponse.data,
        name: randomCity.name,
        state,
        country,
      })

      if (oneCallResponse.data.daily) {
        setForecast(oneCallResponse.data.daily.slice(0, 5))
      } else {
        setForecast([])
      }

      setCurrentCityCoords({ lat, lon })
      setWeatherMapKey((prevKey) => prevKey + 1)
      setRandomCityKey((prevKey) => prevKey + 1)
      setError(null)
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

  const addToFavorites = async () => {
    try {
      const favoriteCityRef = doc(
        db,
        "favoriteCities",
        `${auth.currentUser.uid}_${city}`
      )
      await updateDoc(favoriteCityRef, {
        userId: auth.currentUser.uid,
        city,
      })
      setShowNotification(true)
      setTimeout(() => {
        setShowNotification(false)
      }, 3000)
    } catch (error) {
      console.error("Error adding city to favorites:", error)
    }
  }
  return (
    <div className="flex flex-col min-h-screen w-full bg-gradient-to-r from-blue-500 via-blue-300 to-blue-500 text-white">
      <Head>
        <title>Climate Cue</title>
        <meta
          name="description"
          content="Weather Website created by Jonathan Gallardo-Kerth"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar
        isUserSubscribed={isUserSubscribed}
        firstName={firstName}
        user={currentUser}
        className="shadow-md bg-gradient-to-r from-blue-700 via-blue-500 to-blue-700"
      />

      <div className="container mx-auto px-4 py-8">
        <div className="mt-12 mb-4">
          <AuthComponent
            favoriteCities={favoriteCities}
            setCity={setCity}
            fetchWeather={fetchWeather}
            setFavoriteCities={setFavoriteCities}
            handleCityClick={handleCityClick}
            isCelsius={isCelsius}
            onToggle={toggleTemperatureUnit}
            setIsCelsius={setIsCelsius}
          />
        </div>

        <div className="bg-black bg-opacity-50 shadow-lg rounded-lg p-6 mb-8">
          <form onSubmit={handleSubmit} className="flex space-x-4">
            <input
              onChange={(e) => setCity(e.target.value)}
              value={city}
              className="w-full px-4 py-2 border rounded-md focus:outline-none text-black"
              type="text"
              placeholder="Search city"
              aria-label="Search for a city"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md"
            >
              <BsSearch size={20} />
            </button>
            <button
              type="button"
              onClick={fetchRandomWeather}
              className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md"
            >
              Random City
            </button>
          </form>
        </div>

        {showNotification && (
          <div className="fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg">
            {weather.name} added to favorites!
          </div>
        )}

        {error && (
          <div className="bg-red-500 text-white px-4 py-2 rounded-md text-center mb-4">
            {error}
          </div>
        )}
        <div className="bg-black bg-opacity-50 shadow-lg rounded-lg p-6 mb-8">
          <div className="flex justify-center items-center mb-4">
            <h2 className="text-2xl font-bold text-center mr-4">
              Weather in {weather.name}, {weather.state}, {weather.country}
            </h2>
            {auth.currentUser && !favoriteCities.includes(weather.name) && (
              <button
                onClick={() => saveFavoriteCity(weather.name)}
                className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-md text-center"
              >
                Add to Favorites
              </button>
            )}
          </div>

          <Weather data={weather} isCelsius={isCelsius} onToggle={onToggle} />
        </div>

        {weather.current && (
          <div className="bg-black bg-opacity-50 shadow-lg rounded-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <WeatherDetails weatherData={weather} isCelsius={isCelsius} />
              </div>
              {isUserSubscribed && (
                <div>
                  <WeatherOutfitRecommendation weatherData={weather} />
                </div>
              )}
            </div>
            <div className="bg-black bg-opacity-50 shadow-lg rounded-lg p-6 mt-4">
              <WeatherNews />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8">
          {forecast.length > 0 && (
            <div className="bg-black bg-opacity-50 shadow-lg rounded-lg p-6">
              {!isUserSubscribed ? (
                <FiveDayForecast
                  city={city}
                  forecast={forecast}
                  isCelsius={isCelsius}
                />
              ) : (
                <EightDayForecast
                  city={weather.name}
                  currentCityCoords={currentCityCoords}
                  isCelsius={isCelsius}
                />
              )}
            </div>
          )}
          <div className="bg-black bg-opacity-50 shadow-lg rounded-lg p-6">
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
