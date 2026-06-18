'use client'

import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const progressData = [
  { week: 'Week 1', lessons: 3, hours: 4.5 },
  { week: 'Week 2', lessons: 5, hours: 6.2 },
  { week: 'Week 3', lessons: 4, hours: 5.8 },
  { week: 'Week 4', lessons: 7, hours: 8.1 },
  { week: 'Week 5', lessons: 6, hours: 7.3 },
  { week: 'Week 6', lessons: 8, hours: 9.2 },
  { week: 'Week 7', lessons: 9, hours: 10.5 },
]

const skillsData = [
  { skill: 'Speaking', current: 65, target: 85 },
  { skill: 'Writing', current: 72, target: 90 },
  { skill: 'Reading', current: 78, target: 95 },
  { skill: 'Listening', current: 68, target: 88 },
  { skill: 'Grammar', current: 75, target: 92 },
]

export function DashboardOverview() {
  return (
    <div className="space-y-6">
      <div className="bg-card border border-border/40 rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4">Learning Progress</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={progressData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="week" stroke="var(--muted-foreground)" />
            <YAxis stroke="var(--muted-foreground)" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--card)',
                border: `1px solid var(--border)`,
                borderRadius: '0.5rem',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="lessons"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', r: 5 }}
              name="Lessons Completed"
            />
            <Line
              type="monotone"
              dataKey="hours"
              stroke="#a855f7"
              strokeWidth={2}
              dot={{ fill: '#a855f7', r: 5 }}
              name="Hours Studied"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-card border border-border/40 rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4">Skills Assessment</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={skillsData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="skill" stroke="var(--muted-foreground)" />
            <YAxis stroke="var(--muted-foreground)" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--card)',
                border: `1px solid var(--border)`,
                borderRadius: '0.5rem',
              }}
            />
            <Legend />
            <Bar dataKey="current" fill="#3b82f6" name="Current Level" radius={[8, 8, 0, 0]} />
            <Bar dataKey="target" fill="#a855f7" name="Target Level" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
