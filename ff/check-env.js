const fs = require("fs");
const path = require("path");

console.log("\n=== FRONTEND ENV VERIFICATION ===\n");

const envPath = path.join(__dirname, ".env.local");

if (!fs.existsSync(envPath)) {
  console.log("✗ .env.local not found!");
  console.log("\nCreate .env.local with these variables:");
  console.log(`
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123def456
`);
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, "utf-8");
const lines = envContent.split("\n").filter(l => l.trim() && !l.startsWith("#"));

console.log("✓ .env.local found\n");

const required = [
  "NEXT_PUBLIC_API_URL",
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID"
];

let allSet = true;
required.forEach(key => {
  const hasKey = lines.some(l => l.startsWith(key + "="));
  if (hasKey) {
    const value = lines.find(l => l.startsWith(key + "=")).split("=")[1];
    const isValid = !value.includes("YOUR_") && value.trim().length > 0;
    if (isValid) {
      console.log(`✓ ${key}`);
    } else {
      console.log(`✗ ${key} - needs real value`);
      allSet = false;
    }
  } else {
    console.log(`✗ ${key} - NOT SET`);
    allSet = false;
  }
});

if (allSet) {
  console.log("\n✓ All environment variables configured!");
} else {
  console.log("\n✗ Some variables are missing or have placeholder values");
  process.exit(1);
}
