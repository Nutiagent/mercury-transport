"use client";

/**
 * Procedural flatbed recovery truck carrying a compact excavator.
 * Units are metres. The truck faces +X, wheels rest on y = 0, centre line is z = 0.
 */

import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { site } from "@/config/site";
import { makeBrushedTexture, makeDoorDecal, makeHazardTexture } from "./textures";

type V3 = [number, number, number];

function useMaterials() {
  return useMemo(() => {
    const brushed = makeBrushedTexture();
    brushed.repeat.set(1, 4);
    return {
      paint: new THREE.MeshPhysicalMaterial({
        color: "#e8e3d9",
        metalness: 0.35,
        roughness: 0.28,
        clearcoat: 1,
        clearcoatRoughness: 0.06,
      }),
      graphite: new THREE.MeshPhysicalMaterial({
        color: "#202226",
        metalness: 0.65,
        roughness: 0.38,
        clearcoat: 0.6,
        clearcoatRoughness: 0.2,
      }),
      chassis: new THREE.MeshStandardMaterial({ color: "#121315", metalness: 0.5, roughness: 0.6 }),
      aluminium: new THREE.MeshPhysicalMaterial({
        color: "#9a9ea6",
        metalness: 0.9,
        roughness: 0.45,
        roughnessMap: brushed,
        anisotropy: 0.8,
      }),
      chrome: new THREE.MeshStandardMaterial({ color: "#c9ccd1", metalness: 1, roughness: 0.22 }),
      rubber: new THREE.MeshStandardMaterial({ color: "#0d0d0e", metalness: 0, roughness: 0.92 }),
      rim: new THREE.MeshStandardMaterial({ color: "#6f737b", metalness: 0.95, roughness: 0.28 }),
      glass: new THREE.MeshPhysicalMaterial({
        color: "#07090c",
        metalness: 0.2,
        roughness: 0.04,
        clearcoat: 1,
        envMapIntensity: 1.6,
      }),
      orange: new THREE.MeshPhysicalMaterial({
        color: "#ff5b1a",
        metalness: 0.15,
        roughness: 0.42,
        clearcoat: 0.8,
        clearcoatRoughness: 0.15,
      }),
      headlight: new THREE.MeshStandardMaterial({ color: "#fff6e6", emissive: "#fff1d6", emissiveIntensity: 5, toneMapped: false }),
      drl: new THREE.MeshStandardMaterial({ color: "#ffffff", emissive: "#ffffff", emissiveIntensity: 3, toneMapped: false }),
      tail: new THREE.MeshStandardMaterial({ color: "#5a0705", emissive: "#ff1a0a", emissiveIntensity: 3, toneMapped: false }),
      amberA: new THREE.MeshStandardMaterial({ color: "#5a3300", emissive: "#ffa514", emissiveIntensity: 0, toneMapped: false }),
      amberB: new THREE.MeshStandardMaterial({ color: "#5a3300", emissive: "#ffa514", emissiveIntensity: 0, toneMapped: false }),
      hazard: new THREE.MeshStandardMaterial({ map: makeHazardTexture(), roughness: 0.5, metalness: 0.2 }),
      strap: new THREE.MeshStandardMaterial({ color: "#d08a12", roughness: 0.7 }),
      decal: new THREE.MeshStandardMaterial({
        map: makeDoorDecal(site.phone.display),
        transparent: true,
        roughness: 0.3,
        metalness: 0.1,
        polygonOffset: true,
        polygonOffsetFactor: -2,
      }),
    };
  }, []);
}

type Mats = ReturnType<typeof useMaterials>;

/** A beam between two points (cylinder or box), handy for booms, straps and cables. */
function Beam({ from, to, r = 0.05, mat, box = false }: { from: V3; to: V3; r?: number; mat: THREE.Material; box?: boolean }) {
  const { pos, quat, len } = useMemo(() => {
    const a = new THREE.Vector3(...from);
    const b = new THREE.Vector3(...to);
    const dir = b.clone().sub(a);
    const len = dir.length();
    const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
    return { pos: a.add(b).multiplyScalar(0.5), quat, len };
  }, [from, to]);
  return (
    <mesh position={pos} quaternion={quat} material={mat} castShadow>
      {box ? <boxGeometry args={[r * 2, len, r * 2]} /> : <cylinderGeometry args={[r, r, len, 12]} />}
    </mesh>
  );
}

