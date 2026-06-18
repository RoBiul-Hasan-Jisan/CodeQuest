'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mic, Play, RotateCw, Volume2, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

const scenarios = [
  {
    id: 1,
    title: 'At a Restaurant',
    description: 'Practice ordering food and making restaurant reservations',
    phrases: [
      'I would like to order...',
      'Could I have the bill, please?',
      'Do you have any vegetarian options?',
      'What do you recommend?',
    ],
    difficulty: 'Beginner',
  },
  {
    id: 2,
    title: 'Job Interview',
    description: 'Master professional speaking for interviews',
    phrases: [
      'Tell me about your experience...',
      'What are your strengths?',
      'Where do you see yourself in 5 years?',
      'Thank you for the opportunity.',
    ],
    difficulty: 'Advanced',
  },
  {
    id: 3,
    title: 'Travel Conversation',
    description: 'Communicate confidently while traveling',
    phrases: [
      'Where is the nearest train station?',
      'How much does this cost?',
      'Could you recommend a good hotel?',
      'I need to book a flight.',
    ],
    difficulty: 'Intermediate',
  },
]

export default function SpeakingPage() {
  const [selectedScenario, setSelectedScenario] = useState<number | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [hasRecorded, setHasRecorded] = useState(false)

  const current = selectedScenario !== null ? scenarios[selectedScenario] : null

  const handleRecord = () => {
    setIsRecording(!isRecording)
    if (!isRecording) {
      // Simulate recording
      setTimeout(() => {
        setIsRecording(false)
        setHasRecorded(true)
      }, 3000)
    }
  }

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

  if (current) {
    return (
      <div className="p-6 space-y-6">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.button
            variants={itemVariants}
            onClick={() => {
              setSelectedScenario(null)
              setHasRecorded(false)
            }}
            className="text-primary hover:text-primary/80 mb-4 flex items-center gap-1"
          >
            ← Back to Scenarios
          </motion.button>

          <motion.div variants={itemVariants}>
            <h1 className="text-3xl font-bold">{current.title}</h1>
            <p className="text-muted-foreground mt-1">{current.description}</p>
          </motion.div>
        </motion.div>

        <motion.div
          className="max-w-2xl mx-auto space-y-6"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Recording Section */}
          <motion.div variants={itemVariants} className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-border/40 rounded-xl p-8">
            <h2 className="font-semibold mb-6">Practice Speaking</h2>

            <div className="flex flex-col items-center gap-6">
              <motion.button
                onClick={handleRecord}
                className={`w-24 h-24 rounded-full flex items-center justify-center font-bold transition-all ${
                  isRecording
                    ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Mic className="w-10 h-10" />
              </motion.button>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  {isRecording ? 'Recording... Click to stop' : hasRecorded ? 'Recording complete!' : 'Click the button to start recording'}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Feedback Section */}
          {hasRecorded && (
            <motion.div variants={itemVariants} className="bg-card border border-border/40 rounded-xl p-6 space-y-4">
              <h3 className="font-semibold">Your Recording</h3>
              <Button variant="outline" className="w-full gap-2">
                <Play className="w-4 h-4" />
                Play Recording
              </Button>
              <Button variant="outline" className="w-full gap-2">
                <RotateCw className="w-4 h-4" />
                Record Again
              </Button>

              <div className="pt-4 border-t border-border/40 space-y-2">
                <h4 className="font-semibold text-sm">Feedback</h4>
                <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
                  <p>✓ Clear pronunciation</p>
                  <p>✓ Good pace and rhythm</p>
                  <p>• Try to use more stress on important words</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Practice Phrases */}
          <motion.div variants={itemVariants} className="bg-card border border-border/40 rounded-xl p-6">
            <h3 className="font-semibold mb-4">Key Phrases to Practice</h3>
            <div className="space-y-3">
              {current.phrases.map((phrase, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <span className="text-sm">{phrase}</span>
                  <Button variant="ghost" size="icon">
                    <Volume2 className="w-4 h-4" />
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants}>
          <h1 className="text-3xl font-bold">Speaking Practice</h1>
          <p className="text-muted-foreground mt-1">Improve your pronunciation and speaking confidence</p>
        </motion.div>
      </motion.div>

      <motion.div
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {scenarios.map((scenario, index) => (
          <motion.div
            key={scenario.id}
            variants={itemVariants}
            onClick={() => setSelectedScenario(index)}
            className="bg-card border border-border/40 rounded-xl p-6 hover:border-primary/50 transition-all duration-300 cursor-pointer group"
          >
            <div className="mb-4">
              <h3 className="font-bold text-lg">{scenario.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{scenario.description}</p>
            </div>

            <div className="flex items-center justify-between">
              <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                scenario.difficulty === 'Beginner'
                  ? 'bg-green-500/20 text-green-600 dark:text-green-400'
                  : scenario.difficulty === 'Intermediate'
                  ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
                  : 'bg-red-500/20 text-red-600 dark:text-red-400'
              }`}>
                {scenario.difficulty}
              </span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
