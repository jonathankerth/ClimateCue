const { buffer } = require("micro")
const admin = require("firebase-admin")
const Stripe = require("stripe")
const functions = require("firebase-functions")

if (!admin.apps.length) {
  const firebaseConfig = functions.config().firebase
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: firebaseConfig.project_id,
      clientEmail: firebaseConfig.client_email,
      privateKey: firebaseConfig.private_key.replace(/\\n/g, "\n"),
    }),
  })
}

const stripeConfig = functions.config().stripe
const stripe = new Stripe(stripeConfig.secret_key)

const webhookHandler = async (req, res) => {
  const sig = req.headers["stripe-signature"]
  let event

  const buf = await buffer(req)
  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      stripeConfig.webhook_secret
    )
  } catch (err) {
    console.error("Webhook signature verification failed", err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object
      const userId = subscription.metadata.firebaseUID

      if (!userId) {
        console.error("Firebase UID not found in subscription metadata.")
        return res.status(400).send("Firebase UID not found.")
      }

      const userRef = admin.firestore().collection("users").doc(userId)
      const isSubscribed = event.type !== "customer.subscription.deleted"
      await userRef.update({ isSubscribed })
      console.log(
        `Subscription status updated for user ${userId}: ${isSubscribed}`
      )
      break
    }
    default:
      console.log(`Unhandled event type ${event.type}`)
  }

  res.json({ received: true })
}

module.exports = webhookHandler
