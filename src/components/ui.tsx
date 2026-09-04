export function Card({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border border-border bg-surface/70 backdrop-blur-sm p-5 ${className}`}>
      {children}
    </div>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-end justify-between mb-5 gap-4 flex-wrap">
      <div>
        {eyebrow && <p className="font-mono-tag text-xs text-teal mb-1">{eyebrow}</p>}
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      </div>
      {action}
    </div>
  );
}

export function Button({
  children,
  variant = 'primary',
  className = '',
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'danger' }) {
  const base = 'rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  const styles = {
    primary: 'bg-violet text-white hover:bg-violet/85',
    ghost: 'bg-surface-hi text-ink hover:bg-surface-hi/70 border border-border',
    danger: 'bg-rose/15 text-rose hover:bg-rose/25 border border-rose/30',
  };
  return (
    <button className={`${base} ${styles[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-lg border border-border bg-bg-alt px-3 py-2 text-sm text-ink placeholder:text-ink-dim/60 focus:border-violet transition-colors ${props.className || ''}`}
    />
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-lg border border-border bg-bg-alt px-3 py-2 text-sm text-ink placeholder:text-ink-dim/60 focus:border-violet transition-colors ${props.className || ''}`}
    />
  );
}

export function Select({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full rounded-lg border border-border bg-bg-alt px-3 py-2 text-sm text-ink focus:border-violet transition-colors ${props.className || ''}`}
    >
      {children}
    </select>
  );
}

export function Badge({
  children,
  tone = 'default',
}: {
  children: React.ReactNode;
  tone?: 'default' | 'amber' | 'teal' | 'rose' | 'violet';
}) {
  const tones: Record<string, string> = {
    default: 'bg-surface-hi text-ink-dim',
    amber: 'bg-amber/15 text-amber',
    teal: 'bg-teal/15 text-teal',
    rose: 'bg-rose/15 text-rose',
    violet: 'bg-violet/15 text-violet',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium font-mono-tag ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function Empty({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border py-10 text-center text-sm text-ink-dim">
      {label}
    </div>
  );
}
