"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  Environment,
  MeshReflectorMaterial,
  Sparkles,
  Text,
} from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import type { IntroConfig } from "@/lib/intro/types";

type Quality = "high" | "medium" | "low";

type SceneProps = {
  config: IntroConfig;
  quality: Quality;
  reduced: boolean;
  startedAt: number;
  exiting: boolean;
};

function elapsed(startedAt: number) {
  return Math.max(0, (performance.now() - startedAt) / 1000);
}

function createMarbleTexture() {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.fillStyle = "#0b0b0e";
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 48; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const g = ctx.createLinearGradient(x, y, x + 180, y + 90);
    g.addColorStop(0, "rgba(255,255,255,0)");
    g.addColorStop(0.5, `rgba(${140 + Math.random() * 40},${120},${130},0.045)`);
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.strokeStyle = g;
    ctx.lineWidth = 1 + Math.random() * 2.5;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(x + 60, y - 40, x + 120, y + 50, x + 200, y + 10);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2.5, 2.5);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function LiquidRibbon({
  style,
  quality,
  startedAt,
}: {
  style: string;
  quality: Quality;
  startedAt: number;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  const mat = useRef<THREE.MeshPhysicalMaterial>(null);

  const curve = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < 64; i++) {
      const a = (i / 64) * Math.PI * 2.4;
      const r = 0.35 + (i / 64) * 1.05;
      const y = Math.sin(a * 1.6) * 0.28 + Math.cos(a * 0.7) * 0.08;
      pts.push(new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r * 0.72));
    }
    return new THREE.CatmullRomCurve3(pts, false);
  }, []);

  const geo = useMemo(() => {
    const tubular = quality === "high" ? 220 : quality === "medium" ? 140 : 80;
    const radial = quality === "high" ? 14 : quality === "medium" ? 10 : 7;
    return new THREE.TubeGeometry(curve, tubular, 0.048, radial, false);
  }, [curve, quality]);

  useEffect(() => {
    return () => {
      geo.dispose();
    };
  }, [geo]);

  useFrame((state) => {
    if (!mesh.current || !mat.current) return;
    const t = elapsed(startedAt);
    const emerge = THREE.MathUtils.clamp((t - 0.45) / 0.85, 0, 1);
    const ease = 1 - Math.pow(1 - emerge, 3);

    // Progressive tube reveal
    const index = geo.index;
    if (index) {
      const count = Math.floor(ease * index.count);
      geo.setDrawRange(0, Math.max(3, count));
    }

    mesh.current.rotation.y = state.clock.elapsedTime * 0.28 + ease * 0.4;
    mesh.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.35) * 0.06;
    const styleScale = style === "minimal" ? 0.72 : style === "liquid-chrome" ? 1.12 : 1;
    mesh.current.scale.setScalar(styleScale * (0.92 + Math.sin(state.clock.elapsedTime * 0.7) * 0.035));

    mat.current.emissiveIntensity = 0.25 + ease * 0.45;
    mat.current.opacity = Math.min(1, ease * 1.2);
    mesh.current.visible = emerge > 0.02;

    // Final elegant orbit flourish
    if (t > 2.45) {
      mesh.current.rotation.y += 0.012;
      mesh.current.scale.multiplyScalar(1.0015);
    }
  });

  return (
    <mesh ref={mesh} geometry={geo} castShadow visible={false}>
      <meshPhysicalMaterial
        ref={mat}
        color="#FF3F87"
        metalness={1}
        roughness={0.08}
        clearcoat={1}
        clearcoatRoughness={0.05}
        reflectivity={1}
        emissive="#ED2F78"
        emissiveIntensity={0.3}
        transparent
        opacity={0}
        envMapIntensity={1.6}
        ior={1.5}
        thickness={0.4}
      />
    </mesh>
  );
}

function AngelLogo3D({ startedAt, quality }: { startedAt: number; quality: Quality }) {
  const group = useRef<THREE.Group>(null);
  const fillMat = useRef<THREE.MeshPhysicalMaterial>(null);

  useFrame((state) => {
    if (!group.current) return;
    const t = elapsed(startedAt);
    const reveal = THREE.MathUtils.clamp((t - 0.95) / 0.85, 0, 1);
    const ease = 1 - Math.pow(1 - reveal, 2.4);

    group.current.position.y = 0.18 + Math.sin(state.clock.elapsedTime * 0.8) * 0.012;
    group.current.scale.setScalar(0.88 + ease * 0.12);
    group.current.visible = reveal > 0.02;

    if (fillMat.current) {
      fillMat.current.opacity = ease;
      fillMat.current.emissiveIntensity = 0.2 + ease * 0.85;
      const sweep = (Math.sin(state.clock.elapsedTime * 2.2 - 0.5) + 1) * 0.5;
      fillMat.current.metalness = 0.85 + sweep * 0.12;
      fillMat.current.roughness = 0.18 - sweep * 0.08;
    }

    if (t > 2.5) {
      group.current.position.z = THREE.MathUtils.lerp(group.current.position.z, 0.35, 0.04);
    }
  });

  const fontSize = quality === "low" ? 0.52 : 0.58;

  return (
    <group ref={group} position={[0, 0.18, 0]} visible={false}>
      <Text
        font="/fonts/GreatVibes-Regular.ttf"
        fontSize={fontSize}
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.02}
        outlineWidth={0.012}
        outlineColor="#FF3F87"
        outlineOpacity={0.55}
      >
        Angel Nails
        <meshPhysicalMaterial
          ref={fillMat}
          color="#FF4F92"
          metalness={0.95}
          roughness={0.12}
          clearcoat={1}
          clearcoatRoughness={0.06}
          emissive="#ED2F78"
          emissiveIntensity={0.35}
          transparent
          opacity={0}
          envMapIntensity={1.8}
          reflectivity={1}
        />
      </Text>
    </group>
  );
}

function HaloRing({ startedAt }: { startedAt: number }) {
  const outer = useRef<THREE.Mesh>(null);
  const inner = useRef<THREE.Mesh>(null);

  useFrame(() => {
    const t = elapsed(startedAt);
    const on = t > 1.75;
    const target = on ? 1 : 0.01;
    for (const ref of [outer, inner]) {
      if (!ref.current) continue;
      ref.current.scale.lerp(new THREE.Vector3(target, target, target), 0.06);
      ref.current.rotation.z += ref === outer ? 0.0025 : -0.0035;
      const mat = ref.current.material as THREE.MeshStandardMaterial;
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, on ? (ref === outer ? 0.75 : 0.4) : 0, 0.06);
    }
  });

  return (
    <group position={[0, 0.15, -0.35]}>
      <mesh ref={outer} rotation={[Math.PI / 2.15, 0, 0]} scale={0.01}>
        <torusGeometry args={[1.62, 0.01, 12, 96]} />
        <meshStandardMaterial
          color="#FF3F87"
          emissive="#ED2F78"
          emissiveIntensity={2.4}
          transparent
          opacity={0}
          metalness={0.85}
          roughness={0.2}
          depthWrite={false}
        />
      </mesh>
      <mesh ref={inner} rotation={[Math.PI / 2.15, 0.1, 0]} scale={0.01}>
        <torusGeometry args={[1.38, 0.006, 10, 72]} />
        <meshStandardMaterial
          color="#FF3F87"
          emissive="#FF3F87"
          emissiveIntensity={1.6}
          transparent
          opacity={0}
          metalness={0.7}
          roughness={0.3}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

function PolishBrush({ startedAt, onDrop }: { startedAt: number; onDrop: () => void }) {
  const group = useRef<THREE.Group>(null);
  const drop = useRef<THREE.Mesh>(null);
  const dropped = useRef(false);

  useFrame(() => {
    if (!group.current) return;
    const t = elapsed(startedAt);
    if (t > 1.35) {
      group.current.position.x = THREE.MathUtils.lerp(group.current.position.x, 1.28, 0.045);
      group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, 1.05, 0.045);
      group.current.position.z = THREE.MathUtils.lerp(group.current.position.z, 0.55, 0.045);
      group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, -0.52, 0.045);
      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, 0.35, 0.045);
    }
    if (drop.current && t > 1.7 && !dropped.current) {
      drop.current.position.y -= 0.042;
      drop.current.scale.multiplyScalar(0.995);
      if (drop.current.position.y < -1.55) {
        drop.current.visible = false;
        dropped.current = true;
        onDrop();
      }
    }
  });

  return (
    <group ref={group} position={[2.8, 2.1, 0.8]} rotation={[0.15, -0.2, -0.15]}>
      {/* Handle */}
      <mesh castShadow>
        <cylinderGeometry args={[0.032, 0.038, 0.95, 20]} />
        <meshStandardMaterial color="#121216" metalness={0.75} roughness={0.28} />
      </mesh>
      {/* Gold ferrule */}
      <mesh position={[0, -0.42, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.042, 0.1, 16]} />
        <meshStandardMaterial color="#c4a574" metalness={0.9} roughness={0.25} />
      </mesh>
      {/* Polish tip */}
      <mesh position={[0, -0.58, 0]} castShadow>
        <cylinderGeometry args={[0.048, 0.018, 0.24, 14]} />
        <meshPhysicalMaterial
          color="#FF3F87"
          metalness={0.92}
          roughness={0.1}
          emissive="#ED2F78"
          emissiveIntensity={0.55}
          clearcoat={1}
        />
      </mesh>
      {/* Drop */}
      <mesh ref={drop} position={[0, -0.76, 0]}>
        <sphereGeometry args={[0.03, 18, 18]} />
        <meshPhysicalMaterial
          color="#FF3F87"
          metalness={0.98}
          roughness={0.05}
          emissive="#ED2F78"
          emissiveIntensity={0.65}
          clearcoat={1}
        />
      </mesh>
    </group>
  );
}

function Ripples({ active }: { active: boolean }) {
  const rings = useRef<(THREE.Mesh | null)[]>([]);
  const born = useRef(0);

  useFrame(() => {
    if (!active) return;
    if (!born.current) born.current = performance.now();
    const age = (performance.now() - born.current) / 1000;
    rings.current.forEach((mesh, i) => {
      if (!mesh) return;
      const local = Math.max(0, age - i * 0.12);
      const mat = mesh.material as THREE.MeshBasicMaterial;
      mesh.scale.setScalar(0.15 + local * 1.8);
      mat.opacity = Math.max(0, 0.55 - local * 0.55);
      mesh.visible = mat.opacity > 0.02;
    });
  });

  return (
    <group position={[1.15, -0.97, 0.45]}>
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          ref={(el) => {
            rings.current[i] = el;
          }}
          rotation={[-Math.PI / 2, 0, 0]}
          visible={false}
        >
          <ringGeometry args={[0.18, 0.22, 64]} />
          <meshBasicMaterial color="#FF3F87" transparent opacity={0.5} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

function Petals({ count }: { count: number }) {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const seeds = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: (Math.random() - 0.5) * 4.2,
        y: 0.8 + Math.random() * 1.8,
        z: (Math.random() - 0.5) * 3.2,
        s: 0.045 + Math.random() * 0.04,
        sp: 0.12 + Math.random() * 0.18,
        phase: i * 1.7,
      })),
    [count],
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    refs.current.forEach((m, i) => {
      if (!m) return;
      const s = seeds[i];
      m.position.y = s.y - ((t * s.sp + s.phase) % 3.2);
      m.position.x = s.x + Math.sin(t * 0.45 + i) * 0.28;
      m.position.z = s.z + Math.cos(t * 0.35 + i) * 0.15;
      m.rotation.x = t * 0.35 + i;
      m.rotation.y = t * 0.25 + i * 0.2;
      m.rotation.z = t * 0.4 + i;
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
          scale={[s.s * 1.35, s.s, s.s * 0.2]}
        >
          <sphereGeometry args={[1, 10, 8]} />
          <meshStandardMaterial
            color="#FF3F87"
            emissive="#ED2F78"
            emissiveIntensity={0.35}
            roughness={0.45}
            metalness={0.15}
            transparent
            opacity={0.82}
          />
        </mesh>
      ))}
    </group>
  );
}

