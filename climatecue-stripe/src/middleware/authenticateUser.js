const admin = require("firebase-admin")
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
module.exports = authenticateUser
