import React, { useState, useRef, useEffect } from "react"
import { getAuth, onAuthStateChanged } from "firebase/auth"
import Login from "./Login"
import Signup from "./Signup"
import Profile from "./Profile"

const AuthComponent = ({ favoriteCities, setCityFromProfile }) => {
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

  return (
    <div className="flex flex-col mt-4" ref={containerRef}>
      {currentUser ? (
        <Profile
          key={favoriteCities.length}
          user={currentUser}
          favoriteCities={favoriteCities}
          onCitySelect={setCityFromProfile}
        />
      ) : (
        <>
          {authMode === "login" && <Login setAuthMode={setAuthMode} />}
          {authMode === "signup" && <Signup setAuthMode={setAuthMode} />}
          {!authMode && (
            <button
              className="text-xl text-white font-semibold focus:outline-none"
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
