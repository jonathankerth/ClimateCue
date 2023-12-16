const express = require("express")
const router = express.Router()
const bodyParser = require("body-parser")
const stripe = require("../utils/stripe")
const functions = require("firebase-functions")

router.use(bodyParser.raw({ type: "application/json" }))
const admin = require("firebase-admin")

router.post("/", async (req, res) => {
  const signature = req.headers["stripe-signature"]
  const webhookSecret = functions.config().stripe.webhooksecret

  if (!webhookSecret) {
    console.error("The webhook secret is undefined.")
    return res
      .status(400)
      .send("Configuration error: Webhook secret is undefined")
  }

  let event
  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      signature,
      webhookSecret
    )
  } catch (error) {
    console.error(`Error in webhook signature verification: ${error.message}`)
    return res.status(400).send(`Webhook Error: ${error.message}`)
  }

  try {
    const usersRef = admin.firestore().collection("users")

    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object
        const userId = subscription.metadata.firebaseUID

        if (!userId) {
          console.error("Firebase UID not found in subscription metadata")
          return res.status(400).send("No action taken: Firebase UID not found")
        }

        const userRef = usersRef.doc(userId)
        const doc = await userRef.get()

        if (!doc.exists) {
          console.error(`No document found for user ID: ${userId}`)
          return res
            .status(404)
            .send(`No Firestore document found for user ID: ${userId}`)
        }

        const isSubscribed = event.type !== "customer.subscription.deleted"
        await userRef.update({ isSubscribed: isSubscribed })

        res
          .status(200)
          .send(`Handled subscription event ${event.type} for user ${userId}`)
        break
      }

      default:
        console.log(`Unhandled event type ${event.type}`)
    }
    res.status(200).send(`Handled event type ${event.type}`)
  } catch (error) {
    console.error(`Error processing event: ${error.message}`)
    res.status(500).send(`Internal Server Error: ${error.message}`)
  }
})

module.exports = router
