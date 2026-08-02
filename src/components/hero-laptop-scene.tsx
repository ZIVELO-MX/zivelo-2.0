"use client";

import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import { HERO_LAPTOP_DEFAULT_ROTATION } from "@/lib/hero-laptop-rotation";

interface HeroLaptopSceneProps {
  invalidateRef: MutableRefObject<() => void>;
  reducedMotion: boolean;
  rotationRef: MutableRefObject<number>;
  onReady: () => void;
  onUnavailable: () => void;
}

function ContextGuard({ onUnavailable }: Pick<HeroLaptopSceneProps, "onUnavailable">) {
  const { gl } = useThree();

  useEffect(() => {
    const canvas = gl.domElement;
    const handleContextLoss = (event: Event) => {
      event.preventDefault();
      onUnavailable();
    };

    canvas.addEventListener("webglcontextlost", handleContextLoss);
    return () => canvas.removeEventListener("webglcontextlost", handleContextLoss);
  }, [gl, onUnavailable]);

  return null;
}

function createKeyboardTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 480;
  const context = canvas.getContext("2d");

  if (!context) return null;

  context.fillStyle = "#17191c";
  context.fillRect(0, 0, canvas.width, canvas.height);

  const columns = 14;
  const rows = 5;
  const gap = 10;
  const keyWidth = (canvas.width - gap * (columns + 1)) / columns;
  const keyHeight = (canvas.height - gap * (rows + 1)) / rows;

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const x = gap + column * (keyWidth + gap);
      const y = gap + row * (keyHeight + gap);
      context.fillStyle = row === 0 ? "#30343a" : "#26292e";
      context.beginPath();
      context.roundRect(x, y, keyWidth, keyHeight, 7);
      context.fill();
      context.strokeStyle = "rgba(255,255,255,.12)";
      context.lineWidth = 2;
      context.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function LaptopModel({
  onReady,
  reducedMotion,
  rotationRef,
}: Omit<HeroLaptopSceneProps, "invalidateRef" | "onUnavailable">) {
  const groupRef = useRef<THREE.Group>(null);
  const initialRotation = HERO_LAPTOP_DEFAULT_ROTATION + (reducedMotion ? 0 : 0.24);
  const currentRotationRef = useRef(initialRotation);
  const hasRenderedRef = useRef(false);
  const keyboardTexture = useMemo(() => createKeyboardTexture(), []);
  const loadedLogoTexture = useLoader(THREE.TextureLoader, "/assets/logo-white-full.svg");
  const logoTexture = useMemo(() => {
    const texture = loadedLogoTexture.clone();
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  }, [loadedLogoTexture]);
  const { invalidate, size } = useThree();
  const scale = size.width < 520 ? 0.82 : size.width < 880 ? 0.9 : 0.96;

  useEffect(() => {
    invalidate();
    return () => {
      keyboardTexture?.dispose();
      logoTexture.dispose();
    };
  }, [invalidate, keyboardTexture, logoTexture]);

  function handleAfterRender() {
    if (hasRenderedRef.current) return;
    hasRenderedRef.current = true;
    queueMicrotask(onReady);
  }

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const nextRotation = THREE.MathUtils.damp(
      currentRotationRef.current,
      rotationRef.current,
      reducedMotion ? 16 : 7,
      delta,
    );
    currentRotationRef.current = nextRotation;
    group.rotation.y = nextRotation;

    if (Math.abs(nextRotation - rotationRef.current) > 0.001) invalidate();
  });

  return (
    <group ref={groupRef} position={[0, -0.68, 0.05]} rotation={[0.035, initialRotation, 0]} scale={scale}>
      <mesh onAfterRender={handleAfterRender} position={[0, -0.03, 0.08]}>
        <boxGeometry args={[3.62, 0.16, 2.38]} />
        <meshStandardMaterial color="#8f939a" metalness={0.76} roughness={0.28} />
      </mesh>
      <mesh position={[0, 0.064, 0.04]}>
        <boxGeometry args={[3.52, 0.035, 2.27]} />
        <meshStandardMaterial color="#a5a8ad" metalness={0.82} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.086, -0.23]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.02, 1.22]} />
        <meshStandardMaterial color="#1a1c20" map={keyboardTexture ?? undefined} roughness={0.72} />
      </mesh>
      <mesh position={[0, 0.089, 0.68]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.28, 0.56]} />
        <meshStandardMaterial color="#858990" metalness={0.7} roughness={0.38} />
      </mesh>
      <mesh position={[0, 0.1, -1.04]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.105, 0.105, 3.18, 28]} />
        <meshStandardMaterial color="#303338" metalness={0.9} roughness={0.24} />
      </mesh>

      <group position={[0, 1.18, -1.14]} rotation={[-0.11, 0, 0]}>
        <mesh>
          <boxGeometry args={[3.62, 2.28, 0.1]} />
          <meshStandardMaterial color="#292b2f" metalness={0.82} roughness={0.25} />
        </mesh>
        <mesh position={[0, 0, 0.057]}>
          <planeGeometry args={[3.36, 2.03]} />
          <meshBasicMaterial color="#0d0e10" />
        </mesh>
        <mesh position={[0, 0.02, 0.071]}>
          <planeGeometry args={[2.18, 0.48]} />
          <meshBasicMaterial depthWrite={false} map={logoTexture} transparent toneMapped={false} />
        </mesh>
        <mesh position={[0, -0.92, 0.066]}>
          <circleGeometry args={[0.018, 20]} />
          <meshBasicMaterial color="#30343a" />
        </mesh>
      </group>
    </group>
  );
}

export function HeroLaptopScene({
  invalidateRef,
  onReady,
  onUnavailable,
  reducedMotion,
  rotationRef,
}: HeroLaptopSceneProps) {
  return (
    <Canvas
      aria-hidden="true"
      camera={{ fov: 34, near: 0.1, far: 40, position: [0, 2.25, 7.5] }}
      className="hero-laptop__canvas"
      dpr={[1, 1.5]}
      frameloop="demand"
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      onCreated={({ camera, gl, invalidate }) => {
        camera.lookAt(0, 0.35, 0);
        gl.setClearColor(0x000000, 0);
        invalidateRef.current = invalidate;
        invalidate();
      }}
    >
      <ContextGuard onUnavailable={onUnavailable} />
      <ambientLight intensity={2.1} />
      <directionalLight color="#fff8ec" intensity={3.8} position={[4, 6, 5]} />
      <directionalLight color="#8f9ab4" intensity={1.7} position={[-4, 2, 3]} />
      <pointLight color="#e5342f" intensity={8} position={[-3, 0.5, 1.5]} distance={7} />
      <mesh position={[0, -0.73, 0.25]} rotation={[-Math.PI / 2, 0, 0]} scale={[2.35, 0.82, 1]}>
        <circleGeometry args={[1, 64]} />
        <meshBasicMaterial color="#000000" depthWrite={false} opacity={0.2} transparent />
      </mesh>
      <LaptopModel onReady={onReady} reducedMotion={reducedMotion} rotationRef={rotationRef} />
    </Canvas>
  );
}
