const auth = require('basic-auth')
const bcrypt = require('bcrypt')
const e = require('express')
const db = require('../models/index')
const { User } = db

exports.authenticateuser = async (req, res, next) => {
  let message
  const credentials = auth(req)

  if (credentials) {
    const user = await User.findOne({ where: {username: credentials.name}})
    if (user) {
      const authenticated = bcrypt
        .compareSync(credentials.pass, user.confirmedPassword)
      if (authenticated) {
        console.log(`Authentication successful for username: ${user.username}`)
        req.currentUser = user
      } else {
        message = `Authentication failed for username: ${user.username}`
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