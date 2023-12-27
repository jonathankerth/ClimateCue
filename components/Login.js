import React, { useState } from "react"
import { getAuth, signInWithEmailAndPassword } from "firebase/auth"

const Login = ({ setAuthMode }) => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState(null)
  const auth = getAuth()

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error) {
      setError(error.message)
    }
  }

  return (
    <div className="bg-gray-100 rounded-lg border border-gray-300 p-6 w-full max-w-xs mx-auto">
      <h1 className="text-xl font-semibold mb-4">Login to Your Account</h1>
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
      <button
        onClick={handleLogin}
        className="block w-full text-center text-white bg-gray-800 hover:bg-gray-900 font-semibold py-2 px-4 rounded mb-3 transition duration-300 ease-in-out"
      >
        Login
      </button>
      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
      <p className="text-center text-sm mt-2 text-gray-600">
        Don&apos;t have an account?{" "}
        <button
          onClick={() => setAuthMode("signup")}
          className="text-gray-800 hover:underline"
        >
          Sign Up
        </button>
      </p>
    </div>
  )
}

export default Login
