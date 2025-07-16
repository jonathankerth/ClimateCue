import { useEffect, useRef } from "react"
import { getLastSearchedCity } from "../utils/lastSearchedCity"

/**
 * Custom hook to handle initial weather data loading
 * Prevents hydration issues and infinite re-renders
 */
export const useInitialWeatherLoad = ({
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
}) => {
  const hasInitialized = useRef(false)

  useEffect(() => {
    // Only run once after initial mount
    if (hasInitialized.current || isApiCallInProgress) {
      return
    }

    // Wait for persistent state to be loaded before making decisions
    if (!isWeatherStateLoaded || !isPreferencesLoaded) {
      return
    }

    const initializeWeatherData = async () => {
      // Priority 1: Check if we have fresh cached data from context
      if (hasCachedWeather() && isDataFresh() && city) {
        setSearchInput(city)
        hasInitialized.current = true
        return
      }

      // Priority 2: Check for last searched city in localStorage
      const lastSearchedCity = getLastSearchedCity()
      if (lastSearchedCity) {
        setSearchInput(lastSearchedCity)
        setTimeout(() => fetchWeather(lastSearchedCity), 100)
        hasInitialized.current = true
        return
      }

      // Priority 3: If user is logged in and has favorites
      if (currentUser && favoriteCities.length > 0) {
        setCity(favoriteCities[0])
        setSearchInput(favoriteCities[0])
        setTimeout(() => fetchWeather(favoriteCities[0]), 100)
        hasInitialized.current = true
        return
      }

      // Priority 4: No cached data and no favorites - fetch random weather
      setTimeout(() => fetchRandomWeather(), 100)
      hasInitialized.current = true
    }

    initializeWeatherData()
  }, [
    currentUser,
    favoriteCities.length,
    isWeatherStateLoaded,
    isPreferencesLoaded,
  ])
}

export default useInitialWeatherLoad