function Wheel({ position, m, flip = false }: { position: V3; m: Mats; flip?: boolean }) {
  const s = flip ? -1 : 1;
  return (
    <group position={position} rotation={[Math.PI / 2, 0, 0]}>
      {/* tyre */}
      <mesh material={m.rubber} castShadow>
        <cylinderGeometry args={[0.53, 0.53, 0.38, 40]} />
      </mesh>
      <mesh material={m.rubber} position={[0, 0.19 * s, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.44, 0.09, 12, 40]} />
      </mesh>
      {/* rim */}
      <mesh material={m.rim} position={[0, 0.17 * s, 0]}>
        <cylinderGeometry args={[0.34, 0.34, 0.06, 32]} />
      </mesh>
      <mesh material={m.chrome} position={[0, 0.215 * s, 0]}>
        <cylinderGeometry args={[0.11, 0.13, 0.06, 16]} />
      </mesh>
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return (
          <mesh key={i} material={m.chrome} position={[Math.cos(a) * 0.2, 0.205 * s, Math.sin(a) * 0.2]}>
            <cylinderGeometry args={[0.022, 0.022, 0.05, 8]} />
          </mesh>
        );
      })}
    </group>
  );
}

function Cab({ m }: { m: Mats }) {
  return (
    <group>
      {/* cab body */}
      <RoundedBox args={[1.95, 2.05, 2.42]} radius={0.14} smoothness={4} position={[3.38, 2.05, 0]} material={m.paint} castShadow receiveShadow />
      {/* two-tone lower cab */}
      <RoundedBox args={[1.99, 0.52, 2.45]} radius={0.1} smoothness={4} position={[3.38, 1.24, 0]} material={m.graphite} castShadow />
      {/* roof spoiler */}
      <RoundedBox args={[1.4, 0.28, 2.3]} radius={0.1} position={[3.15, 3.2, 0]} material={m.paint} castShadow />
      {/* windshield, slightly raked */}
      <mesh position={[4.37, 2.5, 0]} rotation={[0, 0, 0.07]} material={m.glass}>
        <boxGeometry args={[0.04, 1.0, 2.2]} />
      </mesh>
      {/* side windows + door seams + decals */}
      {[1, -1].map((s) => (
        <group key={s}>
          <mesh position={[3.68, 2.52, 1.212 * s]} material={m.glass}>
            <boxGeometry args={[1.05, 0.72, 0.02]} />
          </mesh>
          <mesh position={[2.98, 1.85, 1.213 * s]} material={m.chassis}>
            <boxGeometry args={[0.012, 1.5, 0.01]} />
          </mesh>
          <mesh
            position={[3.65, 1.62, 1.216 * s]}
            rotation={[0, s > 0 ? 0 : Math.PI, 0]}
            material={m.decal}
          >
            <planeGeometry args={[1.12, 0.56]} />
          </mesh>
          {/* mirror */}
          <Beam from={[4.15, 2.2, 1.18 * s]} to={[4.22, 2.35, 1.5 * s]} r={0.025} mat={m.graphite} />
          <RoundedBox args={[0.1, 0.42, 0.2]} radius={0.03} position={[4.22, 2.45, 1.55 * s]} material={m.graphite} castShadow />
          {/* steps */}
          <mesh position={[3.65, 0.78, 1.13 * s]} material={m.aluminium}>
            <boxGeometry args={[0.55, 0.05, 0.28]} />
          </mesh>
          {/* front fender */}
          <RoundedBox args={[1.25, 0.16, 0.44]} radius={0.06} position={[3.25, 1.12, 1.07 * s]} material={m.graphite} castShadow />
          {/* fuel tank / toolbox */}
          <RoundedBox args={[1.1, 0.5, 0.5]} radius={0.06} position={[1.65, 0.86, 0.92 * s]} material={m.aluminium} castShadow />
        </group>
      ))}
      {/* grille */}
      <mesh position={[4.37, 1.6, 0]} material={m.chassis}>
        <boxGeometry args={[0.05, 0.6, 1.4]} />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} position={[4.4, 1.36 + i * 0.12, 0]} material={m.chrome}>
          <boxGeometry args={[0.03, 0.03, 1.36]} />
        </mesh>
      ))}
      {/* bumper */}
      <RoundedBox args={[0.32, 0.4, 2.46]} radius={0.08} position={[4.44, 0.84, 0]} material={m.graphite} castShadow />
      <mesh position={[4.61, 0.72, 0]} material={m.orange}>
        <boxGeometry args={[0.02, 0.05, 1.9]} />
      </mesh>
      {/* headlights */}
      {[1, -1].map((s) => (
        <group key={s}>
          <RoundedBox args={[0.08, 0.2, 0.46]} radius={0.03} position={[4.4, 1.12, 0.86 * s]} material={m.headlight} />
          <mesh position={[4.41, 1.26, 0.86 * s]} material={m.drl}>
            <boxGeometry args={[0.04, 0.025, 0.46]} />
          </mesh>
          <mesh position={[4.61, 0.86, 1.0 * s]} material={m.headlight}>
            <boxGeometry args={[0.02, 0.08, 0.16]} />
          </mesh>
        </group>
      ))}
      {/* sun visor + roof beacon bar */}
      <mesh position={[4.38, 3.02, 0]} material={m.graphite}>
        <boxGeometry args={[0.16, 0.06, 2.3]} />
      </mesh>
      <RoundedBox args={[0.34, 0.08, 1.7]} radius={0.03} position={[3.55, 3.38, 0]} material={m.graphite} />
      {[-0.66, -0.22, 0.22, 0.66].map((z, i) => (
        <RoundedBox
          key={z}
          args={[0.28, 0.14, 0.38]}
          radius={0.05}
          position={[3.55, 3.48, z]}
          material={i % 2 ? m.amberA : m.amberB}
        />
      ))}
      {/* exhaust stack */}
      <Beam from={[2.33, 1.0, 1.05]} to={[2.33, 3.3, 1.05]} r={0.06} mat={m.chrome} />
    </group>
  );
}

