const functions = require("firebase-functions")
const admin = require("firebase-admin")
const express = require("express")
const cors = require("cors")
const stripe = require("stripe")(functions.config().stripe.secret)

admin.initializeApp()

const app = express()
app.use(cors({ origin: true }))
app.use(express.json())

// Endpoint to handle subscription
app.post("/subscribe", async (req, res) => {
  const { email, firebaseUID } = req.body
  try {
    // Check if a customer with the email already exists in Stripe
    let customer = await stripe.customers.list({ email: email })

    // If the customer exists, update their metadata; otherwise, create a new customer
    if (customer && customer.data && customer.data.length > 0) {
      customer = await stripe.customers.update(customer.data[0].id, {
        metadata: { firebaseUID: firebaseUID },
      })
    } else {
      customer = await stripe.customers.create({
        email: email,
        metadata: { firebaseUID: firebaseUID },
      })
    }

    // Create a subscription for the customer
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: "price_1OJPslDg0HhegvarE5ZaGyad" }],
    })

    res.json({
      success: true,
      message: "Customer created or updated",
      customerID: customer.id,
      subscriptionID: subscription.id,
    })
  } catch (error) {
    console.error("Stripe error:", error)
    res
      .status(500)
      .json({ success: false, message: "Stripe error", error: error.message })
  }
})

exports.stripeWebhook = functions
  .region("us-west1")
  .https.onRequest((request, response) => {
    const signature = request.headers["stripe-signature"]
    const webhookSecret = functions.config().stripe.webhooksecret

    if (!webhookSecret) {
      console.error("The webhook secret is undefined.")
      response
        .status(400)
        .send("Configuration error: Webhook secret is undefined")
      return
    }

    let event

    try {
      event = stripe.webhooks.constructEvent(
        request.rawBody,
        signature,
        webhookSecret
      )
    } catch (error) {
      console.error(`Error in webhook signature verification: ${error.message}`)
      response.status(400).send(`Webhook Error: ${error.message}`)
      return
    }

    try {
      switch (event.type) {
        case "customer.subscription.created":
        case "customer.subscription.updated":
        case "customer.subscription.deleted": {
          const subscription = event.data.object
          const userId = subscription.metadata.firebaseUID

          if (!userId) {
            console.error("Firebase UID not found in subscription metadata")
            response.status(200).send("No action taken: Firebase UID not found")
            return
          }

          const isSubscribed =
            event.type !== "customer.subscription.deleted" &&
            subscription.status === "active"

          admin
            .firestore()
            .collection("users")
            .doc(userId)
            .update({
              isSubscribed: isSubscribed,
            })
            .then(() => {
              response
                .status(200)
                .send(`Handled ${event.type} for user ${userId}`)
            })
            .catch((updateError) => {
              console.error(`Error updating Firestore: ${updateError.message}`)
              response
                .status(500)
                .send(`Firestore update error: ${updateError.message}`)
            })
          break
        }

        default:
          console.log(`Unhandled event type ${event.type}`)
          response.status(400).send(`Unhandled event type ${event.type}`)
      }
    } catch (error) {
      console.error(`Error processing event: ${error.message}`)
      response.status(500).send(`Internal Server Error: ${error.message}`)
    }
  })
