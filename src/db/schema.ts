import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

const id = () =>
  text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());

export const users = sqliteTable('users', {
  id: id(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: text('created_at').notNull().default(sql`(current_timestamp)`),
  lastLogin: text('last_login'),
});

export const tasks = sqliteTable('tasks', {
  id: id(),
  userId: text('user_id').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  priority: text('priority').notNull().default('MEDIUM'), // HIGH | MEDIUM | LOW
  dueDate: text('due_date'), // ISO date (yyyy-mm-dd)
  completed: integer('completed', { mode: 'boolean' }).notNull().default(false),
  category: text('category'),
  createdAt: text('created_at').notNull().default(sql`(current_timestamp)`),
  completedAt: text('completed_at'),
});

export const projects = sqliteTable('projects', {
  id: id(),
  userId: text('user_id').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  dueDate: text('due_date'),
  color: text('color').notNull().default('#6366f1'),
  progress: integer('progress').notNull().default(0),
  createdAt: text('created_at').notNull().default(sql`(current_timestamp)`),
});

export const progress = sqliteTable(
  'progress',
  {
    id: id(),
    userId: text('user_id').notNull(),
    progressDate: text('progress_date').notNull(), // yyyy-mm-dd
    problemsSolved: integer('problems_solved').notNull().default(0),
  },
  (t) => ({
    userDateIdx: uniqueIndex('progress_user_date_idx').on(t.userId, t.progressDate),
  })
);

export const leetcodeProblems = sqliteTable('leetcode_problems', {
  id: id(),
  userId: text('user_id').notNull(),
  title: text('title').notNull(),
  tags: text('tags'),
  difficulty: text('difficulty').notNull(), // Easy | Medium | Hard
  solved: integer('solved', { mode: 'boolean' }).notNull().default(false),
  url: text('url'),
  solvedAt: text('solved_at'),
  createdAt: text('created_at').notNull().default(sql`(current_timestamp)`),
});

export const friendships = sqliteTable('friendships', {
  id: id(),
  fromUsername: text('from_username').notNull(),
  toUsername: text('to_username').notNull(),
  status: text('status').notNull().default('PENDING'), // PENDING|ACCEPTED|DECLINED|BLOCKED
  createdAt: text('created_at').notNull().default(sql`(current_timestamp)`),
});

export const messages = sqliteTable('messages', {
  id: id(),
  senderUsername: text('sender_username').notNull(),
  receiverUsername: text('receiver_username').notNull(),
  content: text('content').notNull(),
  sentAt: text('sent_at').notNull().default(sql`(current_timestamp)`),
  readAt: text('read_at'),
});

export const courses = sqliteTable(
  'courses',
  {
    id: id(),
    userId: text('user_id').notNull(),
    code: text('code').notNull(),
    name: text('name').notNull(),
    instructor: text('instructor'),
    imagePath: text('image_path'),
    createdAt: text('created_at').notNull().default(sql`(current_timestamp)`),
  },
  (t) => ({
    userCodeIdx: uniqueIndex('courses_user_code_idx').on(t.userId, t.code),
  })
);

export const courseItems = sqliteTable('course_items', {
  id: id(),
  courseId: text('course_id').notNull(),
  type: text('type').notNull(), // notes | resources | slides | tasks
  text: text('text'),
  name: text('name'),
  link: text('link'),
  title: text('title'),
  completed: integer('completed', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull().default(sql`(current_timestamp)`),
});
