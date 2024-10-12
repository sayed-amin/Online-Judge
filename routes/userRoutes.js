const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/userController');

// Routes for user registration and login
router.post('/register', registerUser);
router.post('/login', loginUser);

module.exports = router;
