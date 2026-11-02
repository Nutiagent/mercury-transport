"use client";

/**
 * Procedural flatbed recovery truck carrying a compact excavator.
 * Units are metres. The truck faces +X, wheels rest on y = 0, centre line is z = 0.
 * Shapes are extruded from side profiles so silhouettes read like real vehicles.
 */

import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { heroState } from "@/config/scene";
import { site } from "@/config/site";
import { makeBrushedTexture, makeCheckerPlate, makeDoorDecal, makeHazardTexture, makeTreadTexture } from "./textures";

type V3 = [number, number, number];

/* ───────────────────────── Materials ───────────────────────── */

function useMaterials() {
  return useMemo(() => {
    const brushed = makeBrushedTexture();
    brushed.repeat.set(1, 4);
    const checker = makeCheckerPlate();
    checker.repeat.set(26, 10);
    const tread = makeTreadTexture();
    return {
      paint: new THREE.MeshPhysicalMaterial({
        color: "#ebe6dc",
        metalness: 0.25,
        roughness: 0.22,
        clearcoat: 1,
        clearcoatRoughness: 0.04,
        envMapIntensity: 1.3,
      }),
      graphite: new THREE.MeshPhysicalMaterial({
        color: "#1d1f23",
        metalness: 0.55,
        roughness: 0.32,
        clearcoat: 0.8,
        clearcoatRoughness: 0.12,
      }),
      plastic: new THREE.MeshStandardMaterial({ color: "#141517", metalness: 0.05, roughness: 0.7 }),
      chassis: new THREE.MeshStandardMaterial({ color: "#101113", metalness: 0.45, roughness: 0.55 }),
      aluminium: new THREE.MeshPhysicalMaterial({
        color: "#a4a8ae",
        metalness: 0.9,
        roughness: 0.42,
        roughnessMap: brushed,
        anisotropy: 0.8,
      }),
      deck: new THREE.MeshStandardMaterial({
        color: "#8d9198",
        metalness: 0.85,
        roughness: 0.38,
        bumpMap: checker,
        bumpScale: 2.5,
        roughnessMap: checker,
      }),
      chrome: new THREE.MeshStandardMaterial({ color: "#d0d3d8", metalness: 1, roughness: 0.16 }),
      rubber: new THREE.MeshStandardMaterial({ color: "#121213", metalness: 0, roughness: 0.88, side: THREE.DoubleSide }),
      tread: new THREE.MeshStandardMaterial({ color: "#151516", metalness: 0, roughness: 0.9, bumpMap: tread, bumpScale: 4 }),
      rim: new THREE.MeshPhysicalMaterial({ color: "#8a8f97", metalness: 1, roughness: 0.22, clearcoat: 0.6 }),
      rimDark: new THREE.MeshStandardMaterial({ color: "#2a2c30", metalness: 0.8, roughness: 0.35 }),
      glass: new THREE.MeshPhysicalMaterial({
        color: "#05070a",
        metalness: 0.1,
        roughness: 0.02,
        clearcoat: 1,
        envMapIntensity: 2.2,
      }),
      lens: new THREE.MeshPhysicalMaterial({
        color: "#ffffff",
        metalness: 0,
        roughness: 0.02,
        transmission: 0.9,
        thickness: 0.05,
        transparent: true,
        opacity: 0.35,
      }),
      orange: new THREE.MeshPhysicalMaterial({
        color: "#ff5b1a",
        metalness: 0.1,
        roughness: 0.36,
        clearcoat: 0.9,
        clearcoatRoughness: 0.12,
      }),
      headlight: new THREE.MeshStandardMaterial({ color: "#fff6e6", emissive: "#fff1d6", emissiveIntensity: 0, toneMapped: false }),
      drl: new THREE.MeshStandardMaterial({ color: "#202020", emissive: "#ffffff", emissiveIntensity: 0, toneMapped: false }),
      tail: new THREE.MeshStandardMaterial({ color: "#3a0503", emissive: "#ff1a0a", emissiveIntensity: 0, toneMapped: false }),
      amberA: new THREE.MeshStandardMaterial({ color: "#4a2a00", emissive: "#ffa514", emissiveIntensity: 0, toneMapped: false }),
      amberB: new THREE.MeshStandardMaterial({ color: "#4a2a00", emissive: "#ffa514", emissiveIntensity: 0, toneMapped: false }),
      hazard: new THREE.MeshStandardMaterial({ map: makeHazardTexture(), roughness: 0.45, metalness: 0.2 }),
      strap: new THREE.MeshStandardMaterial({ color: "#e09a10", roughness: 0.65 }),
      decal: new THREE.MeshStandardMaterial({
        map: makeDoorDecal(site.phone.display),
        transparent: true,
        roughness: 0.25,
        metalness: 0.1,
        polygonOffset: true,
        polygonOffsetFactor: -2,
      }),
    };
  }, []);
}

