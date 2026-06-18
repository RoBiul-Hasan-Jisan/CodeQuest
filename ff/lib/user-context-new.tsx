'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from './firebase'
import { APIClient } from './api-client'

interface UserProfile {
  _id?: string
  uid: string
  email: string
  displayName: string
  profile: {
    streak: number
    totalXP: number
    wordsLearned: number
    lessonsCompleted: number
    proficiencyLevel: string
    targetLevel: string
  }
  stats: {
    totalStudyTime: number
    weeklyStudyTime: Array<{ day: string; hours: number }>
    monthlyProgress: Array<{ month: string; progress: number }>
    achievements: Array<{ id: string; name: string; icon: string }>
  }
}

interface UserContextType {
  user: UserProfile | null
  loading: boolean
  isAuthenticated: boolean
  logout: () => Promise<void>
  refreshUserProfile: () => Promise<void>
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          setIsAuthenticated(true)
          // Fetch user profile from backend
          const response: any = await APIClient.getProfile()
          setUser(response.user)
        } else {
          setIsAuthenticated(false)
          setUser(null)
        }
      } catch (error) {
        console.error('[v0] Failed to fetch user profile:', error)
        setUser(null)
        setIsAuthenticated(false)
      } finally {
        setLoading(false)
      }
    })

    return unsubscribe
  }, [])

  const logout = async () => {
    try {
      await signOut(auth)
      setUser(null)
      setIsAuthenticated(false)
    } catch (error) {
      console.error('[v0] Logout error:', error)
    }
  }

  const refreshUserProfile = async () => {
    try {
      const response: any = await APIClient.getProfile()
      setUser(response.user)
    } catch (error) {
      console.error('[v0] Failed to refresh profile:', error)
    }
  }

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    try {
      const response: any = await APIClient.updateProfile(data)
      setUser(response.user)
    } catch (error) {
      console.error('[v0] Failed to update profile:', error)
      throw error
    }
  }

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        logout,
        refreshUserProfile,
        updateUserProfile,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
