import { sceneConfig } from "@/config/scene";
import { FilmHero } from "./film/FilmHero";
import { Hero as ThreeHero } from "./hero/Hero";

/** The film is the default hero. Set NEXT_PUBLIC_HERO_MODE=3d to use the real-time 3D truck instead. */
export function HomeHero() {
  return sceneConfig.heroMode === "3d" ? <ThreeHero /> : <FilmHero />;
}
