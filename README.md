# Mercury Transport veebileht

A custom website for **Mercury Transport** (MERCURY TRANSPORTATIONS OÜ, reg. 14063837). All customer-facing copy is in Estonian.
The site is built around the company's 10-second brand film. It plays full-bleed in the hero. Its four scenes (arrival, recovery, loading, on the road) then return as slow-motion chapters that tell the "how a tow works" story, and as stills in every page header. An earlier real-time 3D hero is still in the code and can be switched on with `NEXT_PUBLIC_HERO_MODE=3d`.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · React Three Fiber 9 + Drei 10 · @react-three/postprocessing · GSAP 3 + ScrollTrigger · Zod 4

## Publishing on GoHighLevel (GHL)

The production site goes on GHL. GHL cannot run Next.js, so `npm run build && npm run ghl` turns the prerendered pages into static HTML blocks for GHL Custom Code elements. A small vanilla runtime, `ghl/src/mercury.js`, replaces React for the menu, film, chapters and tabs. The quote form becomes a GHL native form, so `/api/quote` and Resend are not used there.

The step-by-step guide (in Estonian) is in [`ghl/JUHEND.md`](ghl/JUHEND.md). The output goes to `ghl/dist/`. It is committed, because jsDelivr serves the CSS, JS and media from this repo.

## Local setup

```bash
npm install
cp .env.example .env.local   # fill in values (see below)
npm run dev                  # http://localhost:3000
```

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / server |
| `npm run lint` | ESLint (Next core-web-vitals + TypeScript rules) |
| `npm run typecheck` | `tsc --noEmit` |

Requires Node 20.9 or newer (built and tested on Node 22).

## Environment variables

See `.env.example`. Only `NEXT_PUBLIC_*` values reach the browser. Everything else stays on the server.

