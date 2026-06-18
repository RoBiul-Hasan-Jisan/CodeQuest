'use client'

import { useTheme } from 'next-themes'
import { useRouter } from 'next/navigation'
import { Moon, Sun, Menu, LogOut, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUser } from '@/lib/user-context'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useState } from 'react'

export function DashboardHeader() {
  const { theme, setTheme } = useTheme()
  const { user } = useUser()
  const router = useRouter()
  const [showMenu, setShowMenu] = useState(false)

  const handleLogout = async () => {
    try {
      await signOut(auth)
      localStorage.removeItem('authToken')
      localStorage.removeItem('uid')
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <header className="border-b border-border/40 bg-card px-6 py-4 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-semibold hidden sm:block">Learning Dashboard</h1>
      </div>

      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => setShowMenu(!showMenu)}
          >
            <MoreVertical className="w-5 h-5" />
          </Button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-card border border-border/40 rounded-lg shadow-lg py-2">
              <div className="px-4 py-2 border-b border-border/40">
                <p className="text-sm font-medium">{user?.displayName}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm hover:bg-accent flex gap-2 items-center"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
