const functions = require("firebase-functions")
const stripe = require("stripe")(functions.config().stripe.secret)

module.exports = stripe
