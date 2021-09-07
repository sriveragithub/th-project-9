// importing required modules
const express = require('express')
const router = express.Router()
const db = require('../models/index')
const { Course } = db

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

// A /api/courses GET route that will return all courses including the User associated with each course and a 200 HTTP status code.
router.get('/', asyncHandler(async (req, res) => {
  // const user = req.currentUser

  // res.json({
  //   name: user.name,
  //   username: user.username
  // })
  res.status(200).json({ msg: '/api/courses route is working!' })
}))

// A /api/courses/:id GET route that will return the corresponding course including the User associated with that course and a 200 HTTP status code.
router.get('/:id', asyncHandler(async (req, res) => {
  const course = await Course.findByPk(req.params.id)
  if (course) {
    res.status(200).json(course)
  } else {
    res.status(400).json({ message: "Resource does not exist."})
  }
}))

// A /api/courses POST route that will create a new course, set the Location header to the URI for the newly created course, and return a 201 HTTP status code and no content.
router.post('/', asyncHandler(async (req, res) => {
  try {
    const createdCourse = await Course.create(req.body);
    
    res.status(201).setHeader('Location', createdCourse.id).end()
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

// A /api/courses/:id PUT route that will update the corresponding course and return a 204 HTTP status code and no content.
router.put('/:id', asyncHandler(async (req, res) => {
  let course = await Course.findByPk(req.params.id)
  if (course) {
    await course.update(req.body)
    res.status(204).end()
  } else {
    res.status(404).json({ message: 'Cannot update. Course not found.' })
  }
}))

// A /api/courses/:id DELETE route that will delete the corresponding course and return a 204 HTTP status code and no content.
router.delete('/:id', asyncHandler(async (req ,res) => {
  const course = await Course.findByPk(req.params.id)
  if (course) {
    await course.destroy()
    res.status(204).end()
  } else {
    res.sendStatus(404).json({ message: 'Cannot update. Course not found.' })
  }
}));

// Export Router for use in app.js
module.exports = router