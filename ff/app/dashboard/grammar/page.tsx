'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, XCircle, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

const exercises = [
  {
    id: 1,
    question: 'Choose the correct sentence:',
    options: [
      'She have gone to the store.',
      'She has gone to the store.',
      'She do go to the store.',
      'She are going to the store.',
    ],
    correct: 1,
    explanation: 'With third person singular subjects (she, he, it), use "has" instead of "have".',
  },
  {
    id: 2,
    question: 'Select the sentence with correct past tense:',
    options: [
      'I go to the market yesterday.',
      'I went to the market yesterday.',
      'I am going to the market yesterday.',
      'I was going to the market.',
    ],
    correct: 1,
    explanation: 'With time expressions like "yesterday", use simple past tense (went).',
  },
  {
    id: 3,
    question: 'Which sentence uses correct subject-verb agreement?',
    options: [
      'Either John or his friends is coming.',
      'Either John or his friends are coming.',
      'Both is correct.',
      'None of the above.',
    ],
    correct: 1,
    explanation: 'With "either...or", the verb agrees with the nearest subject (friends - plural).',
  },
]

export default function GrammarPage() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [score, setScore] = useState(0)

  const current = exercises[currentIndex]
  const isCorrect = selectedAnswer === current.correct

  const handleSubmit = () => {
    if (selectedAnswer !== null) {
      if (isCorrect) {
        setScore(score + 1)
      }
      setShowExplanation(true)
    }
  }

  const handleNext = () => {
    setSelectedAnswer(null)
    setShowExplanation(false)
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      // Reset for retake
      setCurrentIndex(0)
      setScore(0)
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

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants}>
          <h1 className="text-3xl font-bold">Grammar Lab</h1>
          <p className="text-muted-foreground mt-1">Master English grammar with interactive exercises</p>
        </motion.div>
      </motion.div>

      <motion.div
        className="max-w-2xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants} className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">
              Question {currentIndex + 1} of {exercises.length}
            </span>
            <span className="text-sm font-medium">Score: {score}/{currentIndex}</span>
          </div>
          <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
              initial={{ width: 0 }}
              animate={{ width: `${((currentIndex + 1) / exercises.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </motion.div>

        {/* Question */}
        <motion.div variants={itemVariants} className="bg-card border border-border/40 rounded-xl p-8 mb-6">
          <h2 className="text-xl font-semibold mb-6">{current.question}</h2>

          <div className="space-y-3 mb-8">
            {current.options.map((option, index) => (
              <motion.button
                key={index}
                onClick={() => !showExplanation && setSelectedAnswer(index)}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  selectedAnswer === index
                    ? 'border-primary bg-primary/10'
                    : 'border-border/40 hover:border-primary/50'
                } ${showExplanation && index === current.correct ? 'border-green-500 bg-green-500/10' : ''} ${
                  showExplanation && selectedAnswer === index && !isCorrect ? 'border-red-500 bg-red-500/10' : ''
                }`}
                disabled={showExplanation}
                whileHover={!showExplanation ? { scale: 1.02 } : {}}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedAnswer === index ? 'border-primary bg-primary/20' : 'border-border/40'
                    }`}
                  >
                    {selectedAnswer === index && (
                      <div className="w-2 h-2 bg-primary rounded-full" />
                    )}
                  </div>
                  <span className="flex-1">{option}</span>
                  {showExplanation && index === current.correct && (
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  )}
                  {showExplanation && selectedAnswer === index && !isCorrect && (
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  )}
                </div>
              </motion.button>
            ))}
          </div>

          {!showExplanation ? (
            <Button
              onClick={handleSubmit}
              disabled={selectedAnswer === null}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
            >
              Submit Answer
            </Button>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg mb-4 ${isCorrect ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}
            >
              <p className={`font-semibold mb-2 ${isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
              </p>
              <p className="text-sm">{current.explanation}</p>
            </motion.div>
          )}
        </motion.div>

        {showExplanation && (
          <motion.div variants={itemVariants} className="text-center">
            <Button
              onClick={handleNext}
              className="gap-2"
              size="lg"
            >
              {currentIndex === exercises.length - 1 ? 'Try Again' : 'Next Question'}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
