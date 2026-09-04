"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, MeshReflectorMaterial, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import type { IntroConfig } from "@/lib/intro/types";

type SceneProps = {
  config: IntroConfig;
  quality: "high" | "medium" | "low";
  reduced: boolean;
  startedAt: number;
};

function LiquidRibbon({ style, quality }: { style: string; quality: string }) {
  const mesh = useRef<THREE.Mesh>(null);
  const curve = useMemo(() => {
    const pts = [];
    for (let i = 0; i < 48; i++) {
      const a = (i / 48) * Math.PI * 2;
      const r = 1.15 + Math.sin(i * 0.35) * 0.18;
      pts.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a * 2) * 0.22, Math.sin(a) * r * 0.55));
    }
    return new THREE.CatmullRomCurve3(pts, true);
  }, []);

  const geo = useMemo(() => {
    const tubular = quality === "high" ? 180 : quality === "medium" ? 110 : 70;
    const radial = quality === "high" ? 12 : 8;
    return new THREE.TubeGeometry(curve, tubular, 0.055, radial, true);
  }, [curve, quality]);

  useFrame((state) => {
    if (!mesh.current) return;
    const t = state.clock.elapsedTime;
    mesh.current.rotation.y = t * 0.35;
    mesh.current.rotation.z = Math.sin(t * 0.4) * 0.08;
    const s = style === "minimal" ? 0.75 : 1;
    mesh.current.scale.setScalar(s * (0.85 + Math.sin(t * 0.8) * 0.04));
  });

  return (
    <mesh ref={mesh} geometry={geo} castShadow>
      <meshPhysicalMaterial
        color="#FF3F87"
        metalness={0.95}
        roughness={0.12}
        clearcoat={1}
        clearcoatRoughness={0.08}
        reflectivity={1}
        emissive="#ED2F78"
        emissiveIntensity={0.35}
      />
    </mesh>
  );
}

function HaloRing({ startedAt }: { startedAt: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (!ref.current) return;
    const t = Math.max(0, (performance.now() - startedAt) / 1000);
    const on = t > 1.7;
    const target = on ? 1 : 0.01;
    ref.current.scale.lerp(new THREE.Vector3(target, target, target), 0.07);
    ref.current.rotation.z += 0.003;
    const mat = ref.current.material as THREE.MeshStandardMaterial;
    mat.opacity = THREE.MathUtils.lerp(mat.opacity, on ? 0.85 : 0, 0.07);
  });
  return (
    <mesh ref={ref} rotation={[Math.PI / 2, 0, 0]} scale={0.01}>
      <torusGeometry args={[1.55, 0.012, 16, 96]} />
      <meshStandardMaterial
        color="#FF3F87"
        emissive="#ED2F78"
        emissiveIntensity={2.2}
        transparent
        opacity={0}
        metalness={0.8}
        roughness={0.25}
      />
    </mesh>
  );
}

function PolishBrush({ startedAt }: { startedAt: number }) {
  const group = useRef<THREE.Group>(null);
  const drop = useRef<THREE.Mesh>(null);
  const dropped = useRef(false);

  useFrame(() => {
    if (!group.current) return;
    const t = Math.max(0, (performance.now() - startedAt) / 1000);
    if (t > 1.35) {
      group.current.position.x = THREE.MathUtils.lerp(group.current.position.x, 1.35, 0.05);
      group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, 1.1, 0.05);
      group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, -0.45, 0.05);
    }
    if (drop.current && t > 1.75 && !dropped.current) {
      drop.current.position.y -= 0.038;
      if (drop.current.position.y < -0.95) {
        drop.current.visible = false;
        dropped.current = true;
      }
    }
  });

  return (
    <group ref={group} position={[2.6, 1.8, 0.4]} rotation={[0.2, 0, -0.2]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.035, 0.04, 0.9, 16]} />
        <meshStandardMaterial color="#1a1a1e" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, -0.55, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.02, 0.22, 12]} />
        <meshPhysicalMaterial
          color="#FF3F87"
          metalness={0.9}
          roughness={0.15}
          emissive="#ED2F78"
          emissiveIntensity={0.4}
        />
      </mesh>
      <mesh ref={drop} position={[0, -0.72, 0]}>
        <sphereGeometry args={[0.028, 16, 16]} />
        <meshPhysicalMaterial
          color="#FF3F87"
          metalness={0.95}
          roughness={0.08}
          emissive="#ED2F78"
          emissiveIntensity={0.5}
        />
      </mesh>
    </group>
  );
}

function Ripple({ startedAt }: { startedAt: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const started = useRef(false);
  useFrame(() => {
    if (!ref.current) return;
    const t = Math.max(0, (performance.now() - startedAt) / 1000);
    if (t < 2.05) return;
    if (!started.current) {
      started.current = true;
      ref.current.visible = true;
    }
    const mat = ref.current.material as THREE.MeshBasicMaterial;
    ref.current.scale.x += 0.03;
    ref.current.scale.y += 0.03;
    mat.opacity = Math.max(0, mat.opacity - 0.012);
  });
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[1.2, -0.98, 0.3]} scale={0.1} visible={false}>
      <ringGeometry args={[0.2, 0.24, 48]} />
      <meshBasicMaterial color="#FF3F87" transparent opacity={0.55} />
    </mesh>
  );
}

