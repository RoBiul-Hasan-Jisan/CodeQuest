import Link from 'next/link'
import { Navigation } from '@/components/navigation'
import { Hero } from '@/components/sections/hero'
import { Features } from '@/components/sections/features'
import { Pricing } from '@/components/sections/pricing'
import { CTA } from '@/components/sections/cta'

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen bg-background">
      <Navigation />
      <Hero />
      <Features />
      <Pricing />
      <CTA />
    </main>
  )
}
