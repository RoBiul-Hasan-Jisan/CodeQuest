'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export interface UserProfile {
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
  updateUser: (data: Partial<UserProfile>) => Promise<void>
  refreshUser: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('authToken')
      const uid = localStorage.getItem('uid')

      if (!token || !uid) {
        setLoading(false)
        return
      }

      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch user')
      }

      const data = await response.json()
      setUser(data.user)
    } catch (error) {
      console.error('Error fetching user:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])

  const updateUser = async (data: Partial<UserProfile>) => {
    try {
      const token = localStorage.getItem('authToken')

      if (!token) {
        throw new Error('No auth token')
      }

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to update user')
      }

      const updatedData = await response.json()
      setUser(updatedData.user)
    } catch (error) {
      console.error('Error updating user:', error)
      throw error
    }
  }

  const refreshUser = async () => {
    await fetchUser()
  }

  return (
    <UserContext.Provider value={{ user, loading, updateUser, refreshUser }}>
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
