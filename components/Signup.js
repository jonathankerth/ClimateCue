import React, { useState } from "react"
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

const Signup = ({ setAuthMode }) => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState(null)
  const auth = getAuth()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      )
      const user = userCredential.user

      await setDoc(doc(db, "users", user.uid), {
        firstName,
        lastName,
        email: user.email,
        favoriteCities: [],
        isSubscribed: false,
      })

      setAuthMode("none")
    } catch (error) {
      setError(error.message)
    }
  }

  return (
    <div className="bg-gray-100 rounded-lg border border-gray-300 text-black p-6 w-full max-w-xs mx-auto">
      <h1 className="text-xl font-semibold mb-4">Sign Up for an Account</h1>
      <input
        type="text"
        placeholder="First Name"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded mb-3 focus:outline-none focus:ring-1 focus:ring-gray-400"
      />
      <input
        type="text"
        placeholder="Last Name"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded mb-3 focus:outline-none focus:ring-1 focus:ring-gray-400"
      />

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded mb-3 focus:outline-none focus:ring-1 focus:ring-gray-400"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded mb-3 focus:outline-none focus:ring-1 focus:ring-gray-400"
      />
      <input
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded mb-3 focus:outline-none focus:ring-1 focus:ring-gray-400"
      />
      <button
        onClick={handleSignup}
        className="block w-full text-center text-white bg-gray-800 hover:bg-gray-900 font-semibold py-2 px-4 rounded mb-3 transition duration-300 ease-in-out"
      >
        Sign Up
      </button>
      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
      <p className="text-center text-sm mt-2 text-gray-600">
        Already have an account?{" "}
        <button
          onClick={() => setAuthMode("login")}
          className="text-gray-800 hover:underline"
        >
          Login
        </button>
      </p>
    </div>
  )
}

export default Signup
