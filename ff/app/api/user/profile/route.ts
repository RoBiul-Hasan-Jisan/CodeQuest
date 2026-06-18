import { getCollection } from '@/lib/mongodb'
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

/**
 * Reusable auth helper
 */
async function getUserId(req: NextRequest) {
  const authHeader = req.headers.get('authorization')

  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.slice(7)
  const uid = await verifyToken(token)

  return uid || null
}

/**
 * GET USER PROFILE
 */
export async function GET(req: NextRequest) {
  try {
    const uid = await getUserId(req)

    if (!uid) {
      return NextResponse.json(
        { error: 'Unauthorized' },
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

    return NextResponse.json(
      { user },
      { status: 200 }
    )
  } catch (error) {
    console.error('Profile fetch error:', error)

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * UPDATE USER PROFILE (SAFE VERSION)
 */
export async function PUT(req: NextRequest) {
  try {
    const uid = await getUserId(req)

    if (!uid) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()

    /**
     * WHITELIST ONLY SAFE FIELDS
     * (prevents role/uid/email injection)
     */
    const allowedUpdate = {
      name: body.name,
      avatar: body.avatar,
      phone: body.phone,
      bio: body.bio,
    }

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

    return NextResponse.json(
      { user: updatedUser },
      { status: 200 }
    )
  } catch (error) {
    console.error('Profile update error:', error)

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}