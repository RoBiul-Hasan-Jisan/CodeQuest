export type Task = {
  id: string;
  title: string;
  description: string | null;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  dueDate: string | null;
  completed: boolean;
  category: string | null;
  createdAt: string;
  completedAt: string | null;
};

export type Project = {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  color: string;
  progress: number;
  createdAt: string;
};

export type ProgressEntry = {
  id: string;
  progressDate: string;
  problemsSolved: number;
};

export type LeetCodeProblem = {
  id: string;
  title: string;
  tags: string | null;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  solved: boolean;
  url: string | null;
  solvedAt: string | null;
  createdAt: string;
};

export type Course = {
  id: string;
  code: string;
  name: string;
  instructor: string | null;
  imagePath: string | null;
  createdAt: string;
};

export type CourseItem = {
  id: string;
  courseId: string;
  type: 'notes' | 'resources' | 'slides' | 'tasks';
  text: string | null;
  name: string | null;
  link: string | null;
  title: string | null;
  completed: boolean;
  createdAt: string;
};
