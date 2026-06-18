const admin = require('firebase-admin');

// Prevent multiple initialization
if (!admin.apps || !admin.apps.length) {
    try {
        const serviceAccount = require('../serviceAccountKey.json');
        
        try {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
            console.log('✅ Firebase Admin initialized successfully (Method 1)');
        } catch (certError) {
            console.warn('⚠️ Method 1 failed, trying Method 2...');
            const { cert } = require('firebase-admin/app');
            admin.initializeApp({
                credential: cert(serviceAccount),
            });
            console.log('✅ Firebase Admin initialized successfully (Method 2)');
        }

    } catch (error) {
        console.error('❌ Firebase Admin initialization error:', error.message);
        console.warn('⚠️ Firebase is not available. Some features may not work.');
    }
}

module.exports = admin;