const functions = require("firebase-functions")
const admin = require("firebase-admin")
const app = require("./src/ app")

admin.initializeApp()

exports.api = functions.region("us-west1").https.onRequest(app)