function GlowCore({ startedAt }: { startedAt: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (!ref.current) return;
    const t = elapsed(startedAt);
    const s = t < 0.5 ? Math.max(0.008, t * 0.5) : 0.2 + Math.sin(t * 1.8) * 0.025;
    ref.current.scale.setScalar(s);
    (ref.current.material as THREE.MeshBasicMaterial).opacity = Math.min(0.55, t * 0.85);
  });
  return (
    <mesh ref={ref} position={[0, 0.12, 0]}>
      <sphereGeometry args={[0.4, 24, 24]} />
      <meshBasicMaterial color="#FF3F87" transparent opacity={0} depthWrite={false} />
    </mesh>
  );
}

function VolumetricShaft({ startedAt }: { startedAt: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (!ref.current) return;
    const t = elapsed(startedAt);
    const on = THREE.MathUtils.clamp((t - 0.3) / 1.2, 0, 1);
    const mat = ref.current.material as THREE.MeshBasicMaterial;
    mat.opacity = on * 0.08;
    ref.current.rotation.y += 0.0015;
  });
  return (
    <mesh ref={ref} position={[0, 1.2, 0]} rotation={[0, 0, 0]}>
      <coneGeometry args={[1.8, 4.2, 32, 1, true]} />
      <meshBasicMaterial
        color="#FF3F87"
        transparent
        opacity={0}
        side={THREE.DoubleSide}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

function CameraRig({ startedAt, exiting }: { startedAt: number; exiting: boolean }) {
  useFrame((state) => {
    const t = elapsed(startedAt);
    const cam = state.camera;
    let z = THREE.MathUtils.lerp(5.4, 3.35, Math.min(1, t / 2.8));
    let y = THREE.MathUtils.lerp(0.42, 0.18, Math.min(1, t / 2.8));
    const x = Math.sin(t * 0.22) * 0.18;

    // Final cinematic push through logo
    if (t > 2.45 || exiting) {
      const push = exiting ? 1 : THREE.MathUtils.clamp((t - 2.45) / 0.7, 0, 1);
      z = THREE.MathUtils.lerp(z, 0.6, push);
      y = THREE.MathUtils.lerp(y, 0.2, push);
    }

    cam.position.lerp(new THREE.Vector3(x, y, z), exiting ? 0.12 : 0.045);
    cam.lookAt(0, 0.18, 0);
  });
  return null;
}

function MarbleBackdrop({ quality }: { quality: Quality }) {
  const texture = useMemo(() => createMarbleTexture(), []);
  useEffect(() => {
    return () => {
      texture?.dispose();
    };
  }, [texture]);

  if (!texture || quality === "low") {
    return (
      <mesh position={[0, 1.2, -4.5]}>
        <planeGeometry args={[16, 10]} />
        <meshStandardMaterial color="#0a0a0c" roughness={0.95} metalness={0.05} />
      </mesh>
    );
  }

  return (
    <mesh position={[0, 1.2, -4.5]}>
      <planeGeometry args={[16, 10]} />
      <meshStandardMaterial map={texture} color="#121216" roughness={0.92} metalness={0.08} />
    </mesh>
  );
}

function PostFX({ quality }: { quality: Quality }) {
  if (quality === "low") return null;
  return (
    <EffectComposer multisampling={quality === "high" ? 4 : 0} enableNormalPass={false}>
      <Bloom
        intensity={quality === "high" ? 0.85 : 0.55}
        luminanceThreshold={0.35}
        luminanceSmoothing={0.5}
        mipmapBlur
      />
      <Vignette offset={0.25} darkness={0.65} />
    </EffectComposer>
  );
}

function ResourceCleanup() {
  const { gl, scene } = useThree();
  useEffect(() => {
    return () => {
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry?.dispose();
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
          mats.forEach((m) => m?.dispose?.());
        }
      });
      gl.dispose();
    };
  }, [gl, scene]);
  return null;
}

