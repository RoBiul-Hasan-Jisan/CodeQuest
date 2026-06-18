'use client'

import { DashboardOverview } from '@/components/dashboard/overview'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { QuickStats } from '@/components/dashboard/quick-stats'
import { LearningModules } from '@/components/dashboard/learning-modules'
import { useUser } from '@/lib/user-context'
import { Loader } from 'lucide-react'

export default function DashboardPage() {
  const { user, loading } = useUser()

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {user?.displayName}!</h1>
        <p className="text-muted-foreground mt-1">Here&apos;s your learning progress today.</p>
      </div>

      <QuickStats />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DashboardOverview />
        </div>
        <div>
          <RecentActivity />
        </div>
      </div>
      <LearningModules />
    </div>
  )
}
