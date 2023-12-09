const functions = require("firebase-functions")
const admin = require("firebase-admin")
const express = require("express")
const cors = require("cors")
const stripe = require("stripe")(functions.config().stripe.secret)
const bodyParser = require("body-parser")

admin.initializeApp()

const app = express()
app.use(cors({ origin: true }))
app.use(express.json())

// Additional middleware for raw bodies for webhook endpoint
app.use("/webhook", bodyParser.raw({ type: "application/json" }))

const authenticateUser = async (req, res, next) => {
  try {
    const idToken = req.headers.authorization
    if (!idToken) {
      return res.status(403).json({ error: "Unauthorized" })
    }
    const decodedToken = await admin.auth().verifyIdToken(idToken)
    req.user = decodedToken
    next()
  } catch (error) {
    console.error("Firebase Authentication error:", error)
    return res.status(403).json({ error: "Unauthorized" })
  }
}

app.post("/subscribe", authenticateUser, async (req, res) => {
  const { email } = req.user
  try {
    let customer = await stripe.customers.list({ email: email })
    const metadata = { firebaseUID: req.user.uid, userEmail: email }

    if (customer && customer.data && customer.data.length > 0) {
      customer = await stripe.customers.update(customer.data[0].id, {
        metadata,
      })
    } else {
      customer = await stripe.customers.create({ email, metadata })
    }

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: "price_1OJPslDg0HhegvarE5ZaGyad" }],
      metadata,
    })

    await admin
      .firestore()
      .collection("users")
      .where("email", "==", email)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          doc.ref.update({ isSubscribed: true })
        })
      })

    res.json({
      success: true,
      customerID: customer.id,
      subscriptionID: subscription.id,
    })
  } catch (error) {
    console.error("Stripe error:", error)
    res.status(500).json({ success: false, error: error.message })
  }
})

app.post("/webhook", async (req, res) => {
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

exports.api = functions.region("us-west1").https.onRequest(app)
