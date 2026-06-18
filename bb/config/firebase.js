const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccountKey.json");

try {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
} catch (e) {
    // ignore "already exists" error
}

console.log("Firebase initialized");

module.exports = admin;