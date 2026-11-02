import * as THREE from "three";

/** Small seeded PRNG so procedural textures are identical on every load. */
function rng(seed = 7) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function canvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return [c, c.getContext("2d")!] as const;
}

/** Asphalt colour + roughness with lane markings. Road runs along X. */
export function makeRoadTextures(size = 1024) {
  const rand = rng(11);
  const [c, ctx] = canvas(size, size);
  ctx.fillStyle = "#1a1a1c";
  ctx.fillRect(0, 0, size, size);
  // aggregate speckle
  const img = ctx.getImageData(0, 0, size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = rand();
    const v = n > 0.985 ? 70 : n > 0.9 ? 38 : 22 + n * 10;
    img.data[i] = v;
    img.data[i + 1] = v;
    img.data[i + 2] = v + 2;
  }
  ctx.putImageData(img, 0, 0);
  // soft tyre-wear patches
  for (let i = 0; i < 40; i++) {
    const g = ctx.createRadialGradient(rand() * size, rand() * size, 0, rand() * size, rand() * size, 120 + rand() * 200);
    g.addColorStop(0, "rgba(0,0,0,0.18)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  }
  const color = new THREE.CanvasTexture(c);
  color.colorSpace = THREE.SRGBColorSpace;
  color.wrapS = color.wrapT = THREE.RepeatWrapping;
  color.anisotropy = 8;

  const [rc, rctx] = canvas(256, 256);
  const rimg = rctx.createImageData(256, 256);
  for (let i = 0; i < rimg.data.length; i += 4) {
    const v = 150 + rand() * 105;
    rimg.data[i] = rimg.data[i + 1] = rimg.data[i + 2] = v;
    rimg.data[i + 3] = 255;
  }
  rctx.putImageData(rimg, 0, 0);
  const rough = new THREE.CanvasTexture(rc);
  rough.wrapS = rough.wrapT = THREE.RepeatWrapping;

  return { color, rough };
}

/** Painted road markings on a transparent texture (one tile = 12 m of road). */
export function makeLaneTexture() {
  const [c, ctx] = canvas(1024, 128);
  ctx.clearRect(0, 0, 1024, 128);
  ctx.fillStyle = "rgba(236,231,220,0.82)";
  // dashed centre line: 3 m dash, 9 m gap → 1/4 of the tile
  ctx.fillRect(0, 54, 256, 20);
  const rand = rng(3);
  // wear the paint
  ctx.globalCompositeOperation = "destination-out";
  for (let i = 0; i < 900; i++) {
    ctx.fillStyle = `rgba(0,0,0,${0.2 + rand() * 0.6})`;
    ctx.fillRect(rand() * 256, 50 + rand() * 28, 2 + rand() * 6, 1 + rand() * 3);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = THREE.RepeatWrapping;
  t.anisotropy = 8;
  return t;
}

export function makeHazardTexture() {
  const [c, ctx] = canvas(512, 64);
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, 512, 64);
  ctx.fillStyle = "#ff5b1a";
  for (let x = -64; x < 576; x += 48) {
    ctx.beginPath();
    ctx.moveTo(x, 64);
    ctx.lineTo(x + 24, 64);
    ctx.lineTo(x + 24 + 64, 0);
    ctx.lineTo(x + 64, 0);
    ctx.closePath();
    ctx.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Brushed aluminium streaks for the flatbed (used as roughness + bump). */
export function makeBrushedTexture() {
  const rand = rng(29);
  const [c, ctx] = canvas(512, 512);
  ctx.fillStyle = "#888";
  ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 1600; i++) {
    const y = rand() * 512;
    const v = Math.floor(100 + rand() * 120);
    ctx.fillStyle = `rgba(${v},${v},${v},${0.15 + rand() * 0.35})`;
    ctx.fillRect(0, y, 512, 0.5 + rand() * 1.5);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

/** Large wordmark for the studio wall. */
export function makeWordmarkTexture(text = "MERCURY") {
  const [c, ctx] = canvas(4096, 1024);
  ctx.clearRect(0, 0, 4096, 1024);
  const family = '"Archivo Variable", "Archivo", "Arial Black", sans-serif';
  (ctx as CanvasRenderingContext2D & { fontStretch?: string }).fontStretch = "expanded";
  ctx.font = `800 760px ${family}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  const g = ctx.createLinearGradient(0, 120, 0, 900);
  g.addColorStop(0, "#3b3d42");
  g.addColorStop(0.55, "#222428");
  g.addColorStop(1, "#111214");
  ctx.fillStyle = g;
  ctx.fillText(text, 2048, 860, 3900);
  // brushed streaks inside the letters
  ctx.globalCompositeOperation = "source-atop";
  const rand = rng(5);
  for (let i = 0; i < 900; i++) {
    const v = Math.floor(rand() * 255);
    ctx.fillStyle = `rgba(${v},${v},${v},0.025)`;
    ctx.fillRect(0, rand() * 1024, 4096, 0.6 + rand());
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/** Door decal: small wordmark + phone. */
export function makeDoorDecal(phone: string) {
  const [c, ctx] = canvas(1024, 512);
  ctx.clearRect(0, 0, 1024, 512);
  const family = '"Archivo Variable", "Archivo", "Arial Black", sans-serif';
  (ctx as CanvasRenderingContext2D & { fontStretch?: string }).fontStretch = "expanded";
  ctx.fillStyle = "#16171a";
  ctx.font = `800 150px ${family}`;
  ctx.fillText("MERCURY", 40, 220, 940);
  ctx.fillStyle = "#ff5b1a";
  ctx.fillRect(44, 262, 940, 14);
  ctx.fillStyle = "#16171a";
  ctx.font = `600 70px "JetBrains Mono Variable", monospace`;
  ctx.fillText(`PUKSIIRABI 24/7  ${phone}`, 44, 380, 940);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/** Diamond checker plate, used as bump + roughness for the deck. */
export function makeCheckerPlate() {
  const [c, ctx] = canvas(128, 128);
  ctx.fillStyle = "#7a7a7a";
  ctx.fillRect(0, 0, 128, 128);
  const lug = (x: number, y: number, rot: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    const g = ctx.createLinearGradient(-18, 0, 18, 0);
    g.addColorStop(0, "#9a9a9a");
    g.addColorStop(0.5, "#ffffff");
    g.addColorStop(1, "#9a9a9a");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(0, 0, 20, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };
  lug(32, 32, Math.PI / 4);
  lug(96, 96, Math.PI / 4);
  lug(96, 32, -Math.PI / 4);
  lug(32, 96, -Math.PI / 4);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  return t;
}

/** Directional truck-tyre tread (u = around the tyre, v = across). */
export function makeTreadTexture() {
  const [c, ctx] = canvas(2048, 128);
  ctx.fillStyle = "#202020";
  ctx.fillRect(0, 0, 2048, 128);
  ctx.fillStyle = "#e0e0e0";
  const n = 48;
  const w = 2048 / n;
  for (let i = 0; i < n; i++) {
    const x = i * w;
    // two staggered blocks across the tread with a centre groove
    ctx.beginPath();
    ctx.moveTo(x + 2, 6);
    ctx.lineTo(x + w * 0.62, 6);
    ctx.lineTo(x + w * 0.8, 58);
    ctx.lineTo(x + w * 0.2, 58);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + w * 0.2 + w / 2, 70);
    ctx.lineTo(x + w * 0.8 + w / 2, 70);
    ctx.lineTo(x + w * 0.62 + w / 2, 122);
    ctx.lineTo(x + 2 + w / 2, 122);
    ctx.closePath();
    ctx.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = THREE.RepeatWrapping;
  return t;
}
