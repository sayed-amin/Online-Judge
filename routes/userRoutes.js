const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/Users');

const router = express.Router();

// Register user
router.post("/register", async (req, res) => {
    try {
        const { firstname, lastname, email, password } = req.body;
        if (!(firstname && lastname && email && password)) {
            return res.status(400).send("Please enter all the information");
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send("User already exists!");
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            firstname,
            lastname,
            email,
            password: hashedPassword,
        });

        const token = jwt.sign({ id: user._id, email }, process.env.SECRET_KEY, { expiresIn: "1d" });
        user.token = token;
        user.password = undefined;

        res.status(201).json({ message: "You have successfully registered!", user });
    } catch (error) {
        console.log(error);
        res.status(500).send("Error registering user.");
    }
});

// Login user
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!(email && password)) {
            return res.status(400).send("Please enter all the information");
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).send("User not found!");
        }

        const enteredPassword = await bcrypt.compare(password, user.password);
        if (!enteredPassword) {
            return res.status(401).send("Password is incorrect");
        }

        const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, { expiresIn: "1d" });
        user.token = token;
        user.password = undefined;

        const options = {
            expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
            httpOnly: true,
        };

        res.status(200).cookie("token", token, options).json({
            message: "You have successfully logged in!",
            success: true,
            token,
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Error logging in.");
    }
});

// Get all users (protected)
router.get("/", authenticateJWT, async (req, res) => {
    try {
        const users = await User.find().select('-password'); // Exclude password from results
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get user by ID (protected)
router.get("/:id", authenticateJWT, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password'); // Exclude password from result
        if (!user) {
            return res.status(404).send("User not found");
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update user (protected)
router.put("/:id", authenticateJWT, async (req, res) => {
    const { firstname, lastname, email, password } = req.body;

    try {
        const updatedData = {};
        if (firstname) updatedData.firstname = firstname;
        if (lastname) updatedData.lastname = lastname;
        if (email) updatedData.email = email;

        if (password) {
            // Hash new password if provided
            updatedData.password = await bcrypt.hash(password, 10);
        }

        const user = await User.findByIdAndUpdate(req.params.id, updatedData, { new: true, runValidators: true }).select('-password');
        if (!user) {
            return res.status(404).send("User not found");
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete user (protected)
router.delete("/:id", authenticateJWT, async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).send("User not found");
        }
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Middleware to authenticate JWT
function authenticateJWT(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        return res.sendStatus(403);
    }
    jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
        if (err) {
            return res.sendStatus(403);
        }
        req.user = user;
        next();
    });
}

module.exports = { router, authenticateJWT };
