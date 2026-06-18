'use client'

import { motion } from 'framer-motion'
import { BookOpen, PenTool, Mic, Brain } from 'lucide-react'

const activities = [
  {
    icon: Brain,
    title: 'AI Tutor Session',
    description: 'Completed lesson',
    time: '2 hours ago',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: BookOpen,
    title: 'Vocabulary',
    description: '10 new words',
    time: '5 hours ago',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: PenTool,
    title: 'Writing Practice',
    description: 'Essay submitted',
    time: '1 day ago',
    color: 'from-orange-500 to-red-500',
  },
  {
    icon: Mic,
    title: 'Speaking',
    description: '15 min practice',
    time: '2 days ago',
    color: 'from-green-500 to-emerald-500',
  },
]

export function RecentActivity() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 },
    },
  }

  return (
    <motion.div
      className="bg-card border border-border/40 rounded-xl p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
      <div className="space-y-4">
        {activities.map((activity, index) => {
          const Icon = activity.icon
          return (
            <motion.div
              key={index}
              variants={itemVariants}
              className="flex items-start gap-4 pb-4 border-b border-border/40 last:border-b-0 last:pb-0"
            >
              <div className={`p-2 rounded-lg bg-gradient-to-br ${activity.color} text-white flex-shrink-0`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{activity.title}</p>
                <p className="text-xs text-muted-foreground">{activity.description}</p>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
