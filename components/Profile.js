import React, { useEffect, useCallback, useState } from 'react'
import {
  getAuth,
  signOut,
  updateEmail,
  updatePassword,
  deleteUser,
  sendEmailVerification,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from 'firebase/auth'
import { db, storage } from '@/lib/firebase'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import {
  collection,
  query,
  where,
  deleteDoc,
  getDocs,
} from 'firebase/firestore'

const Profile = ({ user, userFavoriteCities, onCitySelect }) => {
  const auth = getAuth()
  const [favoriteCities, setFavoriteCities] = useState(userFavoriteCities || [])
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showAccountSettings, setShowAccountSettings] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [notification, setNotification] = useState('')

  const fetchFavoriteCities = useCallback(async () => {
    try {
      const q = query(
        collection(db, 'favoriteCities'),
        where('userId', '==', user.uid)
      )
      const querySnapshot = await getDocs(q)
      const cities = querySnapshot.docs.map((doc) => doc.data().city)
      setFavoriteCities(cities)
    } catch (error) {
      console.error('Error fetching favorite cities:', error)
      setFavoriteCities([])
    }
  }, [user.uid])

  useEffect(() => {
    setFavoriteCities(userFavoriteCities)
  }, [userFavoriteCities])

  const removeFavoriteCity = async (cityName) => {
    try {
      const q = query(
        collection(db, 'favoriteCities'),
        where('userId', '==', auth.currentUser.uid),
        where('city', '==', cityName)
      )
      const querySnapshot = await getDocs(q)
      querySnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref)
      })
      fetchFavoriteCities()
    } catch (error) {
      console.error('Error removing favorite city:', error)
    }
  }

  const handleLogout = () => {
    signOut(auth).catch((error) => console.error('Error signing out:', error))
  }

  const handleEmailChange = () => {
    if (auth.currentUser.emailVerified) {
      updateEmail(auth.currentUser, newEmail)
        .then(() => {
          console.log('Email updated!')
          setNotification('Your email has been successfully updated.')
          setNewEmail('')
        })
        .catch((error) => {
          console.error('Error updating email:', error)
          setNotification('Error updating email.')
        })
    } else {
      sendEmailVerification(auth.currentUser)
        .then(() => {
          console.log('Verification email sent!')
          setNotification(
            'You need to verify your current email before updating. A verification email has been sent.'
          )
        })
        .catch((error) => {
          console.error('Error sending verification email:', error)
          setNotification('Error sending verification email.')
          setNewEmail('')
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
            console.log('Password updated!')
            setNotification('Your password has been successfully updated.')
            setNewPassword('')
          })
          .catch((error) => {
            console.error('Error updating password:', error)
            setNotification('Error updating password.')
          })
      })
      .catch((error) => {
        console.error('Re-authentication failed:', error)
        setNotification('Re-authentication failed.')
      })
  }

  const handleDeleteAccount = () => {
    // Show a confirmation dialog
    if (
      window.confirm(
        'Are you sure you want to delete your account? This action cannot be undone.'
      )
    ) {
      deleteUser(auth.currentUser)
        .then(() => {
          console.log('User deleted!')
          // Additional logic after successful deletion, if needed
        })
        .catch((error) => {
          console.error('Error deleting user:', error)
        })
    }
  }

  const toggleAccountSettings = () => {
    setShowAccountSettings(!showAccountSettings)
  }
  return (
    <div className="p-4 bg-white rounded-lg shadow-md border border-gray-300 max-w-md mx-auto my-6">
      {/* User Greeting */}
      <p className="text-lg font-medium text-gray-800 mb-4">
        Welcome, <span className="text-gray-600">{user.email}</span>
      </p>
      {notification && (
        <div className="text-center my-2 p-2 bg-blue-100 text-blue-700 rounded">
          {notification}
        </div>
      )}
      {/* Favorite Cities List */}
      <div className="my-4">
        {favoriteCities.map((city, index) => (
          <div
            key={index}
            className="flex justify-between items-center bg-gray-100 p-2 rounded mb-2 hover:bg-gray-200 transition duration-300 cursor-pointer"
            onClick={() => onCitySelect(city)}
          >
            <p className="text-lg font-medium text-gray-800">{city}</p>
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
        ))}
      </div>

      {/* Toggle Account Settings Button */}
      <button
        onClick={toggleAccountSettings}
        className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-300 ease-in-out"
      >
        {showAccountSettings ? 'Hide Account Settings' : 'Account Settings'}
      </button>
      {/* Account Settings */}
      {showAccountSettings && (
        <div
          className={`${
            showAccountSettings ? 'max-h-96 overflow-y-auto' : 'max-h-0'
          } transition-all ease-in-out duration-500`}
        >
          {/* Email Update Form */}
          <div className="mt-3">
            <input
              type="email"
              placeholder="New Email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
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

      {/* Logout Button */}
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
