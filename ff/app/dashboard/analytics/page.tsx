'use client'

import { motion } from 'framer-motion'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { TrendingUp, Award, Clock, Zap } from 'lucide-react'

const weeklyData = [
  { day: 'Mon', minutes: 45 },
  { day: 'Tue', minutes: 60 },
  { day: 'Wed', minutes: 55 },
  { day: 'Thu', minutes: 75 },
  { day: 'Fri', minutes: 90 },
  { day: 'Sat', minutes: 85 },
  { day: 'Sun', minutes: 70 },
]

const skillsData = [
  { name: 'Speaking', value: 65, color: '#3b82f6' },
  { name: 'Writing', value: 72, color: '#a855f7' },
  { name: 'Reading', value: 78, color: '#ec4899' },
  { name: 'Listening', value: 68, color: '#f59e0b' },
]

const monthlyProgress = [
  { week: 'Week 1', lessons: 3, xp: 150 },
  { week: 'Week 2', lessons: 5, xp: 280 },
  { week: 'Week 3', lessons: 4, xp: 220 },
  { week: 'Week 4', lessons: 8, xp: 450 },
]

const metrics = [
  {
    icon: Clock,
    label: 'Total Study Time',
    value: '47.5',
    unit: 'hours',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Award,
    label: 'Achievements',
    value: '12',
    unit: 'badges',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: TrendingUp,
    label: 'Current Streak',
    value: '12',
    unit: 'days',
    color: 'from-orange-500 to-red-500',
  },
  {
    icon: Zap,
    label: 'Total XP',
    value: '2,450',
    unit: 'points',
    color: 'from-yellow-500 to-orange-500',
  },
]

export default function AnalyticsPage() {
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
          <h1 className="text-3xl font-bold">Progress Analytics</h1>
          <p className="text-muted-foreground mt-1">Track your learning journey and improvement</p>
        </motion.div>
      </motion.div>

      {/* Metrics Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {metrics.map((metric, index) => {
          const Icon = metric.icon
          return (
            <motion.div
              key={index}
              variants={itemVariants}
              className="bg-card border border-border/40 rounded-xl p-6"
            >
              <div className={`p-3 rounded-lg bg-gradient-to-br ${metric.color} text-white w-fit mb-4`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">{metric.label}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{metric.value}</span>
                <span className="text-sm text-muted-foreground">{metric.unit}</span>
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Charts Grid */}
      <motion.div
        className="grid lg:grid-cols-2 gap-6"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Weekly Study Time */}
        <motion.div variants={itemVariants} className="bg-card border border-border/40 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">Weekly Study Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="day" stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: `1px solid var(--border)`,
                  borderRadius: '0.5rem',
                }}
              />
              <Bar dataKey="minutes" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Skills Distribution */}
        <motion.div variants={itemVariants} className="bg-card border border-border/40 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">Skills Assessment</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={skillsData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {skillsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Monthly Progress */}
        <motion.div variants={itemVariants} className="bg-card border border-border/40 rounded-xl p-6 lg:col-span-2">
          <h2 className="text-xl font-bold mb-4">Monthly Progress</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyProgress}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="week" stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" yAxisId="left" />
              <YAxis stroke="var(--muted-foreground)" yAxisId="right" orientation="right" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: `1px solid var(--border)`,
                  borderRadius: '0.5rem',
                }}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="lessons"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6' }}
                name="Lessons Completed"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="xp"
                stroke="#a855f7"
                strokeWidth={2}
                dot={{ fill: '#a855f7' }}
                name="XP Earned"
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </motion.div>

      {/* Achievements Section */}
      <motion.div variants={itemVariants} className="bg-card border border-border/40 rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4">Recent Achievements</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[
            { emoji: '🎯', name: 'First Steps', desc: 'Complete your first lesson' },
            { emoji: '🔥', name: 'On Fire!', desc: '7-day streak' },
            { emoji: '📚', name: 'Bookworm', desc: '50 words learned' },
            { emoji: '✍️', name: 'Writer', desc: '5 essays completed' },
            { emoji: '🎤', name: 'Speaker', desc: '10 speaking sessions' },
            { emoji: '🏆', name: 'Master', desc: '100 lessons completed' },
            { emoji: '⭐', name: 'Rising Star', desc: '1000 XP earned' },
            { emoji: '🎓', name: 'Graduated', desc: 'Complete a module' },
          ].map((achievement, index) => (
            <motion.div
              key={index}
              className="bg-muted/50 rounded-lg p-4 text-center hover:bg-muted transition-colors"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-3xl mb-2">{achievement.emoji}</div>
              <p className="text-sm font-semibold">{achievement.name}</p>
              <p className="text-xs text-muted-foreground">{achievement.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
