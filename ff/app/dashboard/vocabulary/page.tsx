'use client'

import { motion } from 'framer-motion'
import { BookOpen, Volume2, RotateCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

const vocabularyCards = [
  {
    word: 'Eloquent',
    pronunciation: 'el-uh-kwuhnt',
    definition: 'Fluent, expressive, and persuasive in speech or writing',
    example: 'The eloquent speech moved everyone in the audience.',
    partOfSpeech: 'adjective',
  },
  {
    word: 'Pragmatic',
    pronunciation: 'prag-mat-ik',
    definition: 'Dealing with things in a practical, realistic way',
    example: 'We need a pragmatic approach to solve this problem.',
    partOfSpeech: 'adjective',
  },
  {
    word: 'Serendipity',
    pronunciation: 'ser-uhn-dip-i-tee',
    definition: 'The occurrence of events by chance in a happy or beneficial way',
    example: 'Meeting my best friend was pure serendipity.',
    partOfSpeech: 'noun',
  },
  {
    word: 'Ephemeral',
    pronunciation: 'i-fem-er-uhl',
    definition: 'Lasting for a very short time; transitory',
    example: 'Cherry blossoms are ephemeral, blooming for only a few weeks.',
    partOfSpeech: 'adjective',
  },
]

export default function VocabularyPage() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  const current = vocabularyCards[currentIndex]

  const handleNext = () => {
    setFlipped(false)
    setCurrentIndex((prev) => (prev + 1) % vocabularyCards.length)
  }

  const handlePrev = () => {
    setFlipped(false)
    setCurrentIndex((prev) => (prev - 1 + vocabularyCards.length) % vocabularyCards.length)
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
    <div className="p-6 space-y-8">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants}>
          <h1 className="text-3xl font-bold">Vocabulary Builder</h1>
          <p className="text-muted-foreground mt-1">Learn and master new English words</p>
        </motion.div>
      </motion.div>

      <motion.div
        className="max-w-2xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants} className="mb-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-muted-foreground">
              Card {currentIndex + 1} of {vocabularyCards.length}
            </span>
            <div className="text-sm font-medium">
              <span className="text-primary">{currentIndex + 1}</span>
              <span className="text-muted-foreground">/{vocabularyCards.length}</span>
            </div>
          </div>
          <div className="w-full bg-gradient-to-r from-blue-200 to-purple-200 dark:from-blue-900/30 dark:to-purple-900/30 h-1 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
              initial={{ width: 0 }}
              animate={{ width: `${((currentIndex + 1) / vocabularyCards.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </motion.div>

        {/* Flashcard */}
        <motion.div
          variants={itemVariants}
          className="h-96 cursor-pointer perspective mb-6"
          onClick={() => setFlipped(!flipped)}
        >
          <motion.div
            className="relative w-full h-full"
            initial={false}
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{ duration: 0.6 }}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Front */}
            <div
              className="absolute w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-8 flex flex-col items-center justify-center shadow-xl"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <div className="text-white text-center space-y-4">
                <h2 className="text-5xl font-bold">{current.word}</h2>
                <p className="text-blue-100 text-lg">{current.partOfSpeech}</p>
                <div className="flex items-center justify-center gap-2 pt-4">
                  <Volume2 className="w-5 h-5" />
                  <p className="text-sm">{current.pronunciation}</p>
                </div>
              </div>
              <p className="absolute bottom-8 text-white/60 text-sm">Click to reveal definition</p>
            </div>

            {/* Back */}
            <div
              className="absolute w-full h-full bg-white dark:bg-slate-900 rounded-2xl p-8 flex flex-col justify-between shadow-xl"
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-2">Definition</h3>
                  <p className="text-lg">{current.definition}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-2">Example</h3>
                  <p className="text-lg italic">&quot;{current.example}&quot;</p>
                </div>
              </div>
              <p className="text-muted-foreground text-sm text-center">Click to see word</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Controls */}
        <motion.div variants={itemVariants} className="flex gap-4 justify-center">
          <Button onClick={handlePrev} variant="outline">
            Previous
          </Button>
          <Button
            onClick={() => setFlipped(!flipped)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RotateCw className="w-4 h-4" />
            Flip Card
          </Button>
          <Button onClick={handleNext} variant="default">
            Next
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}
