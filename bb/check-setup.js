const fs = require("fs");
const path = require("path");

console.log("\n=== SETUP VERIFICATION ===\n");

// Check .env file
console.log("1. Checking .env file...");
if (fs.existsSync(path.join(__dirname, ".env"))) {
  const env = require("dotenv").config({ path: path.join(__dirname, ".env") });
  console.log("   ✓ .env file exists");
  
  const required = [
    "PORT",
    "MONGODB_URI",
    "FIREBASE_SERVICE_ACCOUNT_KEY",
    "FRONTEND_URL"
  ];
  
  let allSet = true;
  required.forEach(key => {
    if (process.env[key]) {
      console.log(`   ✓ ${key} is set`);
    } else {
      console.log(`   ✗ ${key} is NOT set`);
      allSet = false;
    }
  });
} else {
  console.log("   ✗ .env file not found!");
}

// Check required files
console.log("\n2. Checking required files...");
const requiredFiles = [
  "server.js",
  "config/firebase.js",
  "config/mongodb.js",
  "middleware/auth.js",
  "routes/auth.js",
  "routes/user.js",
  "models/User.js"
];

requiredFiles.forEach(file => {
  if (fs.existsSync(path.join(__dirname, file))) {
    console.log(`   ✓ ${file}`);
  } else {
    console.log(`   ✗ ${file} NOT FOUND`);
  }
});

// Check dependencies
console.log("\n3. Checking dependencies...");
try {
  require("express");
  console.log("   ✓ express");
  require("cors");
  console.log("   ✓ cors");
  require("mongoose");
  console.log("   ✓ mongoose");
  require("firebase-admin");
  console.log("   ✓ firebase-admin");
  require("dotenv");
  console.log("   ✓ dotenv");
} catch (error) {
  console.log(`   ✗ Missing dependency: ${error.message}`);
}

console.log("\n=== NEXT STEPS ===");
console.log("1. Make sure all .env variables are set");
console.log("2. Run: npm run dev");
console.log("3. Test with: npm test");
console.log("\n");
