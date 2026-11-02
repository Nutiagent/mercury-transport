export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg aria-hidden viewBox="0 0 32 32" className="size-7 shrink-0">
        <rect x="0.5" y="0.5" width="31" height="31" fill="none" stroke="currentColor" strokeOpacity="0.35" />
        <path d="M6 24V8h4l6 9 6-9h4v16h-4V15l-6 8.5L10 15v9z" fill="currentColor" />
        <rect x="6" y="26" width="20" height="2" fill="var(--color-signal)" />
      </svg>
      <span className="flex flex-col leading-none">
        <span className="display text-[1.05rem] tracking-[-0.02em]">MERCURY</span>
        <span className="label mt-1 text-[0.55rem] tracking-[0.42em] text-steel-2">Transport</span>
      </span>
    </span>
  );
}