type Mats = ReturnType<typeof useMaterials>;

/* ───────────────────────── Geometry helpers ───────────────────────── */

/** Extrude a closed side profile (x,y) to a given width, centred on z = 0. */
function extrude(points: [number, number][], width: number, bevel = 0.04, curve?: (s: THREE.Shape) => void) {
  const s = new THREE.Shape();
  if (curve) curve(s);
  else {
    s.moveTo(points[0][0], points[0][1]);
    points.slice(1).forEach(([x, y]) => s.lineTo(x, y));
    s.closePath();
  }
  const depth = Math.max(0.001, width - bevel * 2);
  const g = new THREE.ExtrudeGeometry(s, {
    depth,
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 4,
    curveSegments: 16,
  });
  g.translate(0, 0, -depth / 2);
  g.computeVertexNormals();
  return g;
}

function Beam({ from, to, r = 0.05, mat, box = false }: { from: V3; to: V3; r?: number; mat: THREE.Material; box?: boolean }) {
  const fk = from.join();
  const tk = to.join();
  const { pos, quat, len } = useMemo(() => {
    const a = new THREE.Vector3(...(fk.split(",").map(Number) as V3));
    const b = new THREE.Vector3(...(tk.split(",").map(Number) as V3));
    const dir = b.clone().sub(a);
    const len = dir.length();
    const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
    return { pos: a.add(b).multiplyScalar(0.5), quat, len };
  }, [fk, tk]);
  return (
    <mesh position={pos} quaternion={quat} material={mat} castShadow>
      {box ? <boxGeometry args={[r * 2, len, r * 2]} /> : <cylinderGeometry args={[r, r, len, 14]} />}
    </mesh>
  );
}

/* ───────────────────────── Wheels ───────────────────────── */

function useWheelGeometry() {
  return useMemo(() => {
    const R = 0.53;
    const W = 0.36;
    // Tyre cross-section revolved around the axle (lathe uses x = radius, y = axial)
    const prof: THREE.Vector2[] = [];
    const steps = 14;
    prof.push(new THREE.Vector2(0.33, -W / 2 + 0.02));
    for (let i = 0; i <= steps; i++) {
      const a = -Math.PI / 2 + (i / steps) * Math.PI;
      // squarish shoulder
      const x = R - 0.035 + Math.cos(a) * 0.035 * 1;
      const y = Math.sin(a) * (W / 2);
      const sq = Math.pow(Math.abs(Math.sin(a)), 6);
      prof.push(new THREE.Vector2(x - sq * 0.05, y));
    }
    prof.push(new THREE.Vector2(0.33, W / 2 - 0.02));
    const tyre = new THREE.LatheGeometry(prof, 64);
    const treadBand = new THREE.CylinderGeometry(R + 0.004, R + 0.004, W * 0.78, 64, 1, true);

    // Rim dish
    const rp = [
      [0.06, 0.17],
      [0.12, 0.175],
      [0.2, 0.16],
      [0.27, 0.13],
      [0.31, 0.15],
      [0.335, 0.16],
      [0.335, -0.1],
    ].map(([x, y]) => new THREE.Vector2(x, y));
    const rim = new THREE.LatheGeometry(rp, 48);
    return { tyre, treadBand, rim, R };
  }, []);
}

function Wheel({ position, m, flip = false, geo }: { position: V3; m: Mats; flip?: boolean; geo: ReturnType<typeof useWheelGeometry> }) {
  const s = flip ? -1 : 1;
  return (
    // LatheGeometry revolves around Y; rotate so the axle is along Z.
    <group position={position} rotation={[(s * Math.PI) / 2, 0, 0]}>
      <mesh geometry={geo.tyre} material={m.rubber} castShadow />
      <mesh geometry={geo.treadBand} material={m.tread} />
      <mesh geometry={geo.rim} material={m.rim} />
      {/* hand-holes in the rim */}
      {Array.from({ length: 6 }).map((_, i) => {
        const a = (i / 6) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.235, 0.155, Math.sin(a) * 0.235]} material={m.rimDark}>
            <cylinderGeometry args={[0.045, 0.045, 0.02, 16]} />
          </mesh>
        );
      })}
      <mesh position={[0, 0.19, 0]} material={m.chrome}>
        <cylinderGeometry args={[0.1, 0.12, 0.05, 24]} />
      </mesh>
      {Array.from({ length: 10 }).map((_, i) => {
        const a = (i / 10) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.145, 0.2, Math.sin(a) * 0.145]} material={m.chrome}>
            <cylinderGeometry args={[0.016, 0.016, 0.05, 6]} />
          </mesh>
        );
      })}
    </group>
  );
}

