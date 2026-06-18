require("dotenv").config();
const mongoose = require("mongoose");
const admin = require("./config/firebase");

console.log("Testing Backend Connections...\n");

// Test MongoDB
async function testMongoDB() {
  try {
    console.log("Testing MongoDB...");
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI not set");
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✓ MongoDB connected successfully");
    await mongoose.disconnect();
  } catch (error) {
    console.error("✗ MongoDB error:", error.message);
  }
}

// Test Firebase
function testFirebase() {
  try {
    console.log("\nTesting Firebase...");
    if (!admin.apps || admin.apps.length === 0) {
      throw new Error("Firebase not initialized");
    }
    console.log("✓ Firebase initialized successfully");
    console.log("  Project ID:", admin.apps[0].options.projectId);
  } catch (error) {
    console.error("✗ Firebase error:", error.message);
  }
}

// Run tests
async function runTests() {
  await testMongoDB();
  testFirebase();
  console.log("\nConnection test complete!");
  process.exit(0);
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
