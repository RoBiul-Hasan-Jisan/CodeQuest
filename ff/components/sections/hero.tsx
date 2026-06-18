'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-20 pb-12 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 dark:bg-blue-900/20 rounded-full blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-200 dark:bg-purple-900/20 rounded-full blur-3xl opacity-20 animate-pulse" />
      </div>

      <motion.div
        className="max-w-4xl mx-auto text-center"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 mb-6">
          <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
            AI-Powered Learning Platform
          </span>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
        >
          Master English with{' '}
          <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            AI
          </span>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
        >
          Learn English faster with our intelligent AI tutor, interactive lessons, vocabulary builder, and real-time speech analysis. Join thousands of learners worldwide.
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg"
          >
            <Link href="/dashboard" className="flex items-center gap-2">
              Start Learning Free
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="text-lg"
          >
            <Link href="#features">Learn More</Link>
          </Button>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="mt-16 pt-12 border-t border-border/40"
        >
          <p className="text-sm text-muted-foreground mb-4">Trusted by learners globally</p>
          <div className="flex justify-center items-center gap-8 flex-wrap">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-8 bg-muted rounded flex items-center justify-center px-4 text-sm font-medium text-muted-foreground">
                Brand {i}
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
