// importing required modules
const express = require('express')
const router = express.Router()
const db = require('../models/index')
const { User } = db
const { authenticateUser } = require('../middleware/auth-user')

// async call handler
function asyncHandler(cb){
  return async (req, res, next)=>{
    try {
      await cb(req,res, next);
    } catch(err){
      next(err);
    }
  };
}

// A /api/users GET route that will return all properties and values for the currently authenticated User along with a 200 HTTP status code.
router.get('/', authenticateUser, asyncHandler(async (req, res) => {
  const user = req.currentUser

  res.status(200).json({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    emailAddress: user.emailAddress
  })
}))

// A /api/users POST route that will create a new user, set the Location header to "/", and return a 201 HTTP status code and no content.
router.post('/', asyncHandler(async (req, res) => {
  try {
    await User.create(req.body);
    res.status(201)
    res.setHeader('Location', '/')
    res.end()
  } catch (error) {
    console.log('ERROR: ', error.name);

    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      const errors = error.errors.map(err => err.message);
      res.status(400).json({ errors });   
    } else {
      throw error;
    }
  }
}))

// Export Router for use in app.js
module.exports = router