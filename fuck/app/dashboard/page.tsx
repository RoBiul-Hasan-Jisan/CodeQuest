'use client'

import { useState, useEffect } from 'react'
import { auth } from '@/lib/firebase'
import { APIClient } from '@/lib/api-client'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const router = useRouter()

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
            if (!firebaseUser) {
                router.push('/auth/login')
                return
            }

            try {
                const data = await APIClient.getProfile()
                setUser(data.user)
                setLoading(false)
            } catch (err: any) {
                console.error('Error fetching profile:', err)
                setError(err.message || 'Failed to load profile')
                setLoading(false)
            }
        })

        return () => unsubscribe()
    }, [router])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                <div className="text-white text-xl">Loading dashboard...</div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 max-w-md w-full">
                    <h2 className="text-2xl font-bold text-red-400 mb-4">Error</h2>
                    <p className="text-white mb-4">{error}</p>
                    <button 
                        onClick={() => {
                            auth.signOut()
                            router.push('/auth/login')
                        }}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-white">
                        Welcome back, {user?.displayName || 'User'}!
                    </h1>
                    <button 
                        onClick={async () => {
                            await auth.signOut()
                            router.push('/auth/login')
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
                    >
                        Sign Out
                    </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                        <div className="text-slate-300 text-sm mb-2">Total XP</div>
                        <div className="text-3xl font-bold text-white">
                            {user?.profile?.totalXP || 0}
                        </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                        <div className="text-slate-300 text-sm mb-2">Streak</div>
                        <div className="text-3xl font-bold text-white">
                            {user?.profile?.streak || 0} days
                        </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                        <div className="text-slate-300 text-sm mb-2">Lessons Completed</div>
                        <div className="text-3xl font-bold text-white">
                            {user?.profile?.lessonsCompleted || 0}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}