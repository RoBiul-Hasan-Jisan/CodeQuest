import { NextRequest } from 'next/server';

// @ts-ignore - Ignore TypeScript errors for firebase-admin
const admin = require('firebase-admin');

// Initialize Firebase Admin if not already initialized
if (!admin.apps || !admin.apps.length) {
    try {
        const serviceAccount = require('../serviceAccountKey.json');
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
        console.log('✅ Firebase Admin initialized in auth.ts');
    } catch (error) {
        console.error('❌ Failed to initialize Firebase Admin:', error);
    }
}

export async function verifyToken(token: string): Promise<string | null> {
    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        return decodedToken.uid;
    } catch (error) {
        console.error('Token verification error:', error);
        return null;
    }
}

export async function getUserIdFromRequest(req: NextRequest): Promise<string | null> {
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader?.startsWith('Bearer ')) {
        return null;
    }
    
    const token = authHeader.slice(7);
    return await verifyToken(token);
}