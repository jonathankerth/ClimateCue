import React, { useState, useRef, useEffect } from "react"
import { getAuth, onAuthStateChanged } from "firebase/auth"
import Login from "./Login"
import Signup from "./Signup"
import Profile from "./Profile"

const AuthComponent = ({
  favoriteCities,
  setCityFromProfile,
  fetchWeather,
  setFavoriteCities,
  handleCityClick,
  setCity,
  isCelsius,
  onToggle,
}) => {
  const [authMode, setAuthMode] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const containerRef = useRef(null)
  const auth = getAuth()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user)
        setAuthMode(null)
      } else {
        setCurrentUser(null)
      }
    })

    return () => unsubscribe()
  }, [auth])

  const handleClickOutside = (event) => {
    if (containerRef.current && !containerRef.current.contains(event.target)) {
      setAuthMode(null)
    }
  }

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const toggleAuthMode = () => {
    setAuthMode(authMode === "login" ? "signup" : "login")
  }

  const handleUserLogout = () => {
    setCurrentUser(null)
  }

  return (
    <div className="flex flex-col" ref={containerRef}>
      {currentUser ? (
        <Profile
          user={currentUser}
          favoriteCitiesProp={favoriteCities}
          onCitySelect={setCityFromProfile}
          fetchWeather={fetchWeather}
          setFavoriteCities={setFavoriteCities}
          handleCityClick={handleCityClick}
          setCity={setCity}
          isCelsius={isCelsius}
          onToggle={onToggle}
          handleLogout={handleUserLogout}
        />
      ) : (
        <>
          {authMode === "login" && <Login setAuthMode={setAuthMode} />}
          {authMode === "signup" && <Signup setAuthMode={setAuthMode} />}
          {!authMode && (
            <button
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-50"
              onClick={toggleAuthMode}
            >
              Login / Signup
            </button>
          )}
        </>
      )}
    </div>
  )
}

export default AuthComponent
