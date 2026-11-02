// Builds the GoHighLevel (GHL) export from the prerendered Next.js pages.
// Usage: npm run build && node scripts/build-ghl.mjs
//   ASSET_BASE  where ghl/dist/mercury.css|js are served from (default: jsDelivr from the GitHub repo)
//   MEDIA_BASE  where public/media/* are served from (default: jsDelivr from the GitHub repo)
// Output in ghl/dist/: head.html, head-inline.html, pages/*.html (paste into GHL), preview/*.html (local test).
import fs from "fs";
import path from "path";

const root = process.cwd();
const app = path.join(root, ".next/server/app");
const out = path.join(root, "ghl/dist");
const REPO = process.env.CDN_REPO || "Nutiagent/mercury-transport@main";
const ASSET_BASE = process.env.ASSET_BASE || `https://cdn.jsdelivr.net/gh/${REPO}/ghl/dist/`;
const MEDIA_BASE = process.env.MEDIA_BASE || `https://cdn.jsdelivr.net/gh/${REPO}/public/media/`;
const PUBLIC_BASE = process.env.PUBLIC_BASE || `https://cdn.jsdelivr.net/gh/${REPO}/public/`;
// The live domain of the GHL site, used in structured data (JSON-LD). Set it before the final export.
const SITE_URL = (process.env.SITE_URL || "https://SINU-DOMEEN.ee").replace(/\/$/, "");
if (!process.env.SITE_URL) console.warn("! SITE_URL not set: JSON-LD uses the placeholder https://SINU-DOMEEN.ee");

// Next route -> GHL page path. GHL website pages use single-level paths.
const pages = [
  { file: "index.html", route: "/", ghl: "/", name: "avaleht" },
  { file: "teenused.html", route: "/teenused", ghl: "/teenused", name: "teenused" },
  { file: "teenused/puksiirabi.html", route: "/teenused/puksiirabi", ghl: "/puksiirabi", name: "puksiirabi" },
  { file: "teenused/soidukite-vedu.html", route: "/teenused/soidukite-vedu", ghl: "/soidukite-vedu", name: "soidukite-vedu" },
  { file: "teenused/ehitustehnika-vedu.html", route: "/teenused/ehitustehnika-vedu", ghl: "/ehitustehnika-vedu", name: "ehitustehnika-vedu" },
  { file: "teenused/haagisveod.html", route: "/teenused/haagisveod", ghl: "/haagisveod", name: "haagisveod" },
  { file: "ettevottest.html", route: "/ettevottest", ghl: "/ettevottest", name: "ettevottest" },
  { file: "kontakt.html", route: "/kontakt", ghl: "/kontakt", name: "kontakt" },
  { file: "privaatsus.html", route: "/privaatsus", ghl: "/privaatsus", name: "privaatsus" },
];
const routeMap = new Map(pages.map((p) => [p.route, p.ghl]));

const FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&family=JetBrains+Mono:wght@400..700&display=swap">`;

// Placeholder for the GHL form on the contact page. Replace the comment with the GHL form embed code.
const FORM_SLOT = `<!-- GHL_FORM_START: paste the GHL form embed code here (Sites → Forms → Integrate → Embed) -->
<div class="grid gap-4 border border-dashed border-line p-6 text-bone-dim" data-ghl-form-fallback>
  <p class="label text-steel">Päringuvorm</p>
  <p>Kirjuta meile või helista. Vastame esimesel võimalusel.</p>
  <div class="flex flex-wrap gap-3">
    <a href="tel:+37256855138" class="inline-flex min-h-12 items-center gap-2 bg-signal px-5 font-semibold text-ink">Helista +372 5685 5138</a>
    <a href="mailto:mercuryveod@gmail.com?subject=Hinnap%C3%A4ring" class="inline-flex min-h-12 items-center border border-line px-5 font-semibold text-bone">mercuryveod@gmail.com</a>
  </div>
</div>
<!-- GHL_FORM_END -->`;

/** Returns [start, end) of the element that opens at index i (simple div-depth walk). */
function elementRange(html, i) {
  const re = /<(\/?)div\b[^>]*>/g;
  re.lastIndex = i;
  let depth = 0, m;
  while ((m = re.exec(html))) {
    depth += m[1] ? -1 : 1;
    if (depth === 0) return [i, re.lastIndex];
  }
  throw new Error("unbalanced div");
}

