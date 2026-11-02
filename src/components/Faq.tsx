import type { Faq as FaqItem } from "@/content/services";

export function Faq({ items }: { items: FaqItem[] }) {
  return (
    <div className="border-t border-line">
      {items.map((f) => (
        <details key={f.q} className="group border-b border-line">
          <summary className="flex min-h-16 cursor-pointer items-center justify-between gap-6 py-5 text-left text-[1.08rem] font-semibold transition-colors hover:text-signal sm:text-xl">
            <span className="text-pretty">{f.q}</span>
            <span aria-hidden className="relative size-4 shrink-0">
              <span className="absolute inset-x-0 top-1/2 h-px bg-current" />
              <span className="absolute inset-y-0 left-1/2 w-px bg-current transition-transform duration-300 group-open:rotate-90 group-open:scale-y-0" />
            </span>
          </summary>
          <p className="max-w-2xl pb-6 pr-10 leading-relaxed text-bone-dim text-pretty">{f.a}</p>
        </details>
      ))}
    </div>
  );
}