function Bed({ m }: { m: Mats }) {
  return (
    <group>
      {/* chassis rails */}
      {[0.45, -0.45].map((z) => (
        <mesh key={z} position={[0, 0.82, z]} material={m.chassis} castShadow>
          <boxGeometry args={[8.6, 0.28, 0.16]} />
        </mesh>
      ))}
      {/* sub-frame */}
      <mesh position={[-1, 1.18, 0]} material={m.chassis}>
        <boxGeometry args={[6.6, 0.2, 1.4]} />
      </mesh>
      {/* deck */}
      <RoundedBox args={[6.8, 0.16, 2.5]} radius={0.04} position={[-1.0, 1.42, 0]} material={m.aluminium} castShadow receiveShadow />
      {Array.from({ length: 9 }).map((_, i) => (
        <mesh key={i} position={[-1.0, 1.51, -1.0 + i * 0.25]} material={m.aluminium} receiveShadow>
          <boxGeometry args={[6.7, 0.025, 0.04]} />
        </mesh>
      ))}
      {/* side rails */}
      {[1, -1].map((s) => (
        <group key={s}>
          <mesh position={[-1.0, 1.36, 1.27 * s]} material={m.graphite} castShadow>
            <boxGeometry args={[6.8, 0.2, 0.05]} />
          </mesh>
          <mesh position={[-1.0, 1.26, 1.296 * s]} material={m.orange}>
            <boxGeometry args={[6.8, 0.03, 0.01]} />
          </mesh>
          {/* stake pockets */}
          {[-3.6, -2.2, -0.8, 0.6, 2.0].map((x) => (
            <mesh key={x} position={[x, 1.36, 1.3 * s]} material={m.chassis}>
              <boxGeometry args={[0.1, 0.16, 0.04]} />
            </mesh>
          ))}
          {/* rear mudguards */}
          <mesh position={[-2.08, 1.04, 1.05 * s]} material={m.graphite}>
            <boxGeometry args={[2.5, 0.05, 0.48]} />
          </mesh>
          <mesh position={[-3.45, 0.74, 1.05 * s]} material={m.rubber}>
            <boxGeometry args={[0.03, 0.55, 0.44]} />
          </mesh>
          {/* tail light */}
          <RoundedBox args={[0.06, 0.16, 0.36]} radius={0.02} position={[-4.42, 1.2, 0.95 * s]} material={m.tail} />
        </group>
      ))}
      {/* rear hazard plate */}
      <mesh position={[-4.42, 1.36, 0]} rotation={[0, -Math.PI / 2, 0]} material={m.hazard}>
        <planeGeometry args={[2.5, 0.2]} />
      </mesh>
      {/* stowed ramps */}
      {[0.62, -0.62].map((z) => (
        <mesh key={z} position={[-4.32, 1.0, z]} rotation={[0, 0, 0.12]} material={m.aluminium} castShadow>
          <boxGeometry args={[0.08, 0.6, 0.42]} />
        </mesh>
      ))}
      {/* headboard */}
      <group position={[2.3, 0, 0]}>
        {[1.1, -1.1].map((z) => (
          <mesh key={z} position={[0, 2.2, z]} material={m.graphite} castShadow>
            <boxGeometry args={[0.1, 1.4, 0.1]} />
          </mesh>
        ))}
        {[1.7, 2.2, 2.75].map((y) => (
          <mesh key={y} position={[0, y, 0]} material={m.aluminium} castShadow>
            <boxGeometry args={[0.08, 0.07, 2.3]} />
          </mesh>
        ))}
        <RoundedBox args={[0.12, 0.12, 0.42]} radius={0.03} position={[0.02, 2.95, 0]} material={m.amberA} />
      </group>
      {/* winch */}
      <RoundedBox args={[0.45, 0.32, 0.75]} radius={0.05} position={[1.9, 1.66, 0]} material={m.graphite} castShadow />
      <mesh position={[1.9, 1.7, 0]} rotation={[Math.PI / 2, 0, 0]} material={m.chrome}>
        <cylinderGeometry args={[0.12, 0.12, 0.78, 20]} />
      </mesh>
    </group>
  );
}