export function IntroScene({ config, quality, reduced, startedAt, exiting }: SceneProps) {
  const [rippleOn, setRippleOn] = useState(false);
  const showBrush = config.style === "angel-reveal" || config.style === "liquid-chrome";
  const showRibbon = config.style !== "logo-reveal" && config.style !== "minimal";
  const showLogo3d = config.style !== "minimal";
  const showHalo = config.style === "angel-reveal" || config.style === "logo-reveal";
  const petalCount = !config.showPetals || reduced ? 0 : quality === "high" ? 7 : quality === "medium" ? 4 : 2;
  const particleCount =
    !config.showParticles || reduced ? 0 : quality === "high" ? 36 : quality === "medium" ? 18 : 10;

  return (
    <>
      <color attach="background" args={["#050507"]} />
      <fog attach="fog" args={["#050507", 5.5, 13]} />
      <ambientLight intensity={0.12} />
      <pointLight position={[2.2, 3.2, 2]} intensity={22} color="#FF3F87" distance={14} decay={2} />
      <pointLight position={[-2.8, 1.4, -1.2]} intensity={10} color="#ED2F78" distance={11} decay={2} />
      <spotLight
        position={[0, 5.2, 2.4]}
        angle={0.42}
        penumbra={0.75}
        intensity={14}
        color="#ffffff"
        castShadow={quality === "high"}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight position={[-3, 4, -2]} intensity={0.35} color="#F7F6F4" />
      <pointLight position={[0, 0.3, 1.5]} intensity={6} color="#FF3F87" distance={5} />

      {quality !== "low" && <Environment preset="night" />}

      <CameraRig startedAt={startedAt} exiting={exiting} />
      <ResourceCleanup />
      <MarbleBackdrop quality={quality} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <MeshReflectorMaterial
          blur={quality === "low" ? [180, 60] : [320, 110]}
          resolution={quality === "high" ? 1024 : quality === "medium" ? 512 : 256}
          mixBlur={0.85}
          mixStrength={1.55}
          roughness={0.82}
          depthScale={0.7}
          minDepthThreshold={0.35}
          maxDepthThreshold={1.25}
          color="#08080a"
          metalness={0.8}
          mirror={0.72}
        />
      </mesh>

      <GlowCore startedAt={startedAt} />
      {quality !== "low" && <VolumetricShaft startedAt={startedAt} />}
      {showRibbon && <LiquidRibbon style={config.style} quality={quality} startedAt={startedAt} />}
      {showLogo3d && <AngelLogo3D startedAt={startedAt} quality={quality} />}
      {showHalo && <HaloRing startedAt={startedAt} />}
      {showBrush && (
        <>
          <PolishBrush startedAt={startedAt} onDrop={() => setRippleOn(true)} />
          <Ripples active={rippleOn} />
        </>
      )}
      {petalCount > 0 && <Petals count={petalCount} />}
      {particleCount > 0 && (
        <Sparkles
          count={particleCount}
          scale={[5.5, 3.2, 4.2]}
          size={quality === "high" ? 2 : 1.4}
          speed={0.22}
          opacity={0.5}
          color="#FF3F87"
        />
      )}
      <PostFX quality={quality} />
    </>
  );
}