/* ───────────────────────── Cab ───────────────────────── */

const CAB_W = 2.42;

function Cab({ m }: { m: Mats }) {
  const geo = useMemo(() => {
    // Side profile of the cab shell (front at +x)
    const body = extrude([], CAB_W, 0.05, (s) => {
      s.moveTo(2.46, 1.0);
      s.lineTo(4.36, 1.0);
      s.lineTo(4.4, 1.62);
      s.quadraticCurveTo(4.42, 2.0, 4.36, 2.06);
      s.lineTo(4.16, 2.98);
      s.quadraticCurveTo(4.1, 3.14, 3.92, 3.15);
      s.lineTo(2.62, 3.15);
      s.quadraticCurveTo(2.46, 3.15, 2.46, 2.98);
      s.closePath();
    });
    // Aerodynamic roof deflector
    const roof = extrude([], 2.2, 0.06, (s) => {
      s.moveTo(2.62, 3.12);
      s.lineTo(3.7, 3.12);
      s.quadraticCurveTo(3.4, 3.62, 2.9, 3.66);
      s.lineTo(2.62, 3.66);
      s.closePath();
    });
    // Window outline (shape in XY, placed on each side)
    const win = new THREE.Shape();
    win.moveTo(3.2, 2.12);
    win.lineTo(4.22, 2.12);
    win.lineTo(4.04, 2.9);
    win.quadraticCurveTo(4.0, 2.96, 3.9, 2.96);
    win.lineTo(3.2, 2.96);
    win.closePath();
    const sideWin = new THREE.ShapeGeometry(win, 8);
    // Wheel arch (half-torus) over front axle
    const arch = new THREE.TorusGeometry(0.64, 0.07, 10, 32, Math.PI);
    return { body, roof, sideWin, arch };
  }, []);

  const wsAngle = Math.atan2(4.36 - 4.16, 2.98 - 2.06); // windscreen rake

  return (
    <group>
      <mesh geometry={geo.body} material={m.paint} castShadow receiveShadow />
      <mesh geometry={geo.roof} material={m.paint} castShadow />
      {/* lower two-tone skirt */}
      <RoundedBox args={[1.96, 0.42, CAB_W + 0.03]} radius={0.08} smoothness={4} position={[3.41, 1.18, 0]} material={m.graphite} castShadow />
      {/* windscreen */}
      <mesh position={[4.335, 2.535, 0]} rotation={[0, 0, wsAngle]} material={m.glass}>
        <boxGeometry args={[0.03, 0.94, 2.2]} />
      </mesh>
      {/* wipers */}
      {[0.45, -0.5].map((z) => (
        <mesh key={z} position={[4.43, 2.14, z]} rotation={[0.5, 0, wsAngle]} material={m.plastic}>
          <boxGeometry args={[0.02, 0.02, 0.8]} />
        </mesh>
      ))}
      {[1, -1].map((s) => (
        <group key={s}>
          {/* side glass */}
          <mesh geometry={geo.sideWin} position={[0, 0, (CAB_W / 2 + 0.002) * s]} rotation={[0, s > 0 ? 0 : Math.PI, 0]} scale={[s > 0 ? 1 : -1, 1, 1]} material={m.glass} />
          {/* door shut lines */}
          <mesh position={[3.12, 1.95, (CAB_W / 2 + 0.003) * s]} material={m.chassis}>
            <boxGeometry args={[0.012, 1.62, 0.004]} />
          </mesh>
          <mesh position={[4.3, 1.62, (CAB_W / 2 + 0.003) * s]} material={m.chassis}>
            <boxGeometry args={[0.012, 0.9, 0.004]} />
          </mesh>
          {/* door handle */}
          <mesh position={[3.3, 1.98, (CAB_W / 2 + 0.02) * s]} material={m.chrome}>
            <boxGeometry args={[0.2, 0.035, 0.03]} />
          </mesh>
          {/* decal */}
          <mesh position={[3.72, 1.66, (CAB_W / 2 + 0.006) * s]} rotation={[0, s > 0 ? 0 : Math.PI, 0]} material={m.decal}>
            <planeGeometry args={[1.0, 0.5]} />
          </mesh>
          {/* mirror arm + housing */}
          <Beam from={[4.2, 2.2, 1.16 * s]} to={[4.28, 2.36, 1.48 * s]} r={0.022} mat={m.graphite} />
          <Beam from={[4.2, 2.86, 1.16 * s]} to={[4.28, 2.82, 1.48 * s]} r={0.018} mat={m.graphite} />
          <RoundedBox args={[0.12, 0.5, 0.22]} radius={0.05} smoothness={4} position={[4.28, 2.6, 1.55 * s]} material={m.graphite} castShadow />
          <mesh position={[4.215, 2.6, 1.55 * s]} material={m.glass}>
            <boxGeometry args={[0.01, 0.42, 0.17]} />
          </mesh>
          {/* entry steps */}
          {[0.62, 0.86].map((y) => (
            <mesh key={y} position={[3.62, y, 1.14 * s]} material={m.aluminium}>
              <boxGeometry args={[0.5, 0.04, 0.26]} />
            </mesh>
          ))}
          {/* wheel arch */}
          <mesh geometry={geo.arch} position={[3.25, 0.53, 1.12 * s]} material={m.plastic} castShadow />
          {/* fuel tank */}
          <mesh position={[1.62, 0.78, 0.95 * s]} rotation={[0, 0, Math.PI / 2]} material={m.aluminium} castShadow>
            <cylinderGeometry args={[0.28, 0.28, 1.1, 32]} />
          </mesh>
          {[1.2, 2.04].map((x) => (
            <mesh key={x} position={[x, 0.78, 0.95 * s]} rotation={[0, 0, Math.PI / 2]} material={m.chassis}>
              <torusGeometry args={[0.285, 0.018, 8, 32]} />
            </mesh>
          ))}
          {/* side marker lights */}
          <mesh position={[2.9, 1.06, 1.23 * s]} material={m.amberB}>
            <boxGeometry args={[0.1, 0.04, 0.02]} />
          </mesh>
        </group>
      ))}

      {/* grille */}
      <mesh position={[4.455, 1.68, 0]} material={m.plastic}>
        <boxGeometry args={[0.04, 0.56, 1.45]} />
      </mesh>
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i} position={[4.48, 1.45 + i * 0.09, 0]} material={i === 5 ? m.chrome : m.graphite}>
          <boxGeometry args={[0.025, 0.028, 1.38]} />
        </mesh>
      ))}
      <mesh position={[4.47, 1.98, 0]} material={m.chrome}>
        <boxGeometry args={[0.02, 0.05, 1.5]} />
      </mesh>

      {/* bumper with integrated lights */}
      <RoundedBox args={[0.34, 0.42, 2.48]} radius={0.1} smoothness={4} position={[4.44, 0.86, 0]} material={m.graphite} castShadow />
      <mesh position={[4.615, 0.72, 0]} material={m.orange}>
        <boxGeometry args={[0.01, 0.04, 1.9]} />
      </mesh>
      <mesh position={[4.6, 0.68, 0]} material={m.plastic}>
        <boxGeometry args={[0.04, 0.12, 0.7]} />
      </mesh>

      {/* headlight clusters */}
      {[1, -1].map((s) => (
        <group key={s} position={[4.46, 1.24, 0.86 * s]}>
          <RoundedBox args={[0.08, 0.26, 0.5]} radius={0.04} smoothness={3} material={m.plastic} />
          {[-0.12, 0.08].map((z) => (
            <mesh key={z} position={[0.04, -0.01, z * s]} rotation={[0, 0, Math.PI / 2]} material={m.headlight}>
              <cylinderGeometry args={[0.065, 0.065, 0.02, 24]} />
            </mesh>
          ))}
          <mesh position={[0.045, 0.1, 0]} material={m.drl}>
            <boxGeometry args={[0.012, 0.022, 0.46]} />
          </mesh>
          <mesh position={[0.05, 0, 0]} material={m.lens}>
            <boxGeometry args={[0.01, 0.24, 0.48]} />
          </mesh>
          {/* fog light in bumper */}
          <mesh position={[0.2, -0.36, 0.12 * s]} rotation={[0, 0, Math.PI / 2]} material={m.headlight}>
            <cylinderGeometry args={[0.05, 0.05, 0.02, 20]} />
          </mesh>
        </group>
      ))}

      {/* sun visor */}
      <mesh position={[4.24, 3.08, 0]} rotation={[0, 0, -0.25]} material={m.graphite}>
        <boxGeometry args={[0.32, 0.04, 2.3]} />
      </mesh>
      {/* roof beacon bar */}
      <group position={[3.0, 3.72, 0]}>
        <RoundedBox args={[0.36, 0.06, 1.8]} radius={0.025} material={m.graphite} />
        {[-0.72, -0.36, 0, 0.36, 0.72].map((z, i) => (
          <group key={z} position={[0, 0.09, z]}>
            <RoundedBox args={[0.24, 0.12, 0.26]} radius={0.05} material={i % 2 ? m.amberA : m.amberB} />
          </group>
        ))}
        <RoundedBox args={[0.3, 0.16, 1.76]} radius={0.06} position={[0, 0.09, 0]} material={m.lens} />
      </group>
      {/* exhaust stack + heat shield */}
      <Beam from={[2.36, 1.0, 1.02]} to={[2.36, 3.45, 1.02]} r={0.065} mat={m.chrome} />
      <Beam from={[2.36, 1.7, 1.02]} to={[2.36, 2.6, 1.02]} r={0.085} mat={m.aluminium} />
    </group>
  );
}

