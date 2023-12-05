const functions = require("firebase-functions")
const admin = require("firebase-admin")
const stripe = require("stripe")(functions.config().stripe.secret)

admin.initializeApp()

exports.stripeWebhook = functions
  .region("us-west1")
  .https.onRequest(async (request, response) => {
    const signature = request.headers["stripe-signature"]

    try {
      const event = stripe.webhooks.constructEvent(
        request.rawBody,
        signature,
        functions.config().stripe.webhookSecret
      )

      switch (event.type) {
        case "customer.subscription.created":
        case "customer.subscription.updated": {
          const subscription = event.data.object
          const userId = subscription.metadata.firebaseUID
          const isSubscribed = subscription.status === "active"
          await admin.firestore().collection("users").doc(userId).update({
            isSubscribed: isSubscribed,
          })
          break
        }
        case "customer.subscription.deleted": {
          const cancelledSubscription = event.data.object
          const cancelledUserId = cancelledSubscription.metadata.firebaseUID
          await admin
            .firestore()
            .collection("users")
            .doc(cancelledUserId)
            .update({
              isSubscribed: false,
            })
          break
        }
        default:
          console.log(`Unhandled event type ${event.type}`)
      }

      response.send({ received: true })
    } catch (error) {
      console.error(`Error in webhook: ${error.message}`)
      response.status(400).send(`Webhook Error: ${error.message}`)
    }
  })
