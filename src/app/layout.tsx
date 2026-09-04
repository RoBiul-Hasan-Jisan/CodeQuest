import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CodeQuest — Your coding study companion',
  description:
    'CodeQuest brings tasks, LeetCode practice, deadlines, focus sessions, courses and friends into one place for coding students.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
