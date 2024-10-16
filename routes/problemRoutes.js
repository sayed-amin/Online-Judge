const express = require('express');
const Problem = require('../models/problem');

const router = express.Router();

// Create a new problem
// Create a new problem
router.post("/", async (req, res) => {
    try {
        // Destructure all required fields from the request body
        const { title, description, difficulty, testCases } = req.body;

        // Check for required fields
        if (!title || !description || !difficulty || !testCases) {
            return res.status(400).json({ message: "Please provide all fields" });
        }

        // Create a new Problem instance
        const problem = new Problem({ title, description, difficulty, testCases });

        // Save the problem to the database
        await problem.save();

        // Respond with the created problem
        res.status(201).json({ message: "Problem created successfully", problem });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// Get all problems
router.get("/", async (req, res) => {
    try {
        const problems = await Problem.find();
        res.status(200).json(problems);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a problem by ID
router.get("/:id", async (req, res) => {
    try {
        const problem = await Problem.findById(req.params.id);
        if (!problem) {
            return res.status(404).json({ message: "Problem not found" });
        }
        res.status(200).json(problem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update a problem
router.put("/:id", async (req, res) => {
    try {
        const updatedProblem = await Problem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updatedProblem) {
            return res.status(404).json({ message: "Problem not found" });
        }
        res.status(200).json(updatedProblem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete a problem
router.delete("/:id", async (req, res) => {
    try {
        const deletedProblem = await Problem.findByIdAndDelete(req.params.id);
        if (!deletedProblem) {
            return res.status(404).json({ message: "Problem not found" });
        }
        res.status(200).json({ message: "Problem deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
