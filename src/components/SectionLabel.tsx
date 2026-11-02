export function SectionLabel({ index, children, className = "" }: { index?: string; children: React.ReactNode; className?: string }) {
  return (
    <p className={`label flex items-center gap-3 text-steel-2 ${className}`}>
      {index && <span className="text-signal">{index}</span>}
      <span aria-hidden className="h-px w-8 bg-steel/50" />
      <span>{children}</span>
    </p>
  );
}
