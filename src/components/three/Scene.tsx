"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Lightformer,
  MeshReflectorMaterial,
  PerformanceMonitor,
  Sparkles,
  useGLTF,
} from "@react-three/drei";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { heroState, sceneConfig } from "@/config/scene";
import { Truck } from "./Truck";
import { makeLaneTexture, makeRoadTextures, makeWordmarkTexture } from "./textures";

export type SceneProfile = "desktop" | "mobile";
type V3 = [number, number, number];

/* ───────────── Camera choreography ─────────────
 * Orbit around the truck: front three-quarter (hero) → pure side view (services).
 * Angles are measured from +Z (side view) towards +X (front of the truck).
 */
const SHOTS = {
  desktop: {
    from: { angle: 0.98, radius: 17, height: 1.45, target: [0.2, 1.75, 0] as const, offset: -3.6, fov: 30 },
    to: { angle: 0.0, radius: 20, height: 2.3, target: [-0.6, 2.0, 0] as const, offset: -4.2, fov: 32 },
  },
  mobile: {
    from: { angle: 1.12, radius: 19.5, height: 1.7, target: [0.3, 1.35, 0] as const, offset: 0, fov: 44 },
    to: { angle: 1.12, radius: 19.5, height: 1.7, target: [0.3, 1.35, 0] as const, offset: 0, fov: 44 },
  },
};

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/** Opening shot: low and close to the grille, lights off. */
const INTRO = {
  desktop: { angle: 1.42, radius: 9.5, height: 0.55, target: [2.6, 1.35, 0] as const, offset: 0, fov: 34 },
  mobile: { angle: 1.4, radius: 13, height: 0.7, target: [1.6, 1.4, 0] as const, offset: 0, fov: 46 },
};
const INTRO_SECONDS = 3.4;

function CameraRig({ profile, interactive, intro }: { profile: SceneProfile; interactive: boolean; intro: boolean }) {
  const { camera } = useThree() as { camera: THREE.PerspectiveCamera };
  const shot = SHOTS[profile];
  const smooth = useRef({ p: heroState.progress, px: 0, py: 0, start: -1 });
  const target = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, dt) => {
    const s = smooth.current;
    const lerp = THREE.MathUtils.lerp;
    if (s.start < 0) s.start = state.clock.elapsedTime;

    // Intro timeline: camera dolly + lights + beacons
    const it = intro ? Math.min(1, (state.clock.elapsedTime - s.start) / INTRO_SECONDS) : 1;
    heroState.intro = it;
    heroState.lights = intro ? THREE.MathUtils.clamp((it - 0.18) / 0.22, 0, 1) : 1;
    heroState.beacons = it > 0.45 ? 1 : 0;
    const ie = easeOut(THREE.MathUtils.clamp((it - 0.05) / 0.95, 0, 1));

    const k = 1 - Math.exp(-dt * 4);
    s.p += (heroState.progress - s.p) * k;
    s.px += ((interactive ? heroState.pointerX : 0) - s.px) * (1 - Math.exp(-dt * 2.5));
    s.py += ((interactive ? heroState.pointerY : 0) - s.py) * (1 - Math.exp(-dt * 2.5));

    const t = ease(Math.min(1, Math.max(0, s.p)));
    const { from, to } = shot;
    const idle = interactive ? Math.sin(state.clock.elapsedTime * 0.25) * 0.012 : 0;
    // scroll pose: orbit to the side with a crane-up arc mid-way
    let angle = lerp(from.angle, to.angle, t);
    let radius = lerp(from.radius, to.radius, t);
    let height = lerp(from.height, to.height, t) + Math.sin(t * Math.PI) * 1.6;
    let tx = lerp(from.target[0], to.target[0], t);
    let ty = lerp(from.target[1], to.target[1], t);
    let offset = lerp(from.offset, to.offset, t);
    let fov = lerp(from.fov, to.fov, t);

    // blend from the intro shot
    if (ie < 1) {
      const a = INTRO[profile];
      angle = lerp(a.angle, angle, ie);
      radius = lerp(a.radius, radius, ie);
      height = lerp(a.height, height, ie);
      tx = lerp(a.target[0], tx, ie);
      ty = lerp(a.target[1], ty, ie);
      offset = lerp(a.offset, offset, ie);
      fov = lerp(a.fov, fov, ie);
    }
    angle += (s.px * 0.07 + idle) * ie;
    height += s.py * 0.35 * ie;

    target.set(tx, ty, 0);
    camera.position.set(target.x + Math.sin(angle) * radius, height, target.z + Math.cos(angle) * radius);
    camera.lookAt(target);
    camera.filmOffset = offset;
    camera.fov = fov;
    camera.updateProjectionMatrix();
  });
  return null;
}

