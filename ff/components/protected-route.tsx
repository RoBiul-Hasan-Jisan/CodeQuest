'use client'

import { useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/firebase'
import { Loader } from 'lucide-react'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('authToken')
        
        if (!token) {
          router.push('/auth/login')
          return
        }

        // Verify token is still valid
        const currentUser = auth.currentUser
        if (!currentUser) {
          localStorage.removeItem('authToken')
          localStorage.removeItem('uid')
          router.push('/auth/login')
          return
        }

        setIsAuthenticated(true)
      } catch (error) {
        console.error('Auth check error:', error)
        router.push('/auth/login')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}