/* ───────────────────────── Tilt bed ───────────────────────── */

function Bed({ m }: { m: Mats }) {
  const deckGeo = useMemo(
    () =>
      extrude([], 2.5, 0.03, (s) => {
        s.moveTo(-4.45, 1.32);
        s.lineTo(2.3, 1.32);
        s.lineTo(2.3, 1.5);
        s.lineTo(-4.2, 1.5);
        s.lineTo(-4.45, 1.4);
        s.closePath();
      }),
    [],
  );
  const railGeo = useMemo(
    () =>
      extrude([], 0.06, 0.01, (s) => {
        s.moveTo(-4.45, 1.22);
        s.lineTo(2.3, 1.22);
        s.lineTo(2.3, 1.48);
        s.lineTo(-4.2, 1.48);
        s.lineTo(-4.45, 1.36);
        s.closePath();
      }),
    [],
  );
  return (
    <group>
      {/* chassis rails + cross members */}
      {[0.45, -0.45].map((z) => (
        <mesh key={z} position={[0, 0.84, z]} material={m.chassis} castShadow>
          <boxGeometry args={[8.7, 0.3, 0.14]} />
        </mesh>
      ))}
      {[-3.8, -2.1, -0.6, 1.0].map((x) => (
        <mesh key={x} position={[x, 0.84, 0]} material={m.chassis}>
          <boxGeometry args={[0.1, 0.22, 0.9]} />
        </mesh>
      ))}
      {/* sub-frame */}
      <mesh position={[-1, 1.15, 0]} material={m.chassis}>
        <boxGeometry args={[6.6, 0.16, 1.2]} />
      </mesh>
      {/* tilt cylinder (hydraulics) */}
      <Beam from={[0.6, 0.95, 0]} to={[-0.7, 1.24, 0]} r={0.08} mat={m.orange} />
      <Beam from={[-0.2, 1.13, 0]} to={[-1.0, 1.28, 0]} r={0.045} mat={m.chrome} />

      {/* checker-plate deck */}
      <mesh geometry={deckGeo} material={m.deck} castShadow receiveShadow />
      {[1, -1].map((s) => (
        <group key={s}>
          <mesh geometry={railGeo} position={[0, 0, 1.26 * s]} material={m.graphite} castShadow />
          <mesh position={[-1.05, 1.27, 1.295 * s]} material={m.orange}>
            <boxGeometry args={[6.6, 0.025, 0.006]} />
          </mesh>
          {/* stake pockets / lashing points */}
          {[-3.6, -2.4, -1.2, 0, 1.2].map((x) => (
            <group key={x}>
              <mesh position={[x, 1.38, 1.3 * s]} material={m.chassis}>
                <boxGeometry args={[0.1, 0.18, 0.04]} />
              </mesh>
              <mesh position={[x, 1.51, 1.16 * s]} rotation={[Math.PI / 2, 0, 0]} material={m.chrome}>
                <torusGeometry args={[0.04, 0.008, 6, 14]} />
              </mesh>
            </group>
          ))}
          {/* rear mudguards + flaps */}
          <mesh position={[-2.1, 1.12, 1.05 * s]} material={m.plastic}>
            <boxGeometry args={[2.55, 0.04, 0.5]} />
          </mesh>
          <mesh position={[-3.48, 0.76, 1.05 * s]} material={m.rubber}>
            <boxGeometry args={[0.025, 0.56, 0.46]} />
          </mesh>
          {/* toolbox */}
          <RoundedBox args={[0.9, 0.42, 0.42]} radius={0.03} position={[0.15, 0.92, 0.98 * s]} material={m.aluminium} castShadow />
          <mesh position={[0.15, 0.98, 1.195 * s]} material={m.chrome}>
            <boxGeometry args={[0.24, 0.03, 0.02]} />
          </mesh>
          {/* tail light cluster */}
          <group position={[-4.47, 1.08, 0.92 * s]}>
            <RoundedBox args={[0.06, 0.16, 0.42]} radius={0.02} material={m.plastic} />
            <mesh position={[-0.032, 0, 0.08 * s]} material={m.tail}>
              <boxGeometry args={[0.01, 0.12, 0.18]} />
            </mesh>
            <mesh position={[-0.032, 0, -0.1 * s]} material={m.amberA}>
              <boxGeometry args={[0.01, 0.12, 0.1]} />
            </mesh>
          </group>
        </group>
      ))}
      {/* rear underride guard */}
      <mesh position={[-4.3, 0.62, 0]} material={m.hazard}>
        <boxGeometry args={[0.08, 0.14, 2.3]} />
      </mesh>
      {[0.7, -0.7].map((z) => (
        <mesh key={z} position={[-4.3, 0.85, z]} material={m.chassis}>
          <boxGeometry args={[0.06, 0.36, 0.06]} />
        </mesh>
      ))}
      {/* rear hazard plate */}
      <mesh position={[-4.465, 1.36, 0]} rotation={[0, -Math.PI / 2, 0]} material={m.hazard}>
        <planeGeometry args={[2.45, 0.08]} />
      </mesh>
      {/* stowed ramps */}
      {[0.62, -0.62].map((z) => (
        <mesh key={z} position={[-4.36, 0.98, z]} rotation={[0, 0, 0.1]} material={m.aluminium} castShadow>
          <boxGeometry args={[0.06, 0.55, 0.4]} />
        </mesh>
      ))}
      {/* headboard */}
      <group position={[2.32, 0, 0]}>
        {[1.12, -1.12].map((z) => (
          <mesh key={z} position={[0, 2.3, z]} material={m.graphite} castShadow>
            <boxGeometry args={[0.1, 1.6, 0.1]} />
          </mesh>
        ))}
        {[1.75, 2.25, 2.75, 3.08].map((y) => (
          <mesh key={y} position={[0, y, 0]} material={y > 3 ? m.graphite : m.aluminium} castShadow>
            <boxGeometry args={[0.08, y > 3 ? 0.08 : 0.06, 2.34]} />
          </mesh>
        ))}
        {/* work lights */}
        {[0.6, -0.6].map((z) => (
          <group key={z} position={[-0.08, 3.08, z]}>
            <RoundedBox args={[0.1, 0.12, 0.2]} radius={0.02} material={m.plastic} />
            <mesh position={[-0.052, 0, 0]} material={m.drl}>
              <boxGeometry args={[0.005, 0.08, 0.15]} />
            </mesh>
          </group>
        ))}
      </group>
      {/* winch */}
      <group position={[1.85, 1.68, 0]}>
        <RoundedBox args={[0.42, 0.34, 0.9]} radius={0.05} material={m.graphite} castShadow />
        <mesh rotation={[Math.PI / 2, 0, 0]} material={m.chrome}>
          <cylinderGeometry args={[0.13, 0.13, 0.62, 24]} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} material={m.chassis}>
          <cylinderGeometry args={[0.16, 0.16, 0.66, 24, 1, true]} />
        </mesh>
      </group>
    </group>
  );
}

