import { process } from "@/content/general";

export function Process() {
  return (
    <ol className="relative grid gap-0 lg:grid-cols-4">
      {/* road line */}
      <span aria-hidden className="absolute left-[1.15rem] top-0 h-full w-px bg-line lg:left-0 lg:top-[1.15rem] lg:h-px lg:w-full" />
      <span
        aria-hidden
        className="absolute left-[1.15rem] top-0 h-full w-px [background:repeating-linear-gradient(180deg,var(--color-signal)_0_14px,transparent_14px_30px)] lg:left-0 lg:top-[1.15rem] lg:h-px lg:w-full lg:[background:repeating-linear-gradient(90deg,var(--color-signal)_0_14px,transparent_14px_30px)]"
      />
      {process.map((p) => (
        <li key={p.step} className="relative pb-12 pl-14 lg:pb-0 lg:pl-0 lg:pr-8">
          <span className="label absolute left-0 top-0 flex size-[2.3rem] items-center justify-center border border-line bg-ink text-signal lg:relative">
            {p.step}
          </span>
          <h3 className="display mt-0 text-[1.6rem] lg:mt-8 lg:text-[1.75rem]">{p.title}</h3>
          <p className="mt-3 max-w-xs leading-relaxed text-bone-dim text-pretty">{p.text}</p>
          <p className="label mt-5 text-steel">{p.meta}</p>
        </li>
      ))}
    </ol>
  );
}
