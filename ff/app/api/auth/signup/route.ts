import { getCollection } from '@/lib/mongodb'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { uid, email, displayName } = body

    if (!uid || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const usersCollection = await getCollection('users')

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ uid })
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    // Create new user document
    const newUser = {
      uid,
      email,
      displayName: displayName || 'Learning Enthusiast',
      createdAt: new Date(),
      updatedAt: new Date(),
      profile: {
        streak: 0,
        totalXP: 0,
        wordsLearned: 0,
        lessonsCompleted: 0,
        proficiencyLevel: 'Beginner',
        targetLevel: 'Advanced',
      },
      stats: {
        totalStudyTime: 0,
        weeklyStudyTime: [],
        monthlyProgress: [],
        achievements: [],
      },
    }

    await usersCollection.insertOne(newUser)

    return NextResponse.json(
      {
        success: true,
        user: newUser,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
