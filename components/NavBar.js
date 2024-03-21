import React, { useState } from "react"
import { Link } from "react-scroll"
import { BsList } from "react-icons/bs"

const Navbar = ({ isUserSubscribed }) => {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  return (
    <nav className="bg-neutral-800 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <div className="text-2xl font-bold text-neutral-100">
                ClimateCue
              </div>
              {/* Current Weather Link */}
              <Link
                to="weather-data"
                smooth={true}
                duration={500}
                className="text-neutral-100 hover:bg-primary hover:text-white px-3 py-2 rounded-md text-sm font-medium cursor-pointer"
              >
                Current Weather
              </Link>

              {/* Five Day Forecast */}
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

              {/* Outfit Recommendation */}
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

              {/* Eight-Day Forecast Link - Conditionally Rendered */}
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

              {/* Weather Map Link */}
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
          <div className="-mr-2 flex md:hidden">
            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-neutral-100 hover:text-white hover:bg-primary focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <BsList size={20} />
            </button>
          </div>
        </div>
        {/* Mobile Dropdown Menu */}
        {isOpen && (
          <div className="md:hidden absolute top-16 w-full bg-neutral-800">
            <div className="flex flex-col items-center space-y-2">
              {/* Current Weather Link */}
              <Link
                onClick={toggleMenu}
                to="weather-data"
                smooth={true}
                duration={500}
                className="text-neutral-100 hover:bg-primary hover:text-white px-3 py-2 rounded-md text-sm font-medium cursor-pointer"
              >
                Current Weather
              </Link>

              {/* Five Day Forecast */}
              {!isUserSubscribed && (
                <Link
                  onClick={toggleMenu}
                  to="five-day-forecast"
                  smooth={true}
                  duration={500}
                  className="text-neutral-100 hover:bg-primary hover:text-white px-3 py-2 rounded-md text-sm font-medium cursor-pointer"
                >
                  Five-Day Forecast
                </Link>
              )}

              {/* Outfit Recommendation */}
              {isUserSubscribed && (
                <Link
                  onClick={toggleMenu}
                  to="outfit-recommendation"
                  smooth={true}
                  duration={500}
                  className="text-neutral-100 hover:bg-primary hover:text-white px-3 py-2 rounded-md text-sm font-medium cursor-pointer"
                >
                  Outfit Recommendation
                </Link>
              )}

              {/* Eight-Day Forecast Link - Conditionally Rendered */}
              {isUserSubscribed && (
                <Link
                  onClick={toggleMenu}
                  to="eight-day-forecast"
                  smooth={true}
                  duration={500}
                  className="text-neutral-100 hover:bg-primary hover:text-white px-3 py-2 rounded-md text-sm font-medium cursor-pointer"
                >
                  Eight-Day Forecast
                </Link>
              )}

              {/* Weather Map Link */}
              <Link
                onClick={toggleMenu}
                to="map"
                smooth={true}
                duration={500}
                className="text-neutral-100 hover:bg-primary hover:text-white px-3 py-2 rounded-md text-sm font-medium cursor-pointer"
              >
                Weather Map
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
