import React, { createContext, useContext, useReducer, useEffect } from "react"
import usePersistentState from "../hooks/usePersistentState"

// Action types
const WEATHER_ACTIONS = {
  SET_WEATHER: "SET_WEATHER",
  SET_FORECAST: "SET_FORECAST",
  SET_CITY: "SET_CITY",
  SET_COORDINATES: "SET_COORDINATES",
  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR",
  CLEAR_ERROR: "CLEAR_ERROR",
  SET_TEMPERATURE_UNIT: "SET_TEMPERATURE_UNIT",
  RESET_WEATHER: "RESET_WEATHER",
}

// Initial state
const initialState = {
  weather: {},
  forecast: [],
  city: "",
  currentCityCoords: { lat: 0, lon: 0 },
  loading: false,
  error: null,
  isCelsius: true,
  lastUpdated: null,
}

// Reducer function
const weatherReducer = (state, action) => {
  switch (action.type) {
    case WEATHER_ACTIONS.SET_WEATHER:
      return {
        ...state,
        weather: action.payload,
        lastUpdated: Date.now(),
        error: null,
      }

    case WEATHER_ACTIONS.SET_FORECAST:
      return {
        ...state,
        forecast: action.payload,
      }

    case WEATHER_ACTIONS.SET_CITY:
      return {
        ...state,
        city: action.payload,
      }

    case WEATHER_ACTIONS.SET_COORDINATES:
      return {
        ...state,
        currentCityCoords: action.payload,
      }

    case WEATHER_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      }

    case WEATHER_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      }

    case WEATHER_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      }

    case WEATHER_ACTIONS.SET_TEMPERATURE_UNIT:
      return {
        ...state,
        isCelsius: action.payload,
      }

    case WEATHER_ACTIONS.RESET_WEATHER:
      return {
        ...initialState,
        isCelsius: state.isCelsius,
      }

    default:
      return state
  }
}

// Create context
const WeatherContext = createContext()

// Custom hook to use weather context
export const useWeather = () => {
  const context = useContext(WeatherContext)
  if (!context) {
    throw new Error("useWeather must be used within a WeatherProvider")
  }
  return context
}

// Weather provider component
export const WeatherProvider = ({ children }) => {
  // Persistent state for weather data (with 1 hour TTL)
  const [
    persistedWeatherState,
    setPersistedWeatherState,
    ,
    isWeatherStateLoaded,
  ] = usePersistentState("climatecue-weather-state", initialState, {
    ttl: 60 * 60 * 1000, // 1 hour
    serializer: JSON.stringify,
    deserializer: JSON.parse,
  })

  // Persistent state for user preferences (no TTL)
  const [userPreferences, setUserPreferences, , isPreferencesLoaded] =
    usePersistentState("climatecue-preferences", { isCelsius: true }, {})

  // Use reducer for complex state management
  const [state, dispatch] = useReducer(weatherReducer, {
    ...initialState,
    ...persistedWeatherState,
    isCelsius: userPreferences.isCelsius,
  })

  // Sync state changes to persistent storage
  useEffect(() => {
    // Only persist if we have meaningful weather data and avoid initial render
    if (state.weather.name && state.lastUpdated) {
      const stateToStore = {
        weather: state.weather,
        forecast: state.forecast,
        city: state.city,
        currentCityCoords: state.currentCityCoords,
        lastUpdated: state.lastUpdated,
      }

      setPersistedWeatherState(stateToStore)
    }
  }, [state.weather.name, state.lastUpdated]) // Only track meaningful changes

  // Sync temperature preference changes
  useEffect(() => {
    setUserPreferences({ isCelsius: state.isCelsius })
  }, [state.isCelsius]) // Remove setUserPreferences from dependencies

  // Action creators
  const actions = {
    setWeather: (weather) =>
      dispatch({ type: WEATHER_ACTIONS.SET_WEATHER, payload: weather }),
    setForecast: (forecast) =>
      dispatch({ type: WEATHER_ACTIONS.SET_FORECAST, payload: forecast }),
    setCity: (city) =>
      dispatch({ type: WEATHER_ACTIONS.SET_CITY, payload: city }),
    setCoordinates: (coords) =>
      dispatch({ type: WEATHER_ACTIONS.SET_COORDINATES, payload: coords }),
    setLoading: (loading) =>
      dispatch({ type: WEATHER_ACTIONS.SET_LOADING, payload: loading }),
    setError: (error) =>
      dispatch({ type: WEATHER_ACTIONS.SET_ERROR, payload: error }),
    clearError: () => dispatch({ type: WEATHER_ACTIONS.CLEAR_ERROR }),
    setTemperatureUnit: (isCelsius) =>
      dispatch({
        type: WEATHER_ACTIONS.SET_TEMPERATURE_UNIT,
        payload: isCelsius,
      }),
    resetWeather: () => dispatch({ type: WEATHER_ACTIONS.RESET_WEATHER }),
  }

  // Helper functions
  const isDataFresh = () => {
    if (!state.lastUpdated) return false
    const now = Date.now()
    const thirtyMinutes = 30 * 60 * 1000
    return now - state.lastUpdated < thirtyMinutes
  }

  const hasCachedWeather = () => {
    return state.weather.name && state.weather.current
  }

  const value = {
    ...state,
    ...actions,
    isDataFresh,
    hasCachedWeather,
    isWeatherStateLoaded,
    isPreferencesLoaded,
  }

  return (
    <WeatherContext.Provider value={value}>{children}</WeatherContext.Provider>
  )
}

export default WeatherProvider
