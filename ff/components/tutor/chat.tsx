'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Loader } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export function TutorChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your English AI Tutor. I\'m here to help you improve your English skills through interactive lessons, grammar explanations, and personalized feedback. What would you like to learn today?',
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  const [isScrolling, setIsScrolling] = useState(false)

  useEffect(() => {
    if (scrollRef.current && !isScrolling) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isScrolling])

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        onMouseEnter={() => setIsScrolling(true)}
        onMouseLeave={() => setIsScrolling(false)}
      >
        {messages.map((message, index) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-br-none'
                  : 'bg-muted text-foreground rounded-bl-none'
              }`}
            >
              <p className="text-sm leading-relaxed">{message.content}</p>
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="bg-muted text-foreground px-4 py-3 rounded-lg rounded-bl-none flex items-center gap-2">
              <Loader className="w-4 h-4 animate-spin" />
              <span className="text-sm">Typing...</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border/40 p-4 bg-card">
        <form
          onSubmit={async (e) => {
            e.preventDefault()
            if (!input.trim()) return

            const userMessage: Message = {
              id: Date.now().toString(),
              role: 'user',
              content: input,
            }

            setMessages((prev) => [...prev, userMessage])
            setInput('')
            setIsLoading(true)

            try {
              // Simulate AI response
              await new Promise((resolve) => setTimeout(resolve, 1500))
              const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content:
                  'That\'s a great question! To help you better, could you provide more context about what you\'d like to focus on? I can help you with grammar, vocabulary, pronunciation, or conversation practice.',
              }
              setMessages((prev) => [...prev, assistantMessage])
            } finally {
              setIsLoading(false)
            }
          }}
          className="flex gap-3"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about English..."
            className="flex-1 px-4 py-2 rounded-lg border border-border/40 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !input.trim()}
            className="bg-gradient-to-r from-blue-600 to-purple-600"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          AI Tutor is here to help you learn English • Ask questions • Get feedback • Practice together
        </p>
      </div>
    </div>
  )
}
