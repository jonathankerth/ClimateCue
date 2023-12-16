const express = require("express")
const authenticateUser = require("../middleware/authenticateUser")
const router = express.Router()
const stripe = require("../utils/stripe")
const admin = require("firebase-admin")

router.post("/", authenticateUser, async (req, res) => {
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

module.exports = router