function Petals({ count }: { count: number }) {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const seeds = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        x: (Math.random() - 0.5) * 4,
        y: Math.random() * 2 + 0.5,
        z: (Math.random() - 0.5) * 3,
        s: 0.04 + Math.random() * 0.05,
        sp: 0.15 + Math.random() * 0.25,
      })),
    [count],
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    refs.current.forEach((m, i) => {
      if (!m) return;
      const s = seeds[i];
      m.position.y = s.y - ((t * s.sp) % 3);
      m.position.x = s.x + Math.sin(t * 0.6 + i) * 0.2;
      m.rotation.x = t * 0.4 + i;
      m.rotation.z = t * 0.3 + i;
    });
  });

  return (
    <group>
      {seeds.map((s, i) => (
        <mesh
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          position={[s.x, s.y, s.z]}
          scale={s.s}
        >
          <planeGeometry args={[1.4, 0.9]} />
          <meshStandardMaterial
            color="#FF3F87"
            emissive="#ED2F78"
            emissiveIntensity={0.25}
            side={THREE.DoubleSide}
            transparent
            opacity={0.75}
            roughness={0.6}
          />
        </mesh>
      ))}
    </group>
  );
}

function CameraRig({ startedAt }: { startedAt: number }) {
  useFrame((state) => {
    const t = Math.max(0, (performance.now() - startedAt) / 1000);
    const cam = state.camera;
    const z = THREE.MathUtils.lerp(5.2, 3.2, Math.min(1, t / 3));
    const y = THREE.MathUtils.lerp(0.35, 0.15, Math.min(1, t / 3));
    const x = Math.sin(t * 0.25) * 0.15;
    cam.position.lerp(new THREE.Vector3(x, y, z), 0.05);
    cam.lookAt(0, 0.15, 0);
  });
  return null;
}

function GlowCore({ startedAt }: { startedAt: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (!ref.current) return;
    const t = Math.max(0, (performance.now() - startedAt) / 1000);
    const s = t < 0.5 ? Math.max(0.01, t * 0.45) : 0.22 + Math.sin(t * 2) * 0.03;
    ref.current.scale.setScalar(s);
    (ref.current.material as THREE.MeshBasicMaterial).opacity = Math.min(0.7, t * 0.9);
  });
  return (
    <mesh ref={ref} position={[0, 0.1, 0]}>
      <sphereGeometry args={[0.35, 24, 24]} />
      <meshBasicMaterial color="#FF3F87" transparent opacity={0} />
    </mesh>
  );
}

export function IntroScene({ config, quality, reduced, startedAt }: SceneProps) {
  const showBrush = config.style !== "minimal" && config.style !== "logo-reveal";
  const showRibbon = config.style !== "logo-reveal" && config.style !== "minimal";
  const petalCount = !config.showPetals || reduced ? 0 : quality === "high" ? 8 : quality === "medium" ? 5 : 3;
  const particleCount =
    !config.showParticles || reduced ? 0 : quality === "high" ? 40 : quality === "medium" ? 22 : 12;

  return (
    <>
      <color attach="background" args={["#050507"]} />
      <fog attach="fog" args={["#050507", 6, 14]} />
      <ambientLight intensity={0.15} />
      <pointLight position={[2, 3, 2]} intensity={18} color="#FF3F87" distance={12} />
      <pointLight position={[-2.5, 1.5, -1]} intensity={8} color="#ED2F78" distance={10} />
      <spotLight
        position={[0, 5, 2]}
        angle={0.45}
        penumbra={0.7}
        intensity={12}
        color="#ffffff"
        castShadow={quality === "high"}
      />
      <directionalLight position={[-3, 4, -2]} intensity={0.4} color="#F7F6F4" />

      <CameraRig startedAt={startedAt} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
        <planeGeometry args={[18, 18]} />
        <MeshReflectorMaterial
          blur={quality === "low" ? [200, 80] : [300, 100]}
          resolution={quality === "high" ? 1024 : quality === "medium" ? 512 : 256}
          mixBlur={0.8}
          mixStrength={1.4}
          roughness={0.85}
          depthScale={0.6}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.2}
          color="#0a0a0c"
          metalness={0.75}
          mirror={0.65}
        />
      </mesh>

      <GlowCore startedAt={startedAt} />
      {showRibbon && <LiquidRibbon style={config.style} quality={quality} />}
      <HaloRing startedAt={startedAt} />
      {showBrush && (
        <>
          <PolishBrush startedAt={startedAt} />
          <Ripple startedAt={startedAt} />
        </>
      )}
      {petalCount > 0 && (
        <Float speed={0.6} rotationIntensity={0.2} floatIntensity={0.3}>
          <Petals count={petalCount} />
        </Float>
      )}
      {particleCount > 0 && (
        <Sparkles
          count={particleCount}
          scale={[5, 3, 4]}
          size={quality === "high" ? 2.2 : 1.6}
          speed={0.25}
          opacity={0.55}
          color="#FF3F87"
        />
      )}
    </>
  );
}