/** Soft additive light cone for a headlight beam in haze. */
function BeamCone({ position, length = 9, radius = 2.2 }: { position: V3; length?: number; radius?: number }) {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        uniforms: { uOpacity: { value: 0 }, uLen: { value: length }, uColor: { value: new THREE.Color("#ffe9c4") } },
        vertexShader: `
          uniform float uLen;
          varying float vD;
          varying vec3 vN;
          varying vec3 vV;
          void main() {
            vD = clamp(-position.y / uLen, 0.0, 1.0);
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            vN = normalize(normalMatrix * normal);
            vV = normalize(-mv.xyz);
            gl_Position = projectionMatrix * mv;
          }`,
        fragmentShader: `
          uniform float uOpacity;
          uniform vec3 uColor;
          varying float vD;
          varying vec3 vN;
          varying vec3 vV;
          void main() {
            float edge = pow(abs(dot(vN, vV)), 1.6);
            float fall = pow(1.0 - vD, 2.2) * smoothstep(0.0, 0.06, vD);
            gl_FragColor = vec4(uColor, edge * fall * uOpacity);
          }`,
      }),
    [length],
  );
  const geo = useMemo(() => {
    const g = new THREE.ConeGeometry(radius, length, 40, 1, true);
    g.translate(0, -length / 2, 0);
    return g;
  }, [length, radius]);
  useFrame(() => {
    mat.uniforms.uOpacity.value = 0.11 * heroState.lights;
  });
  // apex at the lamp, pointing forward (+X) and slightly down
  return <mesh geometry={geo} material={mat} position={position} rotation={[0, 0, Math.PI / 2 + 0.06]} renderOrder={2} />;
}

function Road({ quality }: { quality: "high" | "low" }) {
  const { color, rough } = useMemo(() => makeRoadTextures(), []);
  const lane = useMemo(() => makeLaneTexture(), []);
  useMemo(() => {
    color.repeat.set(10, 5);
    rough.repeat.set(30, 15);
    lane.repeat.set(5, 1);
  }, [color, rough, lane]);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[80, 40]} />
        {quality === "high" ? (
          <MeshReflectorMaterial
            map={color}
            roughnessMap={rough}
            roughness={0.7}
            metalness={0.1}
            color="#4e4e52"
            blur={[300, 80]}
            resolution={512}
            mixBlur={0.9}
            mixStrength={5}
            mixContrast={1}
            depthScale={0.6}
            minDepthThreshold={0.6}
            maxDepthThreshold={1.2}
            mirror={0}
          />
        ) : (
          <meshStandardMaterial map={color} roughnessMap={rough} roughness={0.95} color="#68686c" />
        )}
      </mesh>
      {/* dashed centre line + solid edge line (truck sits in the near lane) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, -2.6]}>
        <planeGeometry args={[60, 1.0]} />
        <meshStandardMaterial map={lane} transparent roughness={0.6} depthWrite={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 2.75]}>
        <planeGeometry args={[60, 0.14]} />
        <meshStandardMaterial color="#d9d3c6" roughness={0.7} transparent opacity={0.55} />
      </mesh>
    </group>
  );
}

function Wordmark() {
  const tex = useMemo(() => makeWordmarkTexture(), []);
  return (
    <group position={[-5, 0, -10]} rotation={[0, 0.42, 0]}>
      <mesh position={[0, 4.6, 0]}>
        <planeGeometry args={[38, 9.5]} />
        <meshBasicMaterial map={tex} transparent depthWrite={false} toneMapped={false} fog={false} />
      </mesh>
      {/* signal line */}
      <mesh position={[0, 0.25, 0.02]}>
        <planeGeometry args={[30, 0.05]} />
        <meshBasicMaterial color="#ff5b1a" toneMapped={false} />
      </mesh>
    </group>
  );
}

function StudioLights({ quality }: { quality: "high" | "low" }) {
  const key = useRef<THREE.SpotLight>(null);
  const keyTarget = useMemo(() => new THREE.Object3D(), []);
  const headL = useRef<THREE.SpotLight>(null);
  const headR = useRef<THREE.SpotLight>(null);
  const headTarget = useMemo(() => {
    const o = new THREE.Object3D();
    o.position.set(14, 0, 0);
    return o;
  }, []);

  useFrame(() => {
    const L = heroState.lights;
    if (headL.current) headL.current.intensity = 160 * L;
    if (headR.current) headR.current.intensity = 160 * L;
  });

  useEffect(() => {
    keyTarget.position.set(0, 1, 0);
    if (key.current) key.current.target = keyTarget;
    if (headL.current) headL.current.target = headTarget;
    if (headR.current) headR.current.target = headTarget;
  }, [keyTarget, headTarget]);

  return (
    <>
      <primitive object={keyTarget} />
      <primitive object={headTarget} />
      <ambientLight intensity={0.15} />
      <hemisphereLight args={["#d8d2c8", "#0b0b0c", 0.2]} />
      <spotLight
        ref={key}
        position={[5, 13, 7]}
        angle={0.36}
        penumbra={0.9}
        intensity={1150}
        color="#fff3e2"
        castShadow={quality === "high"}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
        shadow-camera-near={4}
        shadow-camera-far={30}
      />
      {/* cool rim from behind */}
      <spotLight position={[-10, 6, -8]} angle={0.6} penumbra={1} intensity={700} color="#c6d4ff" />
      {/* headlight beams */}
      <spotLight ref={headL} position={[4.55, 1.24, 0.86]} angle={0.38} penumbra={0.7} intensity={0} color="#fff0d2" distance={26} />
      <spotLight ref={headR} position={[4.55, 1.24, -0.86]} angle={0.38} penumbra={0.7} intensity={0} color="#fff0d2" distance={26} />
    </>
  );
}

function GltfModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  const t = sceneConfig.modelTransform;
  useEffect(() => {
    scene.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
  }, [scene]);
  return <primitive object={scene} position={t.position} rotation={t.rotation} scale={t.scale} />;
}

function ReadySignal({ onReady }: { onReady: () => void }) {
  const frames = useRef(0);
  const done = useRef(false);
  useFrame(() => {
    frames.current++;
    if (!done.current && frames.current > 3) {
      done.current = true;
      onReady();
    }
  });
  return null;
}

export default function Scene({
  profile,
  active,
  animate,
  intro = true,
  onReady,
}: {
  profile: SceneProfile;
  /** false while the hero is offscreen: rendering pauses */
  active: boolean;
  animate: boolean;
  /** play the opening camera move and light switch-on */
  intro?: boolean;
  onReady: () => void;
}) {
  const [quality, setQuality] = useState<"high" | "low">(profile === "desktop" ? "high" : "low");
  const [dpr, setDpr] = useState(profile === "desktop" ? 1.75 : 1.5);

  return (
    <Canvas
      shadows={quality === "high"}
      dpr={[1, dpr]}
      frameloop={active ? "always" : "never"}
      gl={{ antialias: true, powerPreference: "high-performance", alpha: false, preserveDrawingBuffer: false }}
      camera={{ position: [8, 1.4, 8], fov: 30, near: 0.5, far: 80 }}
      onCreated={({ gl, scene }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
        scene.background = new THREE.Color("#09090a");
        scene.fog = new THREE.Fog("#09090a", 16, 42);
      }}
      aria-hidden
    >
      <PerformanceMonitor
        onDecline={() => {
          setDpr(1);
          setQuality("low");
        }}
      />
      <CameraRig profile={profile} interactive={animate && profile === "desktop"} intro={animate && intro} />
      <StudioLights quality={quality} />
      <Suspense fallback={null}>
        <Environment resolution={256} frames={1}>
          <Lightformer form="rect" intensity={2.2} color="#fff4e8" position={[0, 7, 2]} rotation={[Math.PI / 2, 0, 0]} scale={[14, 3, 1]} />
          <Lightformer form="rect" intensity={1.2} color="#ffffff" position={[10, 3, 4]} rotation={[0, -Math.PI / 2.4, 0]} scale={[8, 2.4, 1]} />
          <Lightformer form="rect" intensity={0.8} color="#c9d5ff" position={[-10, 3, -4]} rotation={[0, Math.PI / 2.4, 0]} scale={[8, 2, 1]} />
          <Lightformer form="rect" intensity={0.9} color="#ff8a4a" position={[0, 1, -10]} scale={[16, 0.4, 1]} />
          {/* soft strip ahead of the truck so the windscreen and grille pick up a reflection */}
          <Lightformer form="rect" intensity={1.6} color="#f3ede2" position={[14, 6, 0]} rotation={[0, -Math.PI / 2, 0]} scale={[12, 1.6, 1]} />
        </Environment>
        {sceneConfig.modelUrl ? <GltfModel url={sceneConfig.modelUrl} /> : <Truck animate={animate} />}
        <Road quality={quality} />
        <Wordmark />
        {quality === "high" && (
          <>
            <BeamCone position={[4.5, 1.24, 0.86]} />
            <BeamCone position={[4.5, 1.24, -0.86]} />
            <Sparkles count={90} scale={[9, 2.6, 4]} position={[9, 1.4, 0]} size={1.6} speed={0.25} opacity={0.45} color="#fff1d8" noise={0.6} />
          </>
        )}
        <ContactShadows position={[0, 0.01, 0]} scale={[14, 6]} opacity={0.75} blur={2.4} far={2} resolution={512} frames={1} color="#000000" />
        <ReadySignal onReady={onReady} />
      </Suspense>
      {quality === "high" && (
        <EffectComposer multisampling={0} enableNormalPass={false}>
          <Bloom mipmapBlur luminanceThreshold={1.4} intensity={1.1} radius={0.7} />
          <Vignette offset={0.25} darkness={0.75} />
        </EffectComposer>
      )}
    </Canvas>
  );
}
