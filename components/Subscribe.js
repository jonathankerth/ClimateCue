import React, { useState, useEffect } from "react"
import { getAuth } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

const Subscribe = () => {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const stripePortalUrl =
    "https://billing.stripe.com/p/login/4gwdU061kcv4cZq144" // Your Stripe portal URL

  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      const auth = getAuth()
      const user = auth.currentUser

      if (user) {
        const userRef = doc(db, "users", user.uid)
        const userDoc = await getDoc(userRef)

        if (userDoc.exists()) {
          setIsSubscribed(userDoc.data().isSubscribed)
        }
      }
    }

    checkSubscriptionStatus()
  }, [])

  useEffect(() => {
    // Load Stripe script
    const script = document.createElement("script")
    script.src = "https://js.stripe.com/v3/buy-button.js"
    script.async = true
    document.body.appendChild(script)

    // Check subscription status
    const urlParams = new URLSearchParams(window.location.search)
    const status = urlParams.get("status")
    if (status === "success") {
      setIsSubscribed(true)
    }

    return () => {
      // Remove script when component unmounts
      document.body.removeChild(script)
    }
  }, [])

  const handleManageSubscription = () => {
    // Redirect to Stripe customer portal
    window.location.href = stripePortalUrl
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-blue-100 rounded-lg shadow-lg">
      {isSubscribed ? (
        <>
          <p className="text-lg text-green-700 mb-4">
            You are currently subscribed.
          </p>
          <button
            onClick={handleManageSubscription}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Manage Subscription
          </button>
        </>
      ) : (
        <>
          <p className="text-lg text-gray-700 font-semibold mb-4">
            Please consider supporting ClimateCue by subscribing for $2.99/month
          </p>
          <p className="text-gray-600 mb-3">
            Subscribers receive premium weather data and get access to all
            features, including: AI-created what-to-wear recommendations and the
            ability to suggest new features.
          </p>
          <p className="text-gray-600 font-medium mb-6">Thank you!</p>
          <stripe-buy-button
            buy-button-id="buy_btn_1OJspUDg0HhegvarsAUeZQG1"
            publishable-key="pk_live_51OHhowDg0HhegvarqRIFiwg2w4huezGTD2Oimh1EumDFco201zULr1ZIKva9QD8GDvhSPTpm7w2FQO4gM9A9ofRx00zmFMB1Qp"
          ></stripe-buy-button>
        </>
      )}
    </div>
  )
}

export default Subscribe
