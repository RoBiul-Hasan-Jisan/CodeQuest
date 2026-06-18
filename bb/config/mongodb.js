const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error("MONGODB_URI environment variable is not set");
        }

        await mongoose.connect(process.env.MONGODB_URI, {
            connectTimeoutMS: 10000,
            serverSelectionTimeoutMS: 10000,
        });

        console.log("MongoDB Connected successfully");
    } catch (error) {
        console.error("MongoDB Connection Error:", error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
