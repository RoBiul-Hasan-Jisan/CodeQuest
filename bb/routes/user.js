const router = require("express").Router();
const User = require("../models/User");
const verifyToken = require("../middleware/auth");

// GET user profile
router.get("/profile", verifyToken, async (req, res) => {
    try {
        const user = await User.findOne({ uid: req.user.uid });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json({
            message: "Profile retrieved successfully",
            user: user
        });
    } catch (error) {
        console.error("Profile fetch error:", error);
        res.status(500).json({
            message: "Error fetching profile",
            error: error.message
        });
    }
});

// UPDATE user profile
router.put("/profile", verifyToken, async (req, res) => {
    try {
        const { profile, stats } = req.body;

        const updateData = {};
        if (profile) updateData.profile = profile;
        if (stats) updateData.stats = stats;

        const updatedUser = await User.findOneAndUpdate(
            { uid: req.user.uid },
            { $set: updateData },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json({
            message: "Profile updated successfully",
            user: updatedUser
        });
    } catch (error) {
        console.error("Profile update error:", error);
        res.status(500).json({
            message: "Error updating profile",
            error: error.message
        });
    }
});

module.exports = router;