function transformBody(html, page) {
  let b = html.slice(html.indexOf("<body"));
  b = b.slice(b.indexOf(">") + 1, b.lastIndexOf("</body>"));
  // drop Next runtime scripts, keep JSON-LD
  b = b.replace(/<script(?![^>]*application\/ld\+json)[^>]*>[\s\S]*?<\/script>/g, "");
  b = b.replace(/<div hidden="">[\s\S]*?<\/div>/, "");
  b = b.replace(/<!--\/?\$-->|<!-- -->/g, "");
  b = b.replace(/<next-route-announcer[\s\S]*?<\/next-route-announcer>/g, "");
  // next/image -> plain image
  b = b.replace(/\s(srcSet|srcset)="\/_next\/image[^"]*"/g, "");
  b = b.replace(/\/_next\/image\?url=%2Fmedia%2F([^&"]+)(&amp;|&)w=\d+(&amp;|&)q=\d+/g, (_, f) => MEDIA_BASE + decodeURIComponent(f));
  b = b.replace(/\ssizes="100vw"/g, "");
  b = b.replace(/(["\s,])\/media\//g, `$1${MEDIA_BASE}`);
  // absolute URLs in JSON-LD: build origin -> live GHL domain and paths
  const origin = (html.match(/"url":"(https?:\/\/[^"/]+)/) || [])[1];
  if (origin) {
    b = b.split(`${origin}/og.jpg`).join(`${PUBLIC_BASE}og.jpg`).split(`${origin}/icon.svg`).join(`${PUBLIC_BASE}icon.svg`);
    b = b.replace(new RegExp(origin.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&") + "(/[^\"#]*)?", "g"), (m, p = "") => SITE_URL + (routeMap.get(p.replace(/\/$/, "") || "/") ?? p));
  }
  // internal links
  b = b.replace(/href="(\/[^"#?]*)([?#][^"]*)?"/g, (m, p, rest = "") => {
    const t = routeMap.get(p);
    return t ? `href="${t}${rest}"` : m;
  });
  if (page.name === "kontakt") {
    const i = b.indexOf('<div class="mt-10" data-ghl-slot="quote-form"');
    if (i < 0) throw new Error("quote form slot not found");
    const [s, e] = elementRange(b, i);
    b = b.slice(0, s) + `<div class="mt-10" data-ghl-slot="quote-form">\n${FORM_SLOT}\n</div>` + b.slice(e);
  }
  if (page.name === "privaatsus") {
    // On GHL the form goes to the HighLevel CRM, not through our own server + e-mail provider
    const before = b;
    b = b.replace(/Vormi andmed saadetakse meie serverist[^<]*/, "Vormi andmed salvestatakse meie kliendihaldussüsteemi HighLevel, mis majutab ka seda veebilehte. HighLevel töötleb andmeid meie volitatud töötlejana ja võib neid hoida väljaspool Euroopa Liitu (USA-s) Euroopa Komisjoni standardlepingutingimuste alusel. Kirjastiilid laaditakse Google Fontsist ning pildid ja videod sisuedastusvõrgust jsDelivr. Need teenused näevad tehniliselt sinu IP-aadressi.");
    b = b.replace(/Veebileht ei kasuta reklaami- ega jälgimisküpsiseid\.[^<]*/, "Veebilehe platvorm HighLevel võib kasutada lehe toimimiseks vajalikke küpsiseid. Reklaami- ega jälgimisküpsiseid me ise ei lisa ja külastusstatistikat praegu ei koguta.");
    if (b === before) throw new Error("privacy text not replaced");
  }
  if (/\/_next\//.test(b)) throw new Error(`${page.name}: leftover /_next/ reference`);
  return `<!-- Mercury Transport · ${page.ghl} · generated by scripts/build-ghl.mjs; do not edit by hand -->\n<div id="mercury-root">\n${b.trim()}\n</div>\n`;
}

function meta(html) {
  const get = (re) => (html.match(re) || [])[1] || "";
  return {
    title: get(/<title>([^<]*)<\/title>/),
    description: get(/<meta name="description" content="([^"]*)"/),
  };
}

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(path.join(out, "pages"), { recursive: true });
fs.mkdirSync(path.join(out, "preview"), { recursive: true });

// CSS: the compiled Tailwind file, minus self-hosted @font-face rules (Google Fonts are used instead)
const index = fs.readFileSync(path.join(app, "index.html"), "utf8");
const cssFiles = [...index.matchAll(/<link rel="stylesheet" href="(\/_next\/[^"]+\.css)"/g)].map((m) => m[1]);
let css = cssFiles.map((f) => fs.readFileSync(path.join(root, ".next", f.replace("/_next/", "")), "utf8")).join("\n");
css = css.replace(/@font-face\s*{[^}]*}/g, "");
css += `
/* GHL wrapper reset: let the page own the full width */
#mercury-root{display:block;width:100%;background:var(--color-ink);color:var(--color-bone)}
.hl_page-preview--content .c-custom-code, .hl_page-preview--content .c-custom-code > div{padding:0!important;margin:0!important;max-width:none!important}
`;
fs.writeFileSync(path.join(out, "mercury.css"), css);
fs.copyFileSync(path.join(root, "ghl/src/mercury.js"), path.join(out, "mercury.js"));
const js = fs.readFileSync(path.join(out, "mercury.js"), "utf8");

fs.writeFileSync(
  path.join(out, "head.html"),
  `<!-- Mercury Transport: paste into GHL → Website → Settings → Head tracking code (once, for all pages) -->\n${FONTS}\n<link rel="stylesheet" href="${ASSET_BASE}mercury.css">\n<script defer src="${ASSET_BASE}mercury.js"></script>\n`,
);
fs.writeFileSync(
  path.join(out, "head-inline.html"),
  `<!-- Mercury Transport: self-contained alternative to head.html (no CDN for CSS/JS) -->\n${FONTS}\n<style>${css}</style>\n<script>${js}</script>\n`,
);

const report = [];
for (const p of pages) {
  const html = fs.readFileSync(path.join(app, p.file), "utf8");
  const body = transformBody(html, p);
  fs.writeFileSync(path.join(out, "pages", `${p.name}.html`), body);
  const m = meta(html);
  report.push({ page: p.name, path: p.ghl, title: m.title, description: m.description, bytes: body.length });
  // Local preview (serve with scripts/serve-ghl.mjs): same body, local CSS/JS and media
  const local = body.split(MEDIA_BASE).join("/media/");
  fs.writeFileSync(
    path.join(out, "preview", `${p.name}.html`),
    `<!doctype html><html lang="et"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${m.title}</title>${FONTS}<link rel="stylesheet" href="/mercury.css"><script defer src="/mercury.js"></script></head><body>${local}</body></html>`,
  );
}
fs.writeFileSync(path.join(out, "pages.json"), JSON.stringify(report, null, 2));
console.log(report.map((r) => `${r.path.padEnd(22)} ${String(r.bytes).padStart(7)} B  ${r.title}`).join("\n"));
console.log(`\nASSET_BASE ${ASSET_BASE}\nMEDIA_BASE ${MEDIA_BASE}`);
