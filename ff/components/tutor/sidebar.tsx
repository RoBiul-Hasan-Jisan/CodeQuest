'use client'

import { Plus, MessageSquare, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'

const lessons = [
  { id: 1, title: 'Present Tense Basics', date: 'Today' },
  { id: 2, title: 'Common Phrasal Verbs', date: 'Yesterday' },
  { id: 3, title: 'Conditional Sentences', date: '2 days ago' },
  { id: 4, title: 'Passive Voice', date: '1 week ago' },
]

export function TutorSidebar() {
  return (
    <div className="hidden lg:flex w-64 flex-col bg-card border-r border-border/40">
      {/* Header */}
      <div className="p-4 border-b border-border/40">
        <Button className="w-full gap-2 bg-gradient-to-r from-blue-600 to-purple-600">
          <Plus className="w-4 h-4" />
          New Lesson
        </Button>
      </div>

      {/* Conversation History */}
      <div className="flex-1 overflow-y-auto p-4">
        <p className="text-xs font-semibold text-muted-foreground mb-3 px-2">RECENT LESSONS</p>
        <div className="space-y-2">
          {lessons.map((lesson) => (
            <button
              key={lesson.id}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted transition-colors group"
            >
              <div className="flex items-start gap-2">
                <MessageSquare className="w-4 h-4 flex-shrink-0 mt-0.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{lesson.title}</p>
                  <p className="text-xs text-muted-foreground">{lesson.date}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom menu */}
      <div className="p-4 border-t border-border/40 space-y-2">
        <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground">
          <Settings className="w-4 h-4" />
          Tutor Settings
        </Button>
      </div>
    </div>
  )
}
