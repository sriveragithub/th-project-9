// importing required modules
const express = require('express')
const router = express.Router()
const db = require('../models/index')
const { Course, User } = db
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

// A /api/courses GET route that will return all courses including the User associated with each course and a 200 HTTP status code.
router.get('/', asyncHandler(async (req, res) => {
  const courses = await Course.findAll({
    attributes: ['id', 'title', 'description', 'estimatedTime', 'materialsNeeded'],
    include: [
      {
        model: User,
        as: 'User',
        attributes: ['id', 'firstName', 'lastName', 'emailAddress']
      }
    ]
  })
  res.status(200).json({ courses })
}))

// A /api/courses/:id GET route that will return the corresponding course including the User associated with that course and a 200 HTTP status code.
router.get('/:id', asyncHandler(async (req, res) => {
  const course = await Course.findByPk(req.params.id, {
    attributes: ['id', 'title', 'description', 'estimatedTime', 'materialsNeeded'],
    include: [
      {
        model: User,
        as: 'User',
        attributes: ['id', 'firstName', 'lastName', 'emailAddress']
      }
    ]
  })
  if (course) {
    res.status(200).json(course)
  } else {
    res.status(400).json({ message: "Resource does not exist."})
  }
}))

// A /api/courses POST route that will create a new course, set the Location header to the URI for the newly created course, and return a 201 HTTP status code and no content.
router.post('/', authenticateUser, asyncHandler(async (req, res) => {
  try {
    const createdCourse = await Course.create(req.body);
    
    res.status(201)
    res.setHeader('Location', `/api/courses/${createdCourse.id}`)
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

// A /api/courses/:id PUT route that will update the corresponding course and return a 204 HTTP status code and no content.
router.put('/:id', authenticateUser, asyncHandler(async (req, res) => {
  const userId = req.currentUser.id
  let course
  try {
    course = await Course.findByPk(req.params.id)
    if (course) {
      if (course.userId === userId) {
        await course.update(req.body)
        res.status(204).end()  
      } else {
        res.sendStatus(403).json({ message: 'This course cannot be updated by your User Id. Please authenticate with the correct User Id and try again.'})
      }
    } else {
      res.sendStatus(404).json({ message: 'Cannot find course. Please try again with a valid course ID.'})
    }
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

// A /api/courses/:id DELETE route that will delete the corresponding course and return a 204 HTTP status code and no content.
router.delete('/:id', authenticateUser, asyncHandler(async (req ,res) => {
  const course = await Course.findByPk(req.params.id)
  const userId = req.currentUser.id
  if (course) {
    if (course.userId === userId) {
      await course.destroy()
      res.status(204).end()
    } else {
      res.sendStatus(403).json({ message: 'This course cannot be updated by your User Id. Please authenticate with the correct User Id and try again.'})
    }
  } else {
    res.sendStatus(404).json({ message: 'Cannot update. Course not found.' })
  }
}));

// Export Router for use in app.js
module.exports = router