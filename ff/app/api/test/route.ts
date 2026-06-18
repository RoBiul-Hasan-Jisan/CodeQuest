import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth';
import { getCollection } from '@/lib/mongodb';

export async function GET(req: NextRequest) {
    try {
        console.log('Test API: Request received');
        
        // Test 1: Check if we can get user ID from token
        const uid = await getUserIdFromRequest(req);
        console.log('Test API: UID from token:', uid);
        
        if (!uid) {
            return NextResponse.json({
                success: false,
                message: 'No valid token provided',
                details: 'Please login first'
            }, { status: 401 });
        }

        // Test 2: Check if we can find user in MongoDB
        console.log('Test API: Looking up user in MongoDB...');
        const usersCollection = await getCollection('users');
        const user = await usersCollection.findOne({ uid });
        console.log('Test API: User found:', !!user);

        return NextResponse.json({
            success: true,
            message: 'Authentication working!',
            uid: uid,
            userFound: !!user,
            userData: user ? {
                displayName: user.displayName,
                email: user.email,
                createdAt: user.createdAt
            } : null
        }, { status: 200 });
        
    } catch (error: any) {
        console.error('Test API error:', error);
        return NextResponse.json({
            success: false,
            message: 'Error in test endpoint',
            error: error?.message || 'Unknown error'
        }, { status: 500 });
    }
}