import React, { useState, useEffect } from "react"
import { Link } from "react-scroll"
import { BsList } from "react-icons/bs"

const Navbar = ({ isUserSubscribed }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [firstName, setFirstName] = useState("")
  const [showAccountSettings, setShowAccountSettings] = useState(false)

  useEffect(() => {
    const fetchUserFirstName = () => {
      setFirstName("John")
    }

    fetchUserFirstName()
  }, [])

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const toggleAccountSettings = () => {
    setShowAccountSettings(!showAccountSettings)
  }

  return (
    <nav className="fixed top-0 left-0 w-full bg-black/70 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="text-2xl font-bold text-neutral-100">
              ClimateCue
            </div>
            {firstName && (
              <div className="text-neutral-100 px-4 py-2 rounded-md text-sm font-medium">
                Welcome, {firstName}
              </div>
            )}
            <div className="hidden md:flex items-baseline space-x-4 ml-4">
              <Link
                to="weather-data"
                smooth={true}
                duration={500}
                className="text-neutral-100 hover:bg-primary hover:text-white px-3 py-2 rounded-md text-sm font-medium cursor-pointer"
              >
                Current Weather
              </Link>
              {!isUserSubscribed && (
                <Link
                  to="five-day-forecast"
                  smooth={true}
                  duration={500}
                  className="text-neutral-100 hover:bg-primary hover:text-white px-3 py-2 rounded-md text-sm font-medium cursor-pointer"
                >
                  Five-Day Forecast
                </Link>
              )}
              {isUserSubscribed && (
                <Link
                  to="outfit-rec"
                  smooth={true}
                  duration={500}
                  className="text-neutral-100 hover:bg-primary hover:text-white px-3 py-2 rounded-md text-sm font-medium cursor-pointer"
                >
                  Outfit Recommendation
                </Link>
              )}
              {isUserSubscribed && (
                <Link
                  to="eight-day-forecast"
                  smooth={true}
                  duration={500}
                  className="text-neutral-100 hover:bg-primary hover:text-white px-3 py-2 rounded-md text-sm font-medium cursor-pointer"
                >
                  Eight-Day Forecast
                </Link>
              )}
              <Link
                to="map"
                smooth={true}
                duration={500}
                className="text-neutral-100 hover:bg-primary hover:text-white px-3 py-2 rounded-md text-sm font-medium cursor-pointer"
              >
                Weather Map
              </Link>
            </div>
          </div>
          <div className="flex md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-neutral-100 hover:text-white hover:bg-primary focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <BsList size={20} />
            </button>
          </div>
        </div>
        {isOpen && (
          <div className="md:hidden absolute top-16 left-0 w-full bg-neutral-800">
            <div className="flex flex-col items-start space-y-2">
              <Link
                onClick={toggleMenu}
                to="weather-data"
                smooth={true}
                duration={500}
                className="text-neutral-100 hover:bg-primary hover:text-white px-4 py-2 rounded-md text-sm font-medium cursor-pointer"
              >
                Current Weather
              </Link>
              {!isUserSubscribed && (
                <Link
                  onClick={toggleMenu}
                  to="five-day-forecast"
                  smooth={true}
                  duration={500}
                  className="text-neutral-100 hover:bg-primary hover:text-white px-4 py-2 rounded-md text-sm font-medium cursor-pointer"
                >
                  Five-Day Forecast
                </Link>
              )}
              {isUserSubscribed && (
                <Link
                  onClick={toggleMenu}
                  to="outfit-recommendation"
                  smooth={true}
                  duration={500}
                  className="text-neutral-100 hover:bg-primary hover:text-white px-4 py-2 rounded-md text-sm font-medium cursor-pointer"
                >
                  Outfit Recommendation
                </Link>
              )}
              {isUserSubscribed && (
                <Link
                  onClick={toggleMenu}
                  to="eight-day-forecast"
                  smooth={true}
                  duration={500}
                  className="text-neutral-100 hover:bg-primary hover:text-white px-4 py-2 rounded-md text-sm font-medium cursor-pointer"
                >
                  Eight-Day Forecast
                </Link>
              )}
              <Link
                onClick={toggleMenu}
                to="map"
                smooth={true}
                duration={500}
                className="text-neutral-100 hover:bg-primary hover:text-white px-4 py-2 rounded-md text-sm font-medium cursor-pointer"
              >
                Weather Map
              </Link>
            </div>
          </div>
        )}
      </div>

      {showAccountSettings && (
        <div className="fixed top-0 left-0 w-full h-full bg-black/50 flex justify-center items-center">
          <div className="bg-white rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-4">Account Settings</h2>
            <div className="flex flex-col space-y-4">
              <Subscribe />
            </div>
            <button
              onClick={toggleAccountSettings}
              className="mt-4 w-full bg-gray-800 text-white py-2 px-4 rounded hover:bg-gray-700 transition duration-300 ease-in-out"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
