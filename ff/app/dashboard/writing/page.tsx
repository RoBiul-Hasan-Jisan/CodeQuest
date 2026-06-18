'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, Download, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function WritingPage() {
  const [text, setText] = useState('')
  const [feedback, setFeedback] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleAnalyze = async () => {
    if (!text.trim()) return
    
    setIsAnalyzing(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      setFeedback(`Grammar Analysis: ✓ Passed\n\nStyle Suggestions:\n- Consider varying sentence length\n- Strong use of vocabulary\n- Clear structure\n\nFeedback:\n"The text is well-organized and clear. You demonstrate good command of English grammar and vocabulary."`)
    } finally {
      setIsAnalyzing(false)
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
          <h1 className="text-3xl font-bold">Writing Assistant</h1>
          <p className="text-muted-foreground mt-1">Get AI-powered feedback on your English writing</p>
        </motion.div>
      </motion.div>

      <motion.div
        className="grid lg:grid-cols-2 gap-6"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Input Section */}
        <motion.div variants={itemVariants} className="space-y-4">
          <div className="bg-card border border-border/40 rounded-xl p-6">
            <label className="text-sm font-semibold block mb-3">Your Writing</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write or paste your English text here. It can be an essay, email, or any piece of writing..."
              className="w-full h-80 p-4 rounded-lg border border-border/40 bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <div className="flex justify-between items-center mt-4">
              <span className="text-xs text-muted-foreground">
                {text.length} characters • {text.split(/\s+/).filter(Boolean).length} words
              </span>
              <Button
                onClick={handleAnalyze}
                disabled={!text.trim() || isAnalyzing}
                className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600"
              >
                <Send className="w-4 h-4" />
                {isAnalyzing ? 'Analyzing...' : 'Analyze'}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Feedback Section */}
        <motion.div variants={itemVariants} className="space-y-4">
          <div className="bg-card border border-border/40 rounded-xl p-6 h-96 overflow-y-auto">
            <label className="text-sm font-semibold block mb-3">Feedback & Suggestions</label>
            {feedback ? (
              <div className="space-y-4 text-sm whitespace-pre-wrap">
                {feedback}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <p className="text-center">
                  Write something and click &quot;Analyze&quot; to get feedback
                </p>
              </div>
            )}
          </div>
          {feedback && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={() => navigator.clipboard.writeText(feedback)}
              >
                <Copy className="w-4 h-4" />
                Copy Feedback
              </Button>
              <Button
                variant="outline"
                className="flex-1 gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Tips Section */}
      <motion.div variants={itemVariants} className="bg-muted/30 rounded-xl p-6">
        <h3 className="font-semibold mb-3">Writing Tips</h3>
        <ul className="grid md:grid-cols-2 gap-3 text-sm">
          <li className="flex gap-2">
            <span className="text-primary font-bold">•</span>
            <span>Use varied sentence structures to keep writing interesting</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary font-bold">•</span>
            <span>Proofread for spelling and punctuation errors</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary font-bold">•</span>
            <span>Use transition words to connect ideas smoothly</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary font-bold">•</span>
            <span>Choose clear, specific words instead of vague ones</span>
          </li>
        </ul>
      </motion.div>
    </div>
  )
}
