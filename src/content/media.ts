/**
 * Brand film supplied by the owner (2 Nov 2026), cut into scenes.
 * Source: hf_20261102_144900_…mp4 (1920×1080, 10 s). Re-encode with the
 * commands in README → "Film and images" when the film changes.
 */

export const film = {
  desktop: "/media/film-1080.mp4",
  tablet: "/media/film-720.mp4",
  mobile: "/media/film-mobile.mp4",
  poster: "/media/hero.jpg",
  posterMobile: "/media/hero-mobile.jpg",
  duration: 10.05,
  alt: "Mercury puksiirauto sõidab vilkuritega läbi vihmase öö",
};

export type Scene = {
  id: "arrival" | "recovery" | "loading" | "road";
  /** start time in the full film, seconds */
  at: number;
  clip: string;
  still: string;
  alt: string;
  label: string;
};

export const scenes: Scene[] = [
  {
    id: "arrival",
    at: 0,
    clip: "/media/scene-arrival.mp4",
    still: "/media/arrival.jpg",
    alt: "Puksiirauto tuleb vihmas esituledega otse kaamera poole, katusel põlevad oranžid vilkurid",
    label: "Saabumine",
  },
  {
    id: "loading",
    at: 2.875,
    clip: "/media/scene-loading.mp4",
    still: "/media/loading.jpg",
    alt: "Avariis kahjustatud sõiduauto tõmmatakse vintsiga kallutatud platvormile",
    label: "Laadimine",
  },
  {
    id: "recovery",
    at: 5.83,
    clip: "/media/scene-recovery.mp4",
    still: "/media/recovery.jpg",
    alt: "Kraavi sõitnud maastur tõmmatakse lumisel metsateel trossiga välja",
    label: "Väljatõmbamine",
  },
  {
    id: "road",
    at: 8.29,
    clip: "/media/scene-road.mp4",
    still: "/media/road.jpg",
    alt: "Linnulennult: puksiirauto sõidab udusel metsateel kahe lumise teeserva vahel",
    label: "Teel",
  },
];

export const sceneById = (id: Scene["id"]) => scenes.find((s) => s.id === id)!;

/** Which film still illustrates each service. */
export const serviceScene: Record<string, Scene["id"]> = {
  puksiirabi: "recovery",
  "soidukite-vedu": "loading",
  "ehitustehnika-vedu": "arrival",
  haagisveod: "road",
};