| Variable | Required | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | yes, in production | Canonical URL, used for the sitemap, Open Graph and JSON-LD. Defaults to `http://localhost:3000`. |
| `NEXT_PUBLIC_ALLOW_INDEXING` | no | Set to `false` on staging so `robots.txt` blocks search engines. |
| `RESEND_API_KEY` | for the form | API key from [Resend](https://resend.com). |
| `QUOTE_TO_EMAIL` | for the form | Inbox that receives enquiries. Separate several with commas. |
| `QUOTE_FROM_EMAIL` | for the form | Sender on a domain verified in Resend, e.g. `Mercury veebileht <paring@domain.ee>`. |
| `FORM_SECRET` | yes, in production | Long random string that signs the anti-spam form tokens. Without it, each server instance makes its own secret, and tokens fail across instances. |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | no | Turns on cookieless Plausible analytics. Leave it empty to keep tracking off (the default). |
| `NEXT_PUBLIC_HERO_MODE` | no | `film` (default) or `3d` to use the real-time 3D hero instead of the film. |
| `NEXT_PUBLIC_HERO_MODEL_URL` | no | Path to a licensed GLB that replaces the procedural truck (see below). |
| `RESEND_API_URL` | no | Overrides the Resend endpoint. Only for testing against a mock server. |

If the three e-mail variables are missing, the form still works up to the final step, then tells the visitor honestly that online sending is not set up yet. It offers a call button and a pre-filled e-mail as alternatives. The form never shows a success message unless the server has accepted the enquiry.

## Deployment

The site suits Vercel or any Node host (`npm run build && npm start`).

1. Set the environment variables above in the hosting dashboard.
2. Verify the sending domain in Resend and use an address on it for `QUOTE_FROM_EMAIL`.
3. Point the domain at the host and set `NEXT_PUBLIC_SITE_URL` to it.
4. Submit `https://<domain>/sitemap.xml` in Google Search Console.

Rate limiting is in memory, per server instance: 5 enquiries per IP every 15 minutes. That is enough for a single server. On serverless platforms with many instances, it limits bursts per instance only. For a strict global limit, swap `src/lib/server/rate-limit.ts` for a shared store such as Upstash Redis. The client IP comes from `x-forwarded-for`, which is trustworthy behind Vercel or a correctly configured proxy.

## Project structure

```
src/
  config/site.ts          ← all business facts (single source of truth)
  config/scene.ts         ← hero mode, 3D model swap + shared scroll/pointer state
  content/media.ts        ← film files, scene timings, stills, alt texts, service → scene mapping
  content/services.ts     ← service copy, FAQs, practical info, form field rules
  content/general.ts      ← process steps, general FAQ
  app/                    ← routes: /, /teenused, /teenused/[slug], /ettevottest, /kontakt, /privaatsus, 404, api/quote, sitemap, robots
  components/film/FilmHero.tsx    ← full-bleed film hero, scene index, pause control
  components/film/FilmChapters.tsx ← process told as four film chapters (sticky frame on desktop)
  components/hero/Hero.tsx        ← (optional 3D hero) capability detection, GSAP scroll timeline, static fallback
  components/three/Scene.tsx      ← canvas, camera choreography, lights, road, wordmark, post-processing
  components/three/Truck.tsx      ← procedural truck + excavator
  components/quote/QuoteForm.tsx  ← enquiry form
  lib/quote-schema.ts     ← validation shared by the browser and the server
  lib/server/*            ← rate limiter, signed form token, Resend mailer
scripts/                  ← render-stills, screenshot audit, e2e checks (dev tools, need Playwright)
```

Design tokens (colours, fonts, utilities such as `display`, `label`, `brushed` and `hazard`) live in `src/app/globals.css` under `@theme`.

## Film hero

- Files live in `public/media/`. They are H.264 MP4 with no audio track and `faststart`, so playback starts before the download finishes.
  - `film-1080.mp4` (4.4 MB) is for large or high-DPI screens. `film-720.mp4` (1.4 MB) is for the rest. `film-mobile.mp4` (1 MB) is a 4:5 crop for phones in portrait.
  - `scene-*.mp4` are the four scenes slowed to 1.6× for the chapters (0.3 to 0.7 MB each).
  - `*.jpg` are stills from the film, used as posters and page headers.
- The poster is a normal image under the video, so the headline and buttons never wait for the video.
- The video is muted and plays inline. It pauses when scrolled off screen, and it has a visible pause and play button (WCAG 2.2.2).
- When the visitor prefers reduced motion, or Save-Data is on, nothing autoplays. The visitor sees the still and can press play.
- Chapter clips load lazily, and only the clip on screen plays.
- Scene timings, labels and alt texts are in `src/content/media.ts`.

**Re-encoding from a new master** (needs ffmpeg):

```bash
SRC=master.mp4
ffmpeg -i $SRC -an -vf scale=1920:-2 -c:v libx264 -preset slow -crf 23 -pix_fmt yuv420p -movflags +faststart public/media/film-1080.mp4
ffmpeg -i $SRC -an -vf scale=1280:-2 -c:v libx264 -preset slow -crf 25 -pix_fmt yuv420p -movflags +faststart public/media/film-720.mp4
ffmpeg -i $SRC -an -vf "crop=864:1080:528:0,scale=720:-2" -c:v libx264 -preset slow -crf 25 -pix_fmt yuv420p -movflags +faststart public/media/film-mobile.mp4
# one scene, e.g. loading (start 2.875 s, ~2.9 s long), slowed down
ffmpeg -ss 2.875 -t 2.9 -i $SRC -an -vf "setpts=1.6*PTS,scale=1280:-2" -r 24 -c:v libx264 -preset slow -crf 26 -pix_fmt yuv420p -movflags +faststart public/media/scene-loading.mp4
ffmpeg -ss 3.5 -i $SRC -frames:v 1 -q:v 3 public/media/loading.jpg
```

The mobile crop assumes a 1920×1080 master. Adjust the `crop` values for other sizes.

## 3D hero (optional, `NEXT_PUBLIC_HERO_MODE=3d`)

- The heavy 3D code is loaded with `next/dynamic` (`ssr: false`), so text and buttons are server-rendered and usable straight away.
- **Static fallback:** `public/images/hero-desktop.jpg` and `hero-mobile.jpg` are stills rendered from the same scene. They appear immediately, and they stay in place when WebGL is unavailable, when the visitor prefers reduced motion, on low-power devices (fewer than 4 CPU cores, under 3 GB device memory, or Save-Data turned on), or when `?static` is added to the URL.
- **Intro:** on load, the camera starts low at the grille and pulls back into the hero shot. The headlights flicker on and then the roof beacons start. Add `?nointro` to the URL to skip it, which is useful for screenshots.
- **Desktop** (≥1024 px with a fine pointer) gets a 260 vh pinned section and the scroll camera move, which cranes up and round to the side view. It also gets pointer parallax, soft shadows, a wet reflective road, headlight beams in haze with drifting dust, bloom and a vignette.
- **Mobile and tablet** get their own front-on composition, with no pinning, shadows, reflections or post-processing, and resolution capped at 1.5×.
- Rendering pauses when the hero is off screen or the tab is hidden. `PerformanceMonitor` lowers the quality automatically when the frame rate drops.
- **Regenerating the stills and OG image** after changing the scene: run the site, then `node scripts/render-stills.mjs http://localhost:3000` (needs Playwright; set `WAIT=20000` or more when rendering without a GPU).

### Replacing the procedural model with a GLB

1. Get a model with a licence that allows commercial web use. Optimise it with `gltf-transform optimize in.glb out.glb --compress draco --texture-compress webp`.
2. Put it in `public/models/` and set `NEXT_PUBLIC_HERO_MODEL_URL=/models/out.glb`.
3. Adjust `modelTransform` in `src/config/scene.ts` so the truck faces +X with its wheels on y = 0.
4. Note: Drei's `useGLTF` loads the Draco decoder from the gstatic CDN by default.

## Asset licences

| Asset | Source | Licence |
| --- | --- | --- |
| Brand film and every file in `public/media/` | Supplied by the owner. The file name suggests it was generated with Higgsfield AI. | **Owner must confirm the usage rights** (see below) |
| `og.jpg` | Screenshot of the film hero | Same as the film |
| 3D truck, excavator, road and wordmark textures | Built procedurally in code for this project | Owned by the project |
| 3D hero stills (`public/images/`) | Rendered from the 3D scene | Owned by the project |
| Service drawings (`ServiceGlyph`) | Hand-made SVG for this project | Owned by the project |
| Archivo (variable) | Google Fonts via `@fontsource-variable/archivo` | SIL Open Font License 1.1 |
| JetBrains Mono (variable) | `@fontsource-variable/jetbrains-mono` | SIL Open Font License 1.1 |
| three.js, R3F, Drei, GSAP, Next.js and the rest | npm | MIT. GSAP uses the free "Standard" licence, which allows commercial use. |

The site uses no stock photos. All imagery comes from the owner's film.

## Verified information and sources

Checked 2 Nov 2026 against mercurytransport.weebly.com (home and price-list pages) and the Estonian business register via inforegister.ee / regia.ee:

- Legal name MERCURY TRANSPORTATIONS OÜ, registry code 14063837, registered 9 June 2016, VAT EE101927697
- Registered address: Kauge tn 6-13, Nõmme, Tallinn 11215
- Phone +372 5685 5138. E-mail in the register: mercuryveod@gmail.com
- 24/7 towing ("Soodne puksiirabi 24H/7", "Teostame tööd 24/7"), freight transport anywhere in Estonia, construction equipment, transport liability insurance for vehicles and machinery
- Facebook: facebook.com/puksiiriabi

The site publishes no testimonials, statistics, certifications, partner logos or prices.

## Needs owner confirmation before launch

1. **Enquiry e-mail:** is `mercuryveod@gmail.com` the right public address and inbox? It is shown in the footer, contact page and privacy page.
2. **Registered address in the footer and on the contact page:** it is public register data, but if it is a home address the owner may want it shown only on the privacy page.
3. **Services and wording:** the old services page could not be read (robots-blocked). Confirm the four services, the example lists (e.g. mini excavators, compact rollers, small trailers) and the promise "hind enne väljasõitu".
4. **24/7 availability** is still accurate.
5. **Prices:** the old price list (from 18 €/h in Tallinn, 0.7 €/km outside Tallinn, +40 % from 23:00 to 06:00) looks outdated, so it is deliberately not published. Add current prices to `content/services.ts` if the owner wants them shown.
6. **Fleet details** for the "Tehnilised andmed" tables: truck models, platform length, payload, winch capacity.
7. **Photography:** real photos of the trucks and jobs, which can go on service pages and the about page.
8. **Privacy page (`/privaatsus`):** a lawyer or the owner should review it. In particular: the retention period, the hosting provider's name and location, Resend as a processor (US-based, transfer basis), and whether the owner wants a named contact person.
9. **Production domain** for `NEXT_PUBLIC_SITE_URL`.
10. **Brand film rights:** confirm that the company may use the film commercially on the web (check the generator's plan or licence terms if it is AI-generated).
11. **Film content vs. real fleet:** the film shows generic vehicles. If it is AI-generated, it does not show the company's actual trucks. Confirm the owner is happy for it to stand in for the fleet, or replace it with real footage later (re-encode commands above).

## Checks run

These ran on 2 Nov 2026 (after the film redesign) against the production build (`next build && next start`):

- `npm run build`: passed. 13 routes, all static except `/api/quote`.
- `npm run typecheck` and `npm run lint`: passed with no errors or warnings.
- Screenshots of every route at 390, 768 and 1440 px: no horizontal overflow, and no console errors apart from the expected 404 on the missing-page test.
- `scripts/e2e.mjs` (34 checks, all passing): form preselection, validation, focus handling, success (mock e-mail provider), provider failure, not-configured message with fallback, mobile menu (open, Escape, navigation), all internal links, service selector keyboard control, film autoplay, pause and play, pausing off screen, chapters switching on scroll with only one clip playing, reduced motion (nothing autoplays, poster shown), portrait film on mobile.
- API checks with curl: too-fast token, invalid token, honeypot, validation errors (422), success (200), provider failure (502), rate limit (429), not configured (503).
- Not checked: real Resend delivery (no credentials), and video playback on real iOS/Android devices (tested in headless Chromium only).