function Excavator({ m }: { m: Mats }) {
  const x0 = -1.65;
  return (
    <group position={[x0, 1.51, 0]}>
      {/* tracks */}
      {[0.58, -0.58].map((z) => (
        <group key={z}>
          <RoundedBox args={[2.05, 0.42, 0.34]} radius={0.17} smoothness={4} position={[0, 0.21, z]} material={m.rubber} castShadow receiveShadow />
          {[-0.75, -0.25, 0.25, 0.75].map((x) => (
            <mesh key={x} position={[x, 0.2, z + (z > 0 ? 0.172 : -0.172)]} rotation={[Math.PI / 2, 0, 0]} material={m.chassis}>
              <cylinderGeometry args={[0.1, 0.1, 0.02, 16]} />
            </mesh>
          ))}
        </group>
      ))}
      <mesh position={[0, 0.3, 0]} material={m.chassis}>
        <boxGeometry args={[1.5, 0.22, 0.85]} />
      </mesh>
      {/* dozer blade */}
      <RoundedBox args={[0.14, 0.34, 1.5]} radius={0.03} position={[1.18, 0.22, 0]} material={m.orange} castShadow />
      <Beam from={[0.55, 0.32, 0]} to={[1.1, 0.3, 0]} r={0.05} mat={m.chassis} />
      {/* swing bearing */}
      <mesh position={[0, 0.48, 0]} material={m.chassis}>
        <cylinderGeometry args={[0.48, 0.48, 0.12, 32]} />
      </mesh>
      {/* upper house */}
      <group position={[-0.1, 0, 0]}>
        <RoundedBox args={[1.55, 0.62, 1.42]} radius={0.12} smoothness={4} position={[-0.05, 0.84, 0]} material={m.orange} castShadow receiveShadow />
        <RoundedBox args={[0.38, 0.6, 1.42]} radius={0.16} smoothness={4} position={[-0.86, 0.82, 0]} material={m.graphite} castShadow />
        {/* engine cover vents */}
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} position={[-0.45 + i * 0.09, 1.155, 0.35]} material={m.chassis}>
            <boxGeometry args={[0.04, 0.01, 0.5]} />
          </mesh>
        ))}
        {/* cab */}
        <group position={[0.1, 1.15, -0.3]}>
          {[
            [0.45, 0.36],
            [0.45, -0.36],
            [-0.45, 0.36],
            [-0.45, -0.36],
          ].map(([x, z]) => (
            <mesh key={`${x}${z}`} position={[x, 0.55, z]} material={m.graphite} castShadow>
              <boxGeometry args={[0.06, 1.1, 0.06]} />
            </mesh>
          ))}
          <mesh position={[0, 0.52, 0]} material={m.glass}>
            <boxGeometry args={[0.86, 1.0, 0.68]} />
          </mesh>
          <RoundedBox args={[1.05, 0.08, 0.85]} radius={0.03} position={[0, 1.12, 0]} material={m.orange} castShadow />
          <mesh position={[0.22, 1.18, 0.2]} material={m.amberB}>
            <cylinderGeometry args={[0.06, 0.07, 0.1, 12]} />
          </mesh>
        </group>
        {/* boom → arm → bucket, folded for transport */}
        <group position={[0.62, 0.95, 0.38]}>
          <Beam from={[0, 0, 0]} to={[1.25, 1.15, 0]} r={0.12} mat={m.orange} box />
          <Beam from={[0.15, -0.2, 0]} to={[0.95, 0.75, 0]} r={0.045} mat={m.chrome} />
          <Beam from={[1.25, 1.15, 0]} to={[1.75, -0.25, 0]} r={0.1} mat={m.orange} box />
          <Beam from={[1.18, 1.25, 0.12]} to={[1.6, 0.3, 0.12]} r={0.035} mat={m.chrome} />
          <RoundedBox args={[0.55, 0.42, 0.5]} radius={0.06} position={[1.75, -0.48, 0]} rotation={[0, 0, 0.35]} material={m.graphite} castShadow />
          {/* bucket teeth */}
          {[-0.16, 0, 0.16].map((z) => (
            <mesh key={z} position={[2.04, -0.66, z]} material={m.chrome}>
              <boxGeometry args={[0.08, 0.06, 0.07]} />
            </mesh>
          ))}
        </group>
      </group>
      {/* tie-down straps */}
      {[1, -1].map((s) => (
        <group key={s}>
          <Beam from={[0.95, 0.3, 0.75 * s]} to={[1.55, -0.02, 1.22 * s]} r={0.02} mat={m.strap} box />
          <Beam from={[-0.95, 0.3, 0.75 * s]} to={[-1.55, -0.02, 1.22 * s]} r={0.02} mat={m.strap} box />
        </group>
      ))}
    </group>
  );
}

