import { NextRequest, NextResponse } from 'next/server'
import { getCollection } from '@/lib/mongodb'
import { getUserIdFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest) {
    try {
        const uid = await getUserIdFromRequest(req)
        
        if (!uid) {
            return NextResponse.json(
                { error: 'Unauthorized - Invalid token' },
                { status: 401 }
            )
        }
        
        const usersCollection = await getCollection('users')
        const user = await usersCollection.findOne({ uid })
        
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }
        
        const { _id, ...userWithoutId } = user;
        
        return NextResponse.json(
            { user: userWithoutId },
            { status: 200 }
        )
    } catch (error: any) {
        console.error('Profile fetch error:', error)
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function PUT(req: NextRequest) {
    try {
        const uid = await getUserIdFromRequest(req)
        
        if (!uid) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }
        
        const body = await req.json()
        
        const allowedUpdate: Record<string, any> = {
            displayName: body.displayName,
            name: body.name,
            avatar: body.avatar,
            phone: body.phone,
            bio: body.bio,
        }
        
        Object.keys(allowedUpdate).forEach(key => {
            if (allowedUpdate[key] === undefined) {
                delete allowedUpdate[key];
            }
        });
        
        const usersCollection = await getCollection('users')
        
        const result = await usersCollection.findOneAndUpdate(
            { uid },
            {
                $set: {
                    ...allowedUpdate,
                    updatedAt: new Date(),
                },
            },
            {
                returnDocument: 'after',
            }
        )
        
        const updatedUser = result?.value
        
        if (!updatedUser) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }
        
        const { _id, ...userWithoutId } = updatedUser;
        
        return NextResponse.json(
            { user: userWithoutId },
            { status: 200 }
        )
    } catch (error: any) {
        console.error('Profile update error:', error)
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        )
    }
}