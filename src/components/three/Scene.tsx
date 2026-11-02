"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Lightformer,
  MeshReflectorMaterial,
  PerformanceMonitor,
  useGLTF,
} from "@react-three/drei";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { heroState, sceneConfig } from "@/config/scene";
import { Truck } from "./Truck";
import { makeLaneTexture, makeRoadTextures, makeWordmarkTexture } from "./textures";

export type SceneProfile = "desktop" | "mobile";

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

function CameraRig({ profile, interactive }: { profile: SceneProfile; interactive: boolean }) {
  const { camera } = useThree() as { camera: THREE.PerspectiveCamera };
  const shot = SHOTS[profile];
  const smooth = useRef({ p: heroState.progress, px: 0, py: 0 });
  const target = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, dt) => {
    const s = smooth.current;
    const k = 1 - Math.exp(-dt * 4);
    s.p += (heroState.progress - s.p) * k;
    s.px += ((interactive ? heroState.pointerX : 0) - s.px) * (1 - Math.exp(-dt * 2.5));
    s.py += ((interactive ? heroState.pointerY : 0) - s.py) * (1 - Math.exp(-dt * 2.5));

    const t = ease(Math.min(1, Math.max(0, s.p)));
    const { from, to } = shot;
    const lerp = THREE.MathUtils.lerp;
    const idle = interactive ? Math.sin(state.clock.elapsedTime * 0.25) * 0.012 : 0;
    const angle = lerp(from.angle, to.angle, t) + s.px * 0.07 + idle;
    const radius = lerp(from.radius, to.radius, t);
    const height = lerp(from.height, to.height, t) + s.py * 0.35;

    target.set(
      lerp(from.target[0], to.target[0], t),
      lerp(from.target[1], to.target[1], t),
      lerp(from.target[2], to.target[2], t),
    );
    camera.position.set(target.x + Math.sin(angle) * radius, height, target.z + Math.cos(angle) * radius);
    camera.lookAt(target);
    camera.filmOffset = lerp(from.offset, to.offset, t);
    camera.fov = lerp(from.fov, to.fov, t);
    camera.updateProjectionMatrix();
  });
  return null;
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
            roughness={0.9}
            metalness={0.05}
            color="#56565a"
            blur={[400, 120]}
            resolution={512}
            mixBlur={1}
            mixStrength={1.6}
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
        intensity={1400}
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
      <spotLight ref={headL} position={[4.55, 1.12, 0.86]} angle={0.42} penumbra={0.6} intensity={90} color="#fff0d2" distance={22} />
      <spotLight ref={headR} position={[4.55, 1.12, -0.86]} angle={0.42} penumbra={0.6} intensity={90} color="#fff0d2" distance={22} />
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
  onReady,
}: {
  profile: SceneProfile;
  /** false while the hero is offscreen: rendering pauses */
  active: boolean;
  animate: boolean;
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
      <CameraRig profile={profile} interactive={animate && profile === "desktop"} />
      <StudioLights quality={quality} />
      <Suspense fallback={null}>
        <Environment resolution={256} frames={1}>
          <Lightformer form="rect" intensity={2.2} color="#fff4e8" position={[0, 7, 2]} rotation={[Math.PI / 2, 0, 0]} scale={[14, 3, 1]} />
          <Lightformer form="rect" intensity={1.2} color="#ffffff" position={[10, 3, 4]} rotation={[0, -Math.PI / 2.4, 0]} scale={[8, 2.4, 1]} />
          <Lightformer form="rect" intensity={0.8} color="#c9d5ff" position={[-10, 3, -4]} rotation={[0, Math.PI / 2.4, 0]} scale={[8, 2, 1]} />
          <Lightformer form="rect" intensity={0.9} color="#ff8a4a" position={[0, 1, -10]} scale={[16, 0.4, 1]} />
        </Environment>
        {sceneConfig.modelUrl ? <GltfModel url={sceneConfig.modelUrl} /> : <Truck animate={animate} />}
        <Road quality={quality} />
        <Wordmark />
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
