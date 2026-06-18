import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UserProgress {
  userId: string
  totalLessonsCompleted: number
  currentStreak: number
  totalXP: number
  vocabularyLearned: number
  grammarTopicsCompleted: number
  essaysWritten: number
  speakingMinutes: number
}

interface LearningModule {
  id: string
  title: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  completed: boolean
  progress: number
}

interface Store {
  userProgress: UserProgress | null
  setUserProgress: (progress: UserProgress) => void
  
  learningModules: LearningModule[]
  addModule: (module: LearningModule) => void
  updateModule: (id: string, updates: Partial<LearningModule>) => void
  
  darkMode: boolean
  toggleDarkMode: () => void
}

export const useStore = create<Store>()(
  persist(
    (set) => ({
      userProgress: null,
      setUserProgress: (progress) => set({ userProgress: progress }),
      
      learningModules: [],
      addModule: (module) => set((state) => ({
        learningModules: [...state.learningModules, module]
      })),
      updateModule: (id, updates) => set((state) => ({
        learningModules: state.learningModules.map((m) =>
          m.id === id ? { ...m, ...updates } : m
        )
      })),
      
      darkMode: false,
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
    }),
    {
      name: 'english-learning-store',
    }
  )
)
