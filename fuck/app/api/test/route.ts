import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth';
import { getCollection } from '@/lib/mongodb';

export async function GET(req: NextRequest) {
    try {
        const uid = await getUserIdFromRequest(req);
        
        if (!uid) {
            return NextResponse.json({
                success: false,
                message: 'No valid token provided',
                details: 'Please login first'
            }, { status: 401 });
        }

        const usersCollection = await getCollection('users');
        const user = await usersCollection.findOne({ uid });

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
        console.error('Test endpoint error:', error);
        return NextResponse.json({
            success: false,
            message: 'Error in test endpoint',
            error: error?.message || 'Unknown error'
        }, { status: 500 });
    }
}