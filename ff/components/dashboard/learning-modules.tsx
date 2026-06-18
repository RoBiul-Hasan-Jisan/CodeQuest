'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Brain, BookOpen, PenTool, Mic, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

const modules = [
  {
    id: 'tutor',
    icon: Brain,
    title: 'AI English Tutor',
    description: 'Get personalized lessons with real-time feedback',
    progress: 65,
    lessons: 15,
    href: '/dashboard/tutor',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'vocab',
    icon: BookOpen,
    title: 'Vocabulary Builder',
    description: 'Learn 2000+ essential English words',
    progress: 42,
    lessons: 20,
    href: '/dashboard/vocabulary',
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 'writing',
    icon: PenTool,
    title: 'Writing Assistant',
    description: 'Improve your writing with AI corrections',
    progress: 58,
    lessons: 12,
    href: '/dashboard/writing',
    color: 'from-orange-500 to-red-500',
  },
  {
    id: 'speaking',
    icon: Mic,
    title: 'Speaking Practice',
    description: 'Master pronunciation and speaking skills',
    progress: 35,
    lessons: 18,
    href: '/dashboard/speaking',
    color: 'from-green-500 to-emerald-500',
  },
]

export function LearningModules() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Continue Learning</h2>
      <motion.div
        className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {modules.map((module) => {
          const Icon = module.icon
          return (
            <motion.div
              key={module.id}
              variants={itemVariants}
              className="bg-card border border-border/40 rounded-xl p-6 hover:border-primary/50 transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${module.color} text-white`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <h3 className="font-bold text-lg mb-1">{module.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{module.description}</p>

              <div className="space-y-3 mb-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">Progress</span>
                    <span className="text-muted-foreground">{module.progress}%</span>
                  </div>
                  <Progress value={module.progress} className="h-2" />
                </div>
                <p className="text-xs text-muted-foreground">
                  {module.lessons} lessons available
                </p>
              </div>

              <Button
                asChild
                variant="ghost"
                className="w-full justify-between group"
              >
                <Link href={module.href}>
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}