export function Truck({ animate = true }: { animate?: boolean }) {
  const m = useMaterials();
  const beaconA = useRef<THREE.PointLight>(null);
  const beaconB = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    if (!animate) {
      m.amberA.emissiveIntensity = 4;
      m.amberB.emissiveIntensity = 1;
      return;
    }
    const t = clock.elapsedTime;
    // double-flash pattern, alternating left/right
    const flash = (phase: number) => {
      const c = (t * 1.4 + phase) % 1;
      return c < 0.08 || (c > 0.16 && c < 0.24) ? 1 : 0;
    };
    const a = flash(0);
    const b = flash(0.5);
    m.amberA.emissiveIntensity = 0.2 + a * 7;
    m.amberB.emissiveIntensity = 0.2 + b * 7;
    if (beaconA.current) beaconA.current.intensity = a * 6;
    if (beaconB.current) beaconB.current.intensity = b * 6;
  });

  return (
    <group>
      <Cab m={m} />
      <Bed m={m} />
      <Excavator m={m} />
      {/* wheels: front axle + rear tandem */}
      {[3.25, -1.45, -2.75].map((x) =>
        [1, -1].map((s) => <Wheel key={`${x}${s}`} position={[x, 0.53, 1.04 * s]} m={m} flip={s < 0} />),
      )}
      {/* axle hubs visible underneath */}
      {[3.25, -1.45, -2.75].map((x) => (
        <mesh key={x} position={[x, 0.53, 0]} rotation={[Math.PI / 2, 0, 0]} material={m.chassis}>
          <cylinderGeometry args={[0.09, 0.09, 1.8, 10]} />
        </mesh>
      ))}
      <pointLight ref={beaconA} position={[3.55, 3.75, 0.5]} color="#ffa514" distance={9} decay={1.6} intensity={0} />
      <pointLight ref={beaconB} position={[3.55, 3.75, -0.5]} color="#ffa514" distance={9} decay={1.6} intensity={0} />
    </group>
  );
}
