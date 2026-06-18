const router = require("express").Router();
const User = require("../models/User");

// Create/Register user
router.post("/signup", async (req, res) => {
    try {
        const { uid, email, displayName } = req.body;

        if (!uid || !email) {
            return res.status(400).json({
                message: "Missing required fields: uid and email"
            });
        }

        let user = await User.findOne({ uid });

        if (user) {
            return res.status(200).json({
                message: "User already exists",
                user: user
            });
        }

        user = await User.create({
            uid,
            email,
            displayName: displayName || "Learning Enthusiast",
            profile: {
                streak: 0,
                totalXP: 0,
                wordsLearned: 0,
                lessonsCompleted: 0,
                proficiencyLevel: "Beginner",
                targetLevel: "Advanced"
            },
            stats: {
                totalStudyTime: 0,
                weeklyStudyTime: [],
                monthlyProgress: [],
                achievements: []
            }
        });

        res.status(201).json({
            message: "User created successfully",
            user: user
        });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({
            message: "Error creating user",
            error: error.message
        });
    }
});

module.exports = router;
