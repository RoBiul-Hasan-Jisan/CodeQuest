'use client'

import Link from 'next/link'
import { useTheme } from 'next-themes'
import { Moon, Sun, Menu } from 'lucide-react'
import { Button } from './ui/button'
import { useState } from 'react'

export function Navigation() {
  const { theme, setTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
            E
          </div>
          <span className="hidden sm:inline">EnglishAI</span>
        </Link>

        {/* Desktop menu */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">
            Features
          </Link>
          <Link href="#pricing" className="text-sm font-medium hover:text-primary transition-colors">
            Pricing
          </Link>
          <Link href="#" className="text-sm font-medium hover:text-primary transition-colors">
            Blog
          </Link>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle theme"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          <Button asChild variant="default" className="hidden sm:inline-flex">
            <Link href="/dashboard">Get Started</Link>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/40 px-4 py-4 space-y-3">
          <Link href="#features" className="block text-sm font-medium hover:text-primary py-2">
            Features
          </Link>
          <Link href="#pricing" className="block text-sm font-medium hover:text-primary py-2">
            Pricing
          </Link>
          <Link href="#" className="block text-sm font-medium hover:text-primary py-2">
            Blog
          </Link>
          <Button asChild variant="default" className="w-full">
            <Link href="/dashboard">Get Started</Link>
          </Button>
        </div>
      )}
    </header>
  )
}
