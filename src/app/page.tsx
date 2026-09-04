import Link from 'next/link';

const FEATURES = [
  { tag: 'todo', title: 'Tasks', desc: 'Priority, due dates, categories — cleared daily.' },
  { tag: 'lc', title: 'LeetCode log', desc: 'Track what you solved and what is left.' },
  { tag: 'cal', title: 'Project calendar', desc: 'Deadlines laid out by week and month.' },
  { tag: 'stats', title: 'Progress heatmap', desc: 'A GitHub-style view of your streak.' },
  { tag: 'timer', title: 'Focus sessions', desc: 'A 25-minute timer built for deep work.' },
  { tag: 'hub', title: 'Course workspace', desc: 'Notes, slides and resources per course.' },
  { tag: 'net', title: 'Friends', desc: 'Add classmates, see who is online and studying.' },
  { tag: 'msg', title: 'Messages', desc: 'One-to-one chat with people you study with.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <header className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet to-teal flex items-center justify-center text-bg font-bold text-sm">
            CQ
          </span>
          <span className="font-semibold text-lg tracking-tight">CodeQuest</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-ink-dim hover:text-ink transition-colors">
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-violet px-4 py-2 text-sm font-medium text-white hover:bg-violet/85 transition-colors"
          >
            Get started
          </Link>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 pt-16 pb-20 rise">
        <p className="font-mono-tag text-teal text-sm mb-4">study_companion.init()</p>
        <h1 className="text-4xl md:text-6xl font-semibold tracking-tight max-w-3xl leading-[1.05]">
          One workspace for the whole grind of learning to code.
        </h1>
        <p className="mt-6 text-ink-dim max-w-xl text-lg">
          Tasks, LeetCode practice, project deadlines, focus sessions and course notes —
          CodeQuest keeps a coding student&apos;s whole routine in a single place, instead of six different apps.
        </p>
        <div className="mt-8 flex items-center gap-4">
          <Link
            href="/signup"
            className="rounded-lg bg-violet px-6 py-3 text-sm font-medium text-white hover:bg-violet/85 transition-colors"
          >
            Create your account
          </Link>
          <Link href="/login" className="text-sm text-ink-dim hover:text-ink transition-colors">
            I already have one →
          </Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-border bg-surface/60 p-5 hover:border-violet/50 transition-colors"
            >
              <p className="font-mono-tag text-xs text-teal mb-3">{f.tag}</p>
              <h3 className="font-semibold mb-1">{f.title}</h3>
              <p className="text-sm text-ink-dim">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="max-w-6xl mx-auto px-6 pb-10 text-xs text-ink-dim/60 font-mono-tag">
        CodeQuest — built by Robiul Hasan Jisan
      </footer>
    </div>
  );
}
