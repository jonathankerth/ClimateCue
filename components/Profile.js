import React, { useEffect, useState } from "react"
import {
  getAuth,
  signOut,
  updateEmail,
  updatePassword,
  deleteUser,
  sendEmailVerification,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth"
import { db } from "@/lib/firebase"
import { updateDoc, doc, getDoc } from "firebase/firestore"
import Subscribe from "./Subscribe"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"

const Profile = ({ user, fetchWeather, favoriteCitiesProp, setCity }) => {
  const auth = getAuth()
  const [favoriteCities, setFavoriteCities] = useState([])
  const [newEmail, setNewEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [showAccountSettings, setShowAccountSettings] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [notification, setNotification] = useState("")
  const [firstName, setFirstName] = useState("")

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const userRef = doc(db, "users", user.uid)
        const userDoc = await getDoc(userRef)
        if (userDoc.exists()) {
          setFirstName(userDoc.data().firstName)
          setFavoriteCities(userDoc.data().favoriteCities || [])
        }
      }
    }

    fetchUserData()
  }, [user])

  useEffect(() => {
    setFavoriteCities(favoriteCitiesProp)
  }, [favoriteCitiesProp])

  const removeFavoriteCity = async (cityName) => {
    const updatedCities = favoriteCities.filter((city) => city !== cityName)
    try {
      const userRef = doc(db, "users", user.uid)
      await updateDoc(userRef, {
        favoriteCities: updatedCities,
      })
      setFavoriteCities(updatedCities)
    } catch (error) {
      console.error("Error removing favorite city:", error)
    }
  }

  const handleCityClick = (city) => {
    setCity(city)
    fetchWeather(city)
  }

  const handleLogout = () => {
    signOut(auth).catch((error) => console.error("Error signing out:", error))
  }

  const handleEmailChange = () => {
    if (auth.currentUser.emailVerified) {
      updateEmail(auth.currentUser, newEmail)
        .then(() => {
          console.log("Email updated!")
          setNotification("Your email has been successfully updated.")
          setNewEmail("")
        })
        .catch((error) => {
          console.error("Error updating email:", error)
          setNotification("Error updating email.")
        })
    } else {
      sendEmailVerification(auth.currentUser)
        .then(() => {
          console.log("Verification email sent!")
          setNotification(
            "You need to verify your current email before updating. A verification email has been sent."
          )
        })
        .catch((error) => {
          console.error("Error sending verification email:", error)
          setNotification("Error sending verification email.")
          setNewEmail("")
        })
    }
  }

  const handlePasswordChange = () => {
    const credential = EmailAuthProvider.credential(
      auth.currentUser.email,
      currentPassword
    )
    reauthenticateWithCredential(auth.currentUser, credential)
      .then(() => {
        updatePassword(auth.currentUser, newPassword)
          .then(() => {
            console.log("Password updated!")
            setNotification("Your password has been successfully updated.")
            setNewPassword("")
          })
          .catch((error) => {
            console.error("Error updating password:", error)
            setNotification("Error updating password.")
          })
      })
      .catch((error) => {
        console.error("Re-authentication failed:", error)
        setNotification("Re-authentication failed.")
      })
  }

  const handleDeleteAccount = () => {
    if (
      window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      deleteUser(auth.currentUser)
        .then(() => {
          console.log("User deleted!")
        })
        .catch((error) => {
          console.error("Error deleting user:", error)
        })
    }
  }

  const toggleAccountSettings = () => {
    setShowAccountSettings(!showAccountSettings)
  }

  const handleDragEnd = async (result) => {
    if (!result.destination) return

    const updatedCities = [...favoriteCities]
    const [removed] = updatedCities.splice(result.source.index, 1)
    updatedCities.splice(result.destination.index, 0, removed)

    const userRef = doc(db, "users", user.uid)
    try {
      await updateDoc(userRef, { favoriteCities: updatedCities })
      setFavoriteCities(updatedCities)
    } catch (error) {
      console.error("Error updating favorite cities:", error)
    }
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-md border border-gray-300 max-w-md mx-auto my-6">
      {/* User Greeting */}
      <p className="text-lg font-medium text-gray-800 mb-4">
        Welcome, <span className="text-gray-600">{firstName}</span>
      </p>
      {notification && (
        <div className="text-center my-2 p-2 bg-blue-100 text-blue-700 rounded">
          {notification}
        </div>
      )}

      {/* Favorite Cities List */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="droppable">
          {(provided) => (
            <ul {...provided.droppableProps} ref={provided.innerRef}>
              {favoriteCities.map((city, index) => (
                <Draggable key={city} draggableId={city} index={index}>
                  {(provided) => (
                    <li
                      {...provided.draggableProps}
                      ref={provided.innerRef}
                      className="my-2"
                      onClick={() => handleCityClick(city)}
                    >
                      <div className="flex justify-between items-center bg-white p-2 rounded hover:bg-gray-100 transition duration-300 cursor-pointer border border-black">
                        <div {...provided.dragHandleProps}>☰</div>

                        <p className="text-md font-medium text-gray-800">
                          {city}
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            removeFavoriteCity(city)
                          }}
                          className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded transition duration-300"
                        >
                          Remove
                        </button>
                      </div>
                    </li>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>
      {/* Toggle Account Settings Button */}
      <button
        onClick={toggleAccountSettings}
        className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-300 ease-in-out"
      >
        {showAccountSettings ? "Hide Account Settings" : "Account Settings"}
      </button>
      {/* Account Settings Button */}
      {showAccountSettings && (
        <div
          className={`${
            showAccountSettings ? "max-h-96 overflow-y-auto" : "max-h-0"
          } transition-all ease-in-out duration-500`}
        >
          <div className="mt-4">
            <Subscribe />
          </div>
          {/* Email Update Form */}
          <div className="mt-3">
            <input
              type="email"
              placeholder="New Email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={handleEmailChange}
              className="mt-2 w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-300 ease-in-out"
            >
              Update Email
            </button>
          </div>
          {/* Password Update Form */}
          <div className="mt-3">
            <input
              type="password"
              placeholder="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={handlePasswordChange}
              className="mt-2 w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-300 ease-in-out"
            >
              Update Password
            </button>
          </div>
          {/* Delete Account Button */}
          <button
            onClick={handleDeleteAccount}
            className="w-full bg-red-600 text-white py-2 px-4 mt-2 rounded hover:bg-red-700 transition duration-300 ease-in-out"
          >
            Delete Account
          </button>
        </div>
      )}

      <button
        onClick={handleLogout}
        className="mt-4 w-full bg-gray-800 text-white py-2 px-4 rounded hover:bg-gray-700 transition duration-300 ease-in-out"
      >
        Logout
      </button>
    </div>
  )
}

export default Profile
