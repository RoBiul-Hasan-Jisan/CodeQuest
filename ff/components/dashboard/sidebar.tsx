'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Brain,
  BookOpen,
  PenTool,
  Mic,
  BarChart3,
  Settings,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard', badge: null },
  { icon: Brain, label: 'AI Tutor', href: '/dashboard/tutor', badge: null },
  { icon: BookOpen, label: 'Vocabulary', href: '/dashboard/vocabulary', badge: null },
  { icon: PenTool, label: 'Writing', href: '/dashboard/writing', badge: null },
  { icon: BarChart3, label: 'Grammar Lab', href: '/dashboard/grammar', badge: null },
  { icon: Mic, label: 'Speaking', href: '/dashboard/speaking', badge: 'New' },
  { icon: BarChart3, label: 'Analytics', href: '/dashboard/analytics', badge: null },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex w-64 bg-card border-r border-border/40 flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border/40">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
            E
          </div>
          <span>EnglishAI</span>
        </Link>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors relative group',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-muted'
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{item.label}</span>
              {item.badge && (
                <span className="ml-auto text-xs px-2 py-1 rounded bg-blue-500 text-white">
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom Menu */}
      <div className="p-4 border-t border-border/40 space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3"
          asChild
        >
          <Link href="/dashboard/settings">
            <Settings className="w-5 h-5" />
            Settings
          </Link>
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-destructive hover:text-destructive"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </Button>
      </div>
    </aside>
  )
}
