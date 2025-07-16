import React, { useState } from "react"
import { Link } from "react-scroll"
import { BsList } from "react-icons/bs"

const Navbar = ({ isUserSubscribed, firstName }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [showAccountSettings, setShowAccountSettings] = useState(false)

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  return (
    <nav className="fixed top-0 left-0 w-full backdrop-blur-md bg-slate-900/80 border-b border-white/10 z-50 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center space-x-6">
            <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
              ClimateCue
            </div>
            <div className="hidden md:block h-8 w-px bg-white/20"></div>
            <p className="hidden md:block text-lg font-medium text-white/90">
              Welcome,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-600 font-semibold">
                {firstName || "Guest"}
              </span>
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-3 rounded-xl text-white/80 hover:text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
            >
              <BsList size={24} />
            </button>
          </div>
        </div>
        {isOpen && (
          <div className="absolute top-20 left-0 w-full backdrop-blur-md bg-slate-900/90 border-b border-white/10 shadow-2xl">
            <div className="max-w-7xl mx-auto px-4 py-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                  onClick={toggleMenu}
                  to="weather-data"
                  smooth={true}
                  duration={500}
                  offset={-64}
                  className="group flex items-center space-x-3 text-white/80 hover:text-white hover:bg-white/10 px-4 py-3 rounded-xl text-sm font-medium cursor-pointer transition-all duration-200"
                >
                  <div className="w-2 h-2 bg-blue-400 rounded-full group-hover:bg-blue-300"></div>
                  <span>Current Weather</span>
                </Link>
                <Link
                  onClick={toggleMenu}
                  to="weather-details"
                  smooth={true}
                  duration={500}
                  offset={-64}
                  className="group flex items-center space-x-3 text-white/80 hover:text-white hover:bg-white/10 px-4 py-3 rounded-xl text-sm font-medium cursor-pointer transition-all duration-200"
                >
                  <div className="w-2 h-2 bg-purple-400 rounded-full group-hover:bg-purple-300"></div>
                  <span>Advanced Details</span>
                </Link>

                {isUserSubscribed && (
                  <Link
                    onClick={toggleMenu}
                    to="outfit-rec"
                    smooth={true}
                    duration={500}
                    offset={-64}
                    className="group flex items-center space-x-3 text-white/80 hover:text-white hover:bg-white/10 px-4 py-3 rounded-xl text-sm font-medium cursor-pointer transition-all duration-200"
                  >
                    <div className="w-2 h-2 bg-emerald-400 rounded-full group-hover:bg-emerald-300"></div>
                    <span>Outfit Recommendation</span>
                  </Link>
                )}
                <Link
                  onClick={toggleMenu}
                  to="news"
                  smooth={true}
                  duration={500}
                  offset={-64}
                  className="group flex items-center space-x-3 text-white/80 hover:text-white hover:bg-white/10 px-4 py-3 rounded-xl text-sm font-medium cursor-pointer transition-all duration-200"
                >
                  <div className="w-2 h-2 bg-pink-400 rounded-full group-hover:bg-pink-300"></div>
                  <span>Weather News</span>
                </Link>
                {isUserSubscribed && (
                  <Link
                    onClick={toggleMenu}
                    to="eight-day-forecast"
                    smooth={true}
                    duration={500}
                    offset={-64}
                    className="group flex items-center space-x-3 text-white/80 hover:text-white hover:bg-white/10 px-4 py-3 rounded-xl text-sm font-medium cursor-pointer transition-all duration-200"
                  >
                    <div className="w-2 h-2 bg-teal-400 rounded-full group-hover:bg-teal-300"></div>
                    <span>Extended Forecast</span>
                  </Link>
                )}
                {!isUserSubscribed && (
                  <Link
                    onClick={toggleMenu}
                    to="five-day-forecast"
                    smooth={true}
                    duration={500}
                    offset={-64}
                    className="group flex items-center space-x-3 text-white/80 hover:text-white hover:bg-white/10 px-4 py-3 rounded-xl text-sm font-medium cursor-pointer transition-all duration-200"
                  >
                    <div className="w-2 h-2 bg-teal-400 rounded-full group-hover:bg-teal-300"></div>
                    <span>5-Day Forecast</span>
                  </Link>
                )}

                <Link
                  onClick={toggleMenu}
                  to="map"
                  smooth={true}
                  duration={500}
                  offset={-64}
                  className="group flex items-center space-x-3 text-white/80 hover:text-white hover:bg-white/10 px-4 py-3 rounded-xl text-sm font-medium cursor-pointer transition-all duration-200"
                >
                  <div className="w-2 h-2 bg-orange-400 rounded-full group-hover:bg-orange-300"></div>
                  <span>Weather Map</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
