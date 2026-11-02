import { site } from "@/config/site";
import { Arrow, LinkButton } from "./Button";
import { CallButton } from "./CallButton";

export function CtaBand({
  title = "Räägime sinu veost.",
  text = "Helista kiire abi saamiseks või saada päring, kui vedu on planeeritud. Hinna ütleme enne, kui midagi kinnitad.",
  service,
}: {
  title?: string;
  text?: string;
  service?: string;
}) {
  return (
    <section aria-labelledby="cta-title" className="grain relative overflow-hidden border-t border-line bg-carbon">
      <div className="wrap grid gap-10 py-20 md:py-28 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7">
          <p className="label flex items-center gap-2 text-amber">
            <span aria-hidden className="beacon size-1.5 rounded-full bg-amber" /> Puksiirabi 24/7
          </p>
          <h2 id="cta-title" className="display mt-6 text-[clamp(2.6rem,7vw,5.6rem)]">
            {title}
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-bone-dim text-pretty">{text}</p>
        </div>
        <div className="flex flex-col gap-3 lg:col-span-5 lg:items-end">
          <a
            href={site.phone.href}
            className="display text-[clamp(2rem,5.4vw,3.4rem)] tracking-[-0.03em] transition-colors hover:text-signal"
          >
            {site.phone.display}
          </a>
          <div className="mt-4 grid gap-3 xs:flex xs:flex-wrap lg:justify-end">
            <CallButton size="lg" className="w-full xs:w-auto" />
            <LinkButton
              href={service ? `/kontakt?teenus=${service}#paring` : "/kontakt#paring"}
              variant="secondary"
              size="lg"
              className="w-full xs:w-auto"
            >
              Küsi pakkumist <Arrow />
            </LinkButton>
          </div>
        </div>
      </div>
    </section>
  );
}
