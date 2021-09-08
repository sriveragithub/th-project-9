const auth = require('basic-auth')
const bcrypt = require('bcrypt')
const db = require('../models/index')
const { User } = db

exports.authenticateUser = async (req, res, next) => {
  let message
  const credentials = auth(req)

  if (credentials) {
    const user = await User.findOne({ where: {emailAddress: credentials.name}})
    if (user) {
      const authenticated = bcrypt
        .compareSync(credentials.pass, user.password)
      if (authenticated) {
        console.log(`Authentication successful for username: ${user.emailAddress}`)
        req.currentUser = user
      } else {
        message = `Authentication failed for username: ${user.emailAddress}`
      }
    } else {
      message = `User not found for username: ${credentials.name}`
    }
  } else {
    message = `Auth header not found`
  }

  if (message) {
    console.warn(message)
    res.status(401).json({ message: 'Access Denied' })
  } else {
    next()
  }
}