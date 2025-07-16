/**
 * Utilexport const saveLastSearchedCity = (cityN        if (data.timestamp && (now - data.timestamp) < sevenDays) {
          return data.city
        } else {
          // Remove expired data
          localStorage.removeItem(LAST_SEARCHED_CITY_KEY)
        }{
  if (typeof window !== 'undefined' && cityName) {
    try {
      const data = {
        city: cityName,
        timestamp: Date.now()
      }
      localStorage.setItem(LAST_SEARCHED_CITY_KEY, JSON.stringify(data))
    } catch (error) {
      console.error('Error saving last searched city:', error)
    }
  }
}to manage the last searched   return null
}rage
 */

const LAST_SEARCHED_CITY_KEY = "climatecue-last-searched-city"

/**
 * Save the last searched city to localStorage
 * @param {string} cityName - The name of the city to save
 */
export const saveLastSearchedCity = (cityName) => {
  if (typeof window !== "undefined" && cityName) {
    try {
      const data = {
        city: cityName,
        timestamp: Date.now(),
      }
      localStorage.setItem(LAST_SEARCHED_CITY_KEY, JSON.stringify(data))
      console.log("Saved last searched city:", cityName)
    } catch (error) {
      console.error("Error saving last searched city:", error)
    }
  }
}

/**
 * Get the last searched city from localStorage
 * @returns {string|null} - The last searched city name or null if not found
 */
export const getLastSearchedCity = () => {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(LAST_SEARCHED_CITY_KEY)
      if (stored) {
        const data = JSON.parse(stored)

        // Check if the data is not too old (e.g., 7 days)
        const sevenDays = 7 * 24 * 60 * 60 * 1000
        const now = Date.now()

        if (data.timestamp && now - data.timestamp < sevenDays) {
          console.log("Found last searched city:", data.city)
          return data.city
        } else {
          // Remove expired data
          localStorage.removeItem(LAST_SEARCHED_CITY_KEY)
          console.log("Last searched city data expired, removed")
        }
      }
    } catch (error) {
      console.error("Error getting last searched city:", error)
    }
  }
  return null
}

/**
 * Clear the last searched city from localStorage
 */
export const clearLastSearchedCity = () => {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(LAST_SEARCHED_CITY_KEY)
      console.log("Cleared last searched city")
    } catch (error) {
      console.error("Error clearing last searched city:", error)
    }
  }
}
