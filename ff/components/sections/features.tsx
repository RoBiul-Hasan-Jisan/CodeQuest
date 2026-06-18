'use client'

import { motion } from 'framer-motion'
import {
  Brain,
  BookOpen,
  Mic,
  PenTool,
  BarChart3,
  Zap,
} from 'lucide-react'

const features = [
  {
    icon: Brain,
    title: 'AI English Tutor',
    description: 'Get personalized English lessons with real-time feedback powered by advanced AI.',
  },
  {
    icon: BookOpen,
    title: 'Vocabulary Builder',
    description: 'Learn and master new words with interactive flashcards and contextual examples.',
  },
  {
    icon: PenTool,
    title: 'Writing Assistant',
    description: 'Improve your writing with AI-powered grammar checking and style suggestions.',
  },
  {
    icon: Mic,
    title: 'Speaking Practice',
    description: 'Practice pronunciation and speaking skills with speech recognition technology.',
  },
  {
    icon: BarChart3,
    title: 'Progress Analytics',
    description: 'Track your learning journey with detailed progress reports and insights.',
  },
  {
    icon: Zap,
    title: 'Grammar Lab',
    description: 'Master English grammar through interactive exercises and comprehensive lessons.',
  },
]

export function Features() {
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
      transition: { duration: 0.5 },
    },
  }

  return (
    <section id="features" className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <motion.h2 variants={itemVariants} className="text-4xl sm:text-5xl font-bold mb-4">
            Powerful Features for Effective Learning
          </motion.h2>
          <motion.p variants={itemVariants} className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to master English and achieve fluency
          </motion.p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="group relative p-8 rounded-xl border border-border/40 bg-card hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
