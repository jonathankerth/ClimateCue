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
import { useWeather } from "../contexts/WeatherContext"
import useInitialWeatherLoad from "../hooks/useInitialWeatherLoad"
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
import { saveLastSearchedCity } from "../utils/lastSearchedCity"

const WeatherMap = dynamic(() => import("../components/WeatherMap"), {
  ssr: false,
})

export default function Home({ handleCityClick }) {
  // Use WeatherContext for all weather, city, and forecast state
  const {
    weather,
    forecast,
    city,
    currentCityCoords,
    loading,
    error,
    isCelsius,
    setWeather,
    setForecast,
    setCity,
    setCoordinates,
    setLoading,
    setError,
    clearError,
    setTemperatureUnit,
    isDataFresh,
    hasCachedWeather,
    isWeatherStateLoaded,
    isPreferencesLoaded,
  } = useWeather()

  // Local state for UI components only
  const [randomCityKey, setRandomCityKey] = useState(0)
  const [weatherMapKey, setWeatherMapKey] = useState(0)
  const [searchInput, setSearchInput] = useState("")
  const [isApiCallInProgress, setIsApiCallInProgress] = useState(false)
  const auth = getAuth()
  const [favoriteCities, setFavoriteCities] = useState([])
  const [isUserSubscribed, setIsUserSubscribed] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [firstName, setFirstName] = useState("")

  const fetchWeather = useCallback(
    async (cityName) => {
      if (!cityName) {
        setError("City name cannot be empty")
        return
      }

      // Prevent concurrent API calls
      if (isApiCallInProgress) {
        console.log("API call already in progress, skipping...")
        return
      }

      setIsApiCallInProgress(true)
      setLoading(true)
      clearError()

      try {
        const geocodingUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${process.env.NEXT_PUBLIC_WEATHER_KEY}`
        const geocodingResponse = await axios.get(geocodingUrl)

        if (geocodingResponse.data.length === 0) {
          throw new Error("City not found")
        }

        const { lat, lon, country, state } = geocodingResponse.data[0]

        const oneCallUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&units=metric&exclude=minutely,hourly,alerts&appid=${process.env.NEXT_PUBLIC_WEATHER_KEY}`
        const oneCallResponse = await axios.get(oneCallUrl)

        const weatherData = {
          ...oneCallResponse.data,
          name: cityName,
          state,
          country,
        }

        setWeather(weatherData)
        setCity(cityName)
        setSearchInput(cityName)

        // Save the city to localStorage for persistence
        saveLastSearchedCity(cityName)

        if (oneCallResponse.data.daily) {
          setForecast(oneCallResponse.data.daily.slice(0, 5))
        } else {
          setForecast([])
        }

        setCoordinates({ lat, lon })
        setWeatherMapKey((prevKey) => prevKey + 1)
      } catch (error) {
        setError(error.message)
      } finally {
        setLoading(false)
        setIsApiCallInProgress(false)
      }
    },
    [
      setError,
      isApiCallInProgress,
      setLoading,
      clearError,
      setWeather,
      setCity,
      setSearchInput,
      setForecast,
      setCoordinates,
      setWeatherMapKey,
    ]
  )

  const fetchRandomWeather = useCallback(async () => {
    // Prevent concurrent API calls
    if (isApiCallInProgress) {
      console.log("API call already in progress, skipping random weather...")
      return
    }

    setIsApiCallInProgress(true)
    setLoading(true)
    setSearchInput("")
    clearError()

    // Extended list of cities for better randomness
    const randomCities = [
      "New York",
      "London",
      "Paris",
      "Berlin",
      "Madrid",
      "Rome",
      "Athens",
      "Vienna",
      "Mumbai",
      "Delhi",
      "Bangkok",
      "Singapore",
      "Dubai",
      "Doha",
      "Kuwait City",
      "Los Angeles",
      "Chicago",
      "Miami",
      "Houston",
      "Phoenix",
      "Denver",
      "Seattle",
      "Toronto",
      "Vancouver",
      "Montreal",
      "Calgary",
      "Ottawa",
      "Quebec City",
      "Moscow",
      "St. Petersburg",
      "Istanbul",
      "Ankara",
      "Tehran",
      "Baghdad",
      "Riyadh",
      "Cairo",
      "Casablanca",
      "Tunis",
      "Algiers",
      "Lagos",
      "Nairobi",
      "Cape Town",
      "Buenos Aires",
      "Rio de Janeiro",
      "Sao Paulo",
      "Mexico City",
      "Lima",
      "Bogota",
      "Santiago",
      "Montevideo",
      "La Paz",
      "Quito",
      "Caracas",
      "Panama City",
      "Seoul",
      "Beijing",
      "Shanghai",
      "Hong Kong",
      "Taipei",
      "Manila",
      "Jakarta",
      "Kuala Lumpur",
      "Hanoi",
      "Ho Chi Minh City",
      "Phnom Penh",
      "Yangon",
      "Dhaka",
      "Amsterdam",
      "Brussels",
      "Copenhagen",
      "Oslo",
      "Stockholm",
      "Helsinki",
      "Zurich",
      "Prague",
      "Warsaw",
      "Budapest",
      "Bucharest",
      "Sofia",
      "Zagreb",
      "Ljubljana",
      "Barcelona",
      "Lisbon",
      "Porto",
      "Milan",
      "Naples",
      "Florence",
      "Venice",
      "Sydney",
      "Melbourne",
      "Perth",
      "Brisbane",
      "Adelaide",
      "Auckland",
      "Wellington",
      "Johannesburg",
      "Pretoria",
      "Durban",
      "Harare",
      "Lusaka",
      "Dar es Salaam",
      "Addis Ababa",
      "Khartoum",
      "Accra",
      "Abidjan",
      "Dakar",
      "Rabat",
      "Tripoli",
    ]

    try {
      console.log("Starting fetchRandomWeather with direct city selection...")

      // Skip API Ninja entirely and use our curated list
      const randomCityName =
        randomCities[Math.floor(Math.random() * randomCities.length)]
      console.log("Selected random city:", randomCityName)

      const geocodingUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${randomCityName}&limit=1&appid=${process.env.NEXT_PUBLIC_WEATHER_KEY}`
      console.log("Geocoding URL:", geocodingUrl)

      const geocodingResponse = await axios.get(geocodingUrl)

      if (!geocodingResponse.data || geocodingResponse.data.length === 0) {
        console.warn("No geocoding data for:", randomCityName)

        // Try with ONE fallback city instead of random
        const fallbackCityName = "London"
        console.log("Trying fallback city:", fallbackCityName)

        const fallbackGeocodingUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${fallbackCityName}&limit=1&appid=${process.env.NEXT_PUBLIC_WEATHER_KEY}`
        const fallbackGeocodingResponse = await axios.get(fallbackGeocodingUrl)

        if (
          !fallbackGeocodingResponse.data ||
          fallbackGeocodingResponse.data.length === 0
        ) {
          throw new Error(`Could not find coordinates for ${fallbackCityName}`)
        }

        const { lat, lon, country, state } = fallbackGeocodingResponse.data[0]
        console.log("Fallback coordinates found:", { lat, lon, country, state })

        const oneCallUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&units=metric&exclude=minutely,hourly,alerts&appid=${process.env.NEXT_PUBLIC_WEATHER_KEY}`
        const oneCallResponse = await axios.get(oneCallUrl)

        console.log(
          "Weather data received for fallback city:",
          fallbackCityName
        )

        const weatherData = {
          ...oneCallResponse.data,
          name: fallbackCityName,
          state,
          country,
        }

        setWeather(weatherData)
        setCity(fallbackCityName)
        setSearchInput(fallbackCityName)

        // Save the city to localStorage for persistence
        saveLastSearchedCity(fallbackCityName)

        if (oneCallResponse.data.daily) {
          setForecast(oneCallResponse.data.daily.slice(0, 5))
        } else {
          setForecast([])
        }

        setCoordinates({ lat, lon })
        setWeatherMapKey((prevKey) => prevKey + 1)
        setRandomCityKey((prevKey) => prevKey + 1)

        console.log("fetchRandomWeather completed successfully with fallback")
        return
      }

      const { lat, lon, country, state } = geocodingResponse.data[0]
      console.log("Coordinates found:", { lat, lon, country, state })

      const oneCallUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&units=metric&exclude=minutely,hourly,alerts&appid=${process.env.NEXT_PUBLIC_WEATHER_KEY}`
      const oneCallResponse = await axios.get(oneCallUrl)

      console.log("Weather data received for:", randomCityName)

      const weatherData = {
        ...oneCallResponse.data,
        name: randomCityName,
        state,
        country,
      }

      setWeather(weatherData)
      setCity(randomCityName)
      setSearchInput(randomCityName)

      // Save the city to localStorage for persistence
      saveLastSearchedCity(randomCityName)

      if (oneCallResponse.data.daily) {
        setForecast(oneCallResponse.data.daily.slice(0, 5))
      } else {
        setForecast([])
      }

      setCoordinates({ lat, lon })
      setWeatherMapKey((prevKey) => prevKey + 1)
      setRandomCityKey((prevKey) => prevKey + 1)

      console.log("fetchRandomWeather completed successfully")
    } catch (error) {
      console.error("Error in fetchRandomWeather:", error)

      // Single ultimate fallback - just try London
      try {
        console.log("Trying final fallback city: London")

        const geocodingUrl = `https://api.openweathermap.org/geo/1.0/direct?q=London&limit=1&appid=${process.env.NEXT_PUBLIC_WEATHER_KEY}`
        const geocodingResponse = await axios.get(geocodingUrl)

        if (geocodingResponse.data && geocodingResponse.data.length > 0) {
          const { lat, lon, country, state } = geocodingResponse.data[0]

          const oneCallUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&units=metric&exclude=minutely,hourly,alerts&appid=${process.env.NEXT_PUBLIC_WEATHER_KEY}`
          const oneCallResponse = await axios.get(oneCallUrl)

          const weatherData = {
            ...oneCallResponse.data,
            name: "London",
            state,
            country,
          }

          setWeather(weatherData)
          setCity("London")
          setSearchInput("London")

          // Save the city to localStorage for persistence
          saveLastSearchedCity("London")

          if (oneCallResponse.data.daily) {
            setForecast(oneCallResponse.data.daily.slice(0, 5))
          } else {
            setForecast([])
          }

          setCoordinates({ lat, lon })
          setWeatherMapKey((prevKey) => prevKey + 1)
          setRandomCityKey((prevKey) => prevKey + 1)

          console.log("Final fallback completed successfully with London")
          return
        }
      } catch (fallbackError) {
        console.error("Final fallback failed:", fallbackError)
      }

      setError("Unable to fetch weather data. Please try again later.")
    } finally {
      setLoading(false)
      setIsApiCallInProgress(false)
    }
  }, [
    isApiCallInProgress,
    setIsApiCallInProgress,
    setLoading,
    setSearchInput,
    clearError,
    setWeather,
    setCity,
    setForecast,
    setCoordinates,
    setWeatherMapKey,
    setRandomCityKey,
    setError,
  ])

  const setCityFromProfile = (cityName) => {
    setCity(cityName)
    setSearchInput(cityName)
    saveLastSearchedCity(cityName)
    fetchWeather(cityName)
  }

  const onToggle = () => {
    setTemperatureUnit(!isCelsius)
  }

  const toggleTemperatureUnit = () => {
    setTemperatureUnit(!isCelsius)
  }

  const fetchFavoriteCities = useCallback(async () => {
    if (!auth.currentUser || favoriteCities.length > 0) {
      return
    }

    setLoading(true)
    setSearchInput("")

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
  }, [auth.currentUser, setLoading])

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
        }
      } else {
        setCurrentUser(null)
        setIsUserSubscribed(false)
        setFavoriteCities([])
        setFirstName("")
      }
    })

    return () => unsubscribe()
  }, []) // Empty dependency array to prevent infinite loops

  // Use the custom hook to handle initial weather loading
  useInitialWeatherLoad({
    currentUser,
    favoriteCities,
    hasCachedWeather,
    isDataFresh,
    city,
    setSearchInput,
    setCity,
    fetchWeather,
    fetchRandomWeather,
    isApiCallInProgress,
    isWeatherStateLoaded,
    isPreferencesLoaded,
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (searchInput.trim() !== "") {
      setCity(searchInput)
      fetchWeather(searchInput)
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

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
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

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mt-24 mb-8">
          <AuthComponent
            favoriteCities={favoriteCities}
            setCity={setCity}
            fetchWeather={fetchWeather}
            setFavoriteCities={setFavoriteCities}
            handleCityClick={handleCityClick}
            isCelsius={isCelsius}
            onToggle={toggleTemperatureUnit}
            setIsCelsius={setTemperatureUnit}
            setSearchInput={setSearchInput}
          />
        </div>

        <div className="backdrop-blur-md bg-white/10 border border-white/20 shadow-2xl rounded-2xl p-8 mb-8">
          {loading ? (
            <div className="flex items-center justify-center space-x-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              <span className="text-white font-semibold text-lg">
                Loading weather data...
              </span>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-4"
            >
              <div className="relative flex-1">
                <input
                  onChange={(e) => setSearchInput(e.target.value)}
                  value={searchInput}
                  className="w-full px-6 py-4 bg-white/20 backdrop-blur-md border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-white placeholder-white/70 text-lg transition-all duration-200"
                  type="text"
                  placeholder="Search for any city..."
                  aria-label="Search for a city"
                  disabled={loading}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                  <BsSearch className="text-white/60" size={20} />
                </div>
              </div>
              <div className="flex gap-3 justify-center sm:justify-start">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  Search
                </button>
                <button
                  type="button"
                  onClick={fetchRandomWeather}
                  disabled={loading}
                  className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  Random City
                </button>
              </div>
            </form>
          )}
        </div>

        {showNotification && (
          <div className="fixed top-20 right-6 z-50 bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-6 rounded-xl shadow-2xl backdrop-blur-md border border-emerald-400/30 transform transition-all duration-300 animate-pulse">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
              <span className="font-semibold text-lg">
                {weather.name} added to favorites!
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="backdrop-blur-md bg-red-500/20 border border-red-400/30 text-red-100 px-6 py-4 rounded-xl text-center mb-6 shadow-lg max-w-2xl mx-auto">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
              <span className="font-medium text-lg">{error}</span>
            </div>
          </div>
        )}

        {weather.name && (
          <>
            <div className="backdrop-blur-md bg-white/10 border border-white/20 shadow-2xl rounded-2xl p-8 mb-8">
              <div className="flex flex-col items-center text-center mb-6 gap-4">
                <div className="w-full">
                  <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-2">
                    Weather in {weather.name}
                  </h2>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full animate-pulse"></div>
                    <p className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500 text-lg font-semibold">
                      {weather.state && `${weather.state}, `}
                      {weather.country}
                    </p>
                  </div>
                </div>
                {auth.currentUser && !favoriteCities.includes(weather.name) && (
                  <button
                    onClick={() => saveFavoriteCity(weather.name)}
                    className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    ⭐ Add to Favorites
                  </button>
                )}
              </div>

              <Weather
                data={weather}
                isCelsius={isCelsius}
                onToggle={onToggle}
              />
            </div>

            {weather.current && (
              <div className="backdrop-blur-md bg-white/10 border border-white/20 shadow-2xl rounded-2xl p-8 mb-8">
                <div className={`grid gap-8 ${isUserSubscribed ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
                  <div className={`space-y-6 ${!isUserSubscribed ? 'mx-auto max-w-2xl' : ''}`}>
                    <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-4">
                      Weather Details
                    </h3>
                    <WeatherDetails
                      weatherData={weather}
                      isCelsius={isCelsius}
                    />
                  </div>
                  {isUserSubscribed && (
                    <div className="space-y-6">
                      <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-600 mb-4">
                        Outfit Recommendations
                      </h3>
                      <WeatherOutfitRecommendation weatherData={weather} />
                    </div>
                  )}
                </div>
                <div className="mt-8 pt-8 border-t border-white/20">
                  <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-6 text-center">
                    Latest Weather News
                  </h3>
                  <div className="max-w-4xl mx-auto">
                    <WeatherNews />
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {forecast.length > 0 && (
                <div className="backdrop-blur-md bg-white/10 border border-white/20 shadow-2xl rounded-2xl p-8">
                  <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-6 text-center">
                    {!isUserSubscribed ? "5-Day Forecast" : "Extended Forecast"}
                  </h3>
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
              <div className="backdrop-blur-md bg-white/10 border border-white/20 shadow-2xl rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-600 mb-6 text-center">
                  Weather Map
                </h3>
                <WeatherMap
                  lat={currentCityCoords.lat}
                  lon={currentCityCoords.lon}
                  isCelsius={isCelsius}
                  cityName={weather.name}
                  key={weatherMapKey}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
