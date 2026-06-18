'use client'

import { motion } from 'framer-motion'
import { Flame, BookOpen, Zap, Award } from 'lucide-react'

const stats = [
  {
    icon: Flame,
    label: 'Current Streak',
    value: '12',
    unit: 'days',
    color: 'from-orange-500 to-red-500',
  },
  {
    icon: BookOpen,
    label: 'Words Learned',
    value: '342',
    unit: 'words',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Zap,
    label: 'XP Earned',
    value: '2,450',
    unit: 'points',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    icon: Award,
    label: 'Lessons Done',
    value: '45',
    unit: 'lessons',
    color: 'from-purple-500 to-pink-500',
  },
]

export function QuickStats() {
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
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <motion.div
            key={index}
            variants={itemVariants}
            className="p-6 rounded-xl border border-border/40 bg-card hover:border-primary/50 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color} text-white`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{stat.value}</span>
              <span className="text-sm text-muted-foreground">{stat.unit}</span>
            </div>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
