/**
 * 3D hero configuration.
 *
 * To replace the procedural truck with a licensed GLB model, put the optimized
 * file in /public/models (Draco/Meshopt compressed, textures ≤ 2K, KTX2 ideally)
 * and set NEXT_PUBLIC_HERO_MODEL_URL=/models/your-model.glb. Adjust
 * `modelTransform` so the model's front faces +X and its wheels rest on y = 0.
 */
export const sceneConfig = {
  modelUrl: process.env.NEXT_PUBLIC_HERO_MODEL_URL || "",
  modelTransform: {
    position: [0, 0, 0] as [number, number, number],
    rotation: [0, 0, 0] as [number, number, number],
    scale: 1,
  },
  /** Static fallback stills rendered from this scene (see scripts/render-stills.mjs). */
  stills: {
    desktop: "/images/hero-desktop.jpg",
    mobile: "/images/hero-mobile.jpg",
  },
};

/** Mutable state shared between GSAP (DOM) and the render loop. Never triggers React renders. */
export const heroState = {
  progress: 0,
  pointerX: 0,
  pointerY: 0,
};
