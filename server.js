const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { DBConnection } = require('./config/db.js');
const User = require('./models/Users.js');
const { generateFile } = require('./generatefileCpp.js');
const { executeCpp } = require('./executeCpp.js');
const { router: userRoutes, authenticateJWT } = require('./routes/userRoutes'); // Import user routes
const problemRoutes = require('./routes/problemRoutes'); // Import problem routes

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Database connection
DBConnection();



// Routes
app.use('/users', userRoutes);
app.use('/problems', problemRoutes);

// Code Compilation route (protected by JWT authentication)
app.post("/run", authenticateJWT, async (req, res) => {
    const { language = 'cpp', code } = req.body;
    if (code === undefined) {
        return res.status(404).json({ success: false, error: "Empty code!" });
    }
    try {
        const filePath = await generateFile(language, code);
        const output = await executeCpp(filePath);
        res.json({ filePath, output });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
