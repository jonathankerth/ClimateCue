const express = require("express")
const cors = require("cors")
const subscribeRoute = require("./routes/subscribe")
const webhookRoute = require("./routes/webhook")

const app = express()
app.use(cors({ origin: true }))
app.use(express.json())
app.use("/subscribe", subscribeRoute)
app.use("/webhook", webhookRoute)

module.exports = app