/* ───────────────────────── Excavator ───────────────────────── */

function Excavator({ m }: { m: Mats }) {
  const geo = useMemo(() => {
    const house = extrude([], 1.42, 0.08, (s) => {
      s.moveTo(-0.85, 0.55);
      s.lineTo(0.7, 0.55);
      s.lineTo(0.72, 1.08);
      s.lineTo(-0.55, 1.12);
      s.quadraticCurveTo(-1.02, 1.12, -1.02, 0.8);
      s.quadraticCurveTo(-1.02, 0.55, -0.85, 0.55);
      s.closePath();
    });
    const boom = extrude([], 0.22, 0.03, (s) => {
      s.moveTo(0, -0.1);
      s.lineTo(0.3, -0.12);
      s.quadraticCurveTo(0.95, 0.45, 1.32, 1.08);
      s.lineTo(1.2, 1.22);
      s.quadraticCurveTo(0.7, 0.62, 0, 0.12);
      s.closePath();
    });
    const arm = extrude([], 0.18, 0.025, (s) => {
      s.moveTo(1.18, 1.2);
      s.lineTo(1.34, 1.12);
      s.lineTo(1.86, -0.22);
      s.lineTo(1.72, -0.28);
      s.closePath();
    });
    const bucket = extrude([], 0.5, 0.03, (s) => {
      s.moveTo(1.6, -0.2);
      s.quadraticCurveTo(2.1, -0.25, 2.12, -0.62);
      s.lineTo(1.85, -0.72);
      s.quadraticCurveTo(1.55, -0.55, 1.6, -0.2);
      s.closePath();
    });
    const pad = new THREE.BoxGeometry(0.14, 0.045, 0.34);
    return { house, boom, arm, bucket, pad };
  }, []);

  // Track shoes laid around a stadium loop, as one instanced mesh per side
  const shoes = useMemo(() => {
    const L = 1.7;
    const r = 0.19;
    const per = Math.PI * r + L;
    const total = 2 * per;
    const n = 46;
    const out: { p: V3; rz: number }[] = [];
    for (let i = 0; i < n; i++) {
      let d = (i / n) * total;
      let x: number, y: number, rz: number;
      if (d < L) {
        x = -L / 2 + d;
        y = -r;
        rz = 0;
      } else if ((d -= L) < Math.PI * r) {
        const a = -Math.PI / 2 + d / r;
        x = L / 2 + Math.cos(a) * r;
        y = Math.sin(a) * r;
        rz = a + Math.PI / 2;
      } else if ((d -= Math.PI * r) < L) {
        x = L / 2 - d;
        y = r;
        rz = Math.PI;
      } else {
        d -= L;
        const a = Math.PI / 2 + d / r;
        x = -L / 2 + Math.cos(a) * r;
        y = Math.sin(a) * r;
        rz = a + Math.PI / 2;
      }
      out.push({ p: [x, y + 0.2, 0], rz });
    }
    return out;
  }, []);

  const left = useRef<THREE.InstancedMesh>(null);
  const right = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const o = new THREE.Object3D();
    [left.current, right.current].forEach((mesh) => {
      if (!mesh) return;
      shoes.forEach(({ p, rz }, i) => {
        o.position.set(...p);
        o.rotation.set(0, 0, rz);
        o.updateMatrix();
        mesh.setMatrixAt(i, o.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
    });
  }, [shoes]);

  return (
    <group position={[-1.65, 1.5, 0]}>
      {/* undercarriage */}
      {[0.58, -0.58].map((z, k) => (
        <group key={z} position={[0, 0, z]}>
          <instancedMesh ref={k === 0 ? left : right} args={[geo.pad, m.rubber, shoes.length]} castShadow />
          <RoundedBox args={[1.72, 0.3, 0.26]} radius={0.12} position={[0, 0.2, 0]} material={m.chassis} />
          {[-0.85, 0.85].map((x) => (
            <mesh key={x} position={[x, 0.2, 0]} rotation={[Math.PI / 2, 0, 0]} material={m.graphite}>
              <cylinderGeometry args={[0.17, 0.17, 0.3, 24]} />
            </mesh>
          ))}
          {[-0.45, 0, 0.45].map((x) => (
            <mesh key={x} position={[x, 0.06, z > 0 ? 0.14 : -0.14]} rotation={[Math.PI / 2, 0, 0]} material={m.chrome}>
              <cylinderGeometry args={[0.06, 0.06, 0.02, 16]} />
            </mesh>
          ))}
        </group>
      ))}
      <mesh position={[0, 0.3, 0]} material={m.chassis}>
        <boxGeometry args={[1.3, 0.22, 0.9]} />
      </mesh>
      {/* dozer blade */}
      <RoundedBox args={[0.12, 0.34, 1.5]} radius={0.03} position={[1.18, 0.23, 0]} rotation={[0, 0, -0.08]} material={m.orange} castShadow />
      <Beam from={[0.55, 0.32, 0.3]} to={[1.12, 0.32, 0.3]} r={0.045} mat={m.chassis} />
      <Beam from={[0.55, 0.32, -0.3]} to={[1.12, 0.32, -0.3]} r={0.045} mat={m.chassis} />
      {/* slew ring */}
      <mesh position={[0, 0.48, 0]} material={m.chassis}>
        <cylinderGeometry args={[0.5, 0.5, 0.12, 40]} />
      </mesh>

      {/* upper structure */}
      <group position={[-0.05, 0, 0]}>
        <mesh geometry={geo.house} material={m.orange} castShadow receiveShadow />
        {/* counterweight */}
        <RoundedBox args={[0.32, 0.5, 1.44]} radius={0.14} smoothness={4} position={[-0.9, 0.8, 0]} material={m.graphite} castShadow />
        {/* engine louvres */}
        {Array.from({ length: 6 }).map((_, i) => (
          <mesh key={i} position={[-0.7 + i * 0.07, 1.125, 0.38]} material={m.chassis}>
            <boxGeometry args={[0.03, 0.01, 0.46]} />
          </mesh>
        ))}
        {/* operator cab (ROPS) */}
        <group position={[0.1, 1.12, -0.28]}>
          {[
            [0.42, 0.33],
            [0.42, -0.33],
            [-0.42, 0.33],
            [-0.42, -0.33],
          ].map(([x, z]) => (
            <mesh key={`${x}${z}`} position={[x, 0.56, z]} material={m.graphite} castShadow>
              <boxGeometry args={[0.06, 1.12, 0.06]} />
            </mesh>
          ))}
          <mesh position={[0, 0.54, 0]} material={m.glass}>
            <boxGeometry args={[0.82, 1.02, 0.64]} />
          </mesh>
          <mesh position={[-0.05, 0.3, 0]} material={m.plastic}>
            <boxGeometry args={[0.36, 0.5, 0.42]} />
          </mesh>
          <RoundedBox args={[1.04, 0.07, 0.8]} radius={0.03} position={[0, 1.14, 0]} material={m.orange} castShadow />
          <mesh position={[-0.3, 1.24, 0.25]} material={m.amberB}>
            <cylinderGeometry args={[0.055, 0.065, 0.12, 16]} />
          </mesh>
        </group>
        {/* boom, arm, bucket — folded for transport */}
        <group position={[0.62, 0.95, 0.36]}>
          <mesh geometry={geo.boom} material={m.orange} castShadow />
          <mesh geometry={geo.arm} material={m.orange} castShadow />
          <mesh geometry={geo.bucket} material={m.graphite} castShadow />
          {/* hydraulic rams */}
          <Beam from={[0.1, -0.25, 0.12]} to={[0.75, 0.55, 0.12]} r={0.055} mat={m.graphite} />
          <Beam from={[0.5, 0.25, 0.12]} to={[0.95, 0.8, 0.12]} r={0.035} mat={m.chrome} />
          <Beam from={[1.0, 1.05, -0.1]} to={[1.55, 0.25, -0.1]} r={0.045} mat={m.graphite} />
          <Beam from={[1.3, 0.62, -0.1]} to={[1.62, 0.08, -0.1]} r={0.028} mat={m.chrome} />
          {/* teeth */}
          {[-0.16, 0, 0.16].map((z) => (
            <mesh key={z} position={[2.0, -0.7, z]} rotation={[0, 0, 0.4]} material={m.chrome}>
              <boxGeometry args={[0.08, 0.1, 0.07]} />
            </mesh>
          ))}
        </group>
      </group>
      {/* ratchet straps to lashing points */}
      {[1, -1].map((s) => (
        <group key={s}>
          <Beam from={[0.9, 0.34, 0.76 * s]} to={[1.65, 0.02, 1.16 * s]} r={0.022} mat={m.strap} box />
          <Beam from={[-0.9, 0.34, 0.76 * s]} to={[-1.95, 0.02, 1.16 * s]} r={0.022} mat={m.strap} box />
        </group>
      ))}
    </group>
  );
}

/* ───────────────────────── Assembly + light animation ───────────────────────── */

export function Truck({ animate = true }: { animate?: boolean }) {
  const m = useMaterials();
  const wheelGeo = useWheelGeometry();
  const beaconA = useRef<THREE.PointLight>(null);
  const beaconB = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    // heroState.lights: 0 → off, 1 → fully on (driven by the intro sequence)
    const L = animate ? heroState.lights : 1;
    // fluorescent-style flicker on switch-on
    const flick = L > 0 && L < 1 ? (Math.sin(clock.elapsedTime * 60) > 0.2 ? 1 : 0.15) : 1;
    m.headlight.emissiveIntensity = 6 * L * flick;
    m.drl.emissiveIntensity = 4 * Math.min(1, L * 2);
    m.tail.emissiveIntensity = 3 * Math.min(1, L * 2);

    if (!animate) {
      m.amberA.emissiveIntensity = 6;
      m.amberB.emissiveIntensity = 1;
      return;
    }
    const t = clock.elapsedTime;
    const on = heroState.beacons;
    const flash = (phase: number) => {
      const c = (t * 1.4 + phase) % 1;
      return c < 0.08 || (c > 0.16 && c < 0.24) ? 1 : 0;
    };
    const a = flash(0) * on;
    const b = flash(0.5) * on;
    m.amberA.emissiveIntensity = 0.15 + a * 8;
    m.amberB.emissiveIntensity = 0.15 + b * 8;
    if (beaconA.current) beaconA.current.intensity = a * 9;
    if (beaconB.current) beaconB.current.intensity = b * 9;
  });

  return (
    <group>
      <Cab m={m} />
      <Bed m={m} />
      <Excavator m={m} />
      {[3.25, -1.45, -2.75].map((x) =>
        [1, -1].map((s) => <Wheel key={`${x}${s}`} position={[x, 0.53, 1.03 * s]} m={m} flip={s < 0} geo={wheelGeo} />),
      )}
      {[3.25, -1.45, -2.75].map((x) => (
        <mesh key={x} position={[x, 0.53, 0]} rotation={[Math.PI / 2, 0, 0]} material={m.chassis}>
          <cylinderGeometry args={[0.09, 0.09, 1.8, 10]} />
        </mesh>
      ))}
      {/* differential housings */}
      {[-1.45, -2.75].map((x) => (
        <mesh key={x} position={[x, 0.5, 0]} material={m.chassis}>
          <sphereGeometry args={[0.22, 16, 12]} />
        </mesh>
      ))}
      <pointLight ref={beaconA} position={[3.0, 4.05, 0.6]} color="#ffa514" distance={10} decay={1.5} intensity={0} />
      <pointLight ref={beaconB} position={[3.0, 4.05, -0.6]} color="#ffa514" distance={10} decay={1.5} intensity={0} />
    </group>
  );
}
