import type { Service } from "@/content/services";

/**
 * Technical side-elevation drawing of the recovery truck with the cargo
 * that matches each service. Pure SVG, so it is crisp and costs nothing to load.
 */
export function ServiceGlyph({ kind, className = "", title }: { kind: Service["glyph"]; className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 640 280" className={className} role={title ? "img" : undefined} aria-hidden={title ? undefined : true}>
      {title && <title>{title}</title>}
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0H0V20" fill="none" stroke="currentColor" strokeOpacity="0.06" />
        </pattern>
        <pattern id="hz" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="5" height="10" fill="var(--color-signal)" />
        </pattern>
      </defs>
      <rect width="640" height="280" fill="url(#grid)" />

      {/* road */}
      <line x1="0" y1="232" x2="640" y2="232" stroke="currentColor" strokeOpacity="0.5" />
      <line x1="0" y1="246" x2="640" y2="246" stroke="currentColor" strokeOpacity="0.25" strokeDasharray="28 22" />

      <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
        {/* chassis */}
        <path d="M70 196H590" strokeOpacity="0.6" />
        {/* bed */}
        <path d="M58 168H470V182H62Z" />
        <path d="M58 168l-6 26" strokeOpacity="0.6" />
        <rect x="58" y="182" width="40" height="8" fill="url(#hz)" stroke="none" />
        {/* headboard */}
        <path d="M466 168V112M480 168V112M466 124H480M466 146H480" />
        {/* cab */}
        <path d="M486 196V96Q486 84 498 84H556Q566 84 570 94L594 150V196Z" />
        <path d="M500 98H554L572 142H500Z" strokeOpacity="0.8" />
        <path d="M530 152V194" strokeOpacity="0.4" />
        <path d="M594 176h8v20h-8" />
        {/* beacon */}
        <rect x="508" y="76" width="34" height="8" fill="var(--color-amber)" stroke="none" />
        {/* wheels */}
        {[146, 206, 540].map((cx) => (
          <g key={cx}>
            <circle cx={cx} cy="206" r="26" fill="var(--color-ink)" />
            <circle cx={cx} cy="206" r="13" strokeOpacity="0.6" />
            <circle cx={cx} cy="206" r="3" fill="currentColor" />
          </g>
        ))}
        <path d="M110 186Q120 170 176 170Q232 170 240 186" strokeOpacity="0.4" />
      </g>

      {/* cargo */}
      <g fill="none" strokeWidth="1.8" strokeLinejoin="round" stroke="var(--color-signal)">
        {kind === "car" && (
          <g>
            <path d="M130 168V150Q130 140 142 138L190 132L230 108Q238 104 250 104H330Q342 104 352 112L380 134L420 140Q436 142 436 156V168Z" />
            <path d="M240 134L262 112H300V134ZM312 134V112H330L356 134Z" strokeOpacity="0.7" />
            <circle cx="182" cy="168" r="16" fill="var(--color-ink)" />
            <circle cx="388" cy="168" r="16" fill="var(--color-ink)" />
          </g>
        )}
        {kind === "car-damaged" && (
          <g>
            <path d="M130 168V152Q130 140 144 138L188 132L226 110Q234 104 248 104H318L334 114L346 108L360 126L384 134L414 146Q432 150 432 160V168Z" />
            <path d="M238 134L260 112H298V134Z" strokeOpacity="0.7" />
            <path d="M330 116l14 10-10 4 12 8" strokeOpacity="0.9" />
            <circle cx="182" cy="168" r="16" fill="var(--color-ink)" />
            <circle cx="386" cy="168" r="16" fill="var(--color-ink)" />
            {/* warning triangle */}
            <path d="M36 228L52 200L68 228Z" fill="var(--color-ink)" />
            <path d="M52 210v8M52 222v1" />
          </g>
        )}
        {kind === "excavator" && (
          <g>
            <rect x="150" y="146" width="150" height="22" rx="11" />
            <circle cx="164" cy="157" r="5" />
            <circle cx="286" cy="157" r="5" />
            <path d="M160 146V124Q160 116 168 116H270V146" />
            <path d="M170 116V64H232L240 116" />
            <path d="M178 72H226L232 108H178Z" strokeOpacity="0.6" />
            <path d="M268 120L340 66L380 150" strokeWidth="6" strokeOpacity="0.9" />
            <path d="M366 146H404L398 168H372Z" />
            <path d="M304 150H316V168" />
          </g>
        )}
        {kind === "cargo" && (
          <g>
            <rect x="118" y="112" width="110" height="56" />
            <path d="M118 112L228 168M228 112L118 168" strokeOpacity="0.35" />
            <rect x="236" y="88" width="96" height="80" />
            <path d="M236 108H332M236 148H332" strokeOpacity="0.35" />
            <rect x="340" y="128" width="104" height="40" />
            <path d="M372 128V168M408 128V168" strokeOpacity="0.35" />
          </g>
        )}
        {/* straps */}
        <path d="M120 168L104 182M446 168L460 182" strokeOpacity="0.6" stroke="var(--color-amber)" />
      </g>

      {/* dimension lines */}
      <g stroke="currentColor" strokeOpacity="0.45" fill="currentColor" fontFamily="var(--font-mono)" fontSize="10" letterSpacing="1.5">
        <path d="M58 30V50M470 30V50M58 40H470" fill="none" />
        <text x="264" y="30" textAnchor="middle" stroke="none" fillOpacity="0.7">
          PLATVORM
        </text>
        <path d="M612 84V232M606 84H618M606 232H618" fill="none" />
        <text x="626" y="160" stroke="none" fillOpacity="0.7" transform="rotate(90 626 160)" textAnchor="middle">
          H
        </text>
      </g>
    </svg>
  );
}
