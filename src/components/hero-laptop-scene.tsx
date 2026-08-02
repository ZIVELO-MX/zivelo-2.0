"use client";

import { useEffect, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { HERO_LAPTOP_DEFAULT_ROTATION } from "@/lib/hero-laptop-rotation";

interface HeroLaptopSceneProps {
  invalidateRef: MutableRefObject<() => void>;
  reducedMotion: boolean;
  rotationRef: MutableRefObject<number>;
  onReady: () => void;
  onUnavailable: () => void;
}

const LOGO_SRC = "/assets/logo-white-compact.svg";
const SCREEN_W = 4.05;
const SCREEN_H = 2.5;

// Screen face: near-black display with the ZIVELO mark baked in, so the logo
// lives *inside* the screen plane and perspective-corrects when rotated
// (instead of being a flat 2D overlay pasted on top).
function createScreenTexture(maxAnisotropy: number, requestRender: () => void) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = Math.round((1024 * SCREEN_H) / SCREEN_W);
  const ctx = canvas.getContext("2d");

  const paint = (image?: HTMLImageElement) => {
    if (!ctx) return;
    ctx.fillStyle = "#05070a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (image) {
      const targetW = canvas.width * 0.32;
      const scale = targetW / image.width;
      const w = image.width * scale;
      const h = image.height * scale;
      ctx.drawImage(image, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
    }
  };
  paint();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAnisotropy;

  const image = new Image();
  image.decoding = "async";
  image.onload = () => {
    paint(image);
    texture.needsUpdate = true;
    requestRender();
  };
  image.src = LOGO_SRC;

  return texture;
}

// Soft elliptical contact shadow — a radial-gradient sprite laid flat under the
// chassis so the laptop reads as grounded, not floating.
function createShadowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const gradient = ctx.createRadialGradient(128, 128, 10, 128, 128, 124);
    gradient.addColorStop(0, "rgba(0,0,0,0.55)");
    gradient.addColorStop(0.55, "rgba(0,0,0,0.28)");
    gradient.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createLaptop(maxAnisotropy: number, requestRender: () => void) {
  const model = new THREE.Group();
  model.name = "zivelo-laptop";

  // Materials — physically based so graphite anodised aluminium reads as metal.
  const chassis = new THREE.MeshPhysicalMaterial({
    color: 0x26292e,
    metalness: 0.86,
    roughness: 0.44,
    envMapIntensity: 0.95,
  });
  const well = new THREE.MeshPhysicalMaterial({
    color: 0x101216,
    metalness: 0.3,
    roughness: 0.72,
    envMapIntensity: 0.5,
  });
  const keycap = new THREE.MeshPhysicalMaterial({
    color: 0x14171c,
    metalness: 0.1,
    roughness: 0.62,
    envMapIntensity: 0.4,
  });
  const glass = new THREE.MeshPhysicalMaterial({
    color: 0x1c2026,
    metalness: 0.2,
    roughness: 0.18,
    clearcoat: 0.9,
    clearcoatRoughness: 0.2,
    envMapIntensity: 1.1,
  });
  const bezelMat = new THREE.MeshPhysicalMaterial({
    color: 0x0a0c0f,
    metalness: 0.25,
    roughness: 0.6,
    envMapIntensity: 0.5,
  });
  const screenMat = new THREE.MeshBasicMaterial();
  const darkMetal = new THREE.MeshPhysicalMaterial({
    color: 0x15181c,
    metalness: 0.75,
    roughness: 0.5,
    envMapIntensity: 0.7,
  });

  const geometries: THREE.BufferGeometry[] = [];
  const track = <T extends THREE.BufferGeometry>(geo: T) => {
    geometries.push(geo);
    return geo;
  };

  // --- Base chassis (thin) ---
  const baseGeo = track(new RoundedBoxGeometry(4.62, 0.16, 3.16, 6, 0.07));
  const base = new THREE.Mesh(baseGeo, chassis);
  base.position.y = 0;
  model.add(base);

  const baseTop = 0.08;

  // Dark keyboard deck: an inlaid panel that sits ON the chassis. Every top
  // element's bottom stays at/above baseTop so nothing intersects the base
  // body (interpenetration is what causes z-fighting flicker on rotation).
  const kbWell = new THREE.Mesh(
    track(new RoundedBoxGeometry(3.62, 0.014, 1.62, 3, 0.006)),
    well,
  );
  kbWell.position.set(0, baseTop + 0.007, -0.55);
  model.add(kbWell);

  // --- Keycaps as one InstancedMesh: clean, aligned, cheap ---
  const cols = 14;
  const rows = 6;
  const pitch = 0.235;
  const gridW = cols * pitch;
  const startX = -gridW / 2 + pitch / 2;
  const startZ = -0.55 - (rows * pitch) / 2 + pitch / 2;
  const keyY = baseTop + 0.039; // rests on the keyboard deck, no interpenetration
  const spaceCols = new Set([4, 5, 6, 7, 8, 9]); // frontmost row middle -> spacebar

  const placements: THREE.Vector3[] = [];
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      if (r === rows - 1 && spaceCols.has(c)) continue;
      placements.push(new THREE.Vector3(startX + c * pitch, keyY, startZ + r * pitch));
    }
  }
  const keyGeo = track(new RoundedBoxGeometry(0.2, 0.05, 0.2, 2, 0.018));
  const keys = new THREE.InstancedMesh(keyGeo, keycap, placements.length);
  const dummy = new THREE.Object3D();
  placements.forEach((p, i) => {
    dummy.position.copy(p);
    dummy.updateMatrix();
    keys.setMatrixAt(i, dummy.matrix);
  });
  keys.instanceMatrix.needsUpdate = true;
  model.add(keys);

  // Spacebar
  const spacebar = new THREE.Mesh(
    track(new RoundedBoxGeometry(6 * pitch - 0.04, 0.05, 0.2, 2, 0.018)),
    keycap,
  );
  spacebar.position.set(0, keyY, startZ + (rows - 1) * pitch);
  model.add(spacebar);

  // --- Trackpad (glass, front-centre) ---
  const trackpad = new THREE.Mesh(
    track(new RoundedBoxGeometry(1.7, 0.014, 1.02, 3, 0.006)),
    glass,
  );
  trackpad.position.set(0, baseTop + 0.009, 0.98);
  model.add(trackpad);

  // --- Two subtle speaker grille strips flanking the keyboard ---
  for (const side of [-1, 1]) {
    const grille = new THREE.Mesh(
      track(new RoundedBoxGeometry(0.42, 0.012, 1.5, 2, 0.005)),
      well,
    );
    grille.position.set(side * 2.02, baseTop + 0.006, -0.55);
    model.add(grille);
  }

  // --- Hinge ---
  const hinge = new THREE.Mesh(
    track(new THREE.CylinderGeometry(0.07, 0.07, 4.0, 28)),
    darkMetal,
  );
  hinge.rotation.z = Math.PI / 2;
  hinge.position.set(0, baseTop + 0.02, -1.5);
  model.add(hinge);

  // --- Lid (built standing up, reclined slightly) ---
  const lid = new THREE.Group();
  lid.name = "display";
  lid.position.set(0, baseTop + 0.02, -1.5);
  lid.rotation.x = -0.12;

  const lidH = 2.86;
  const lidCenterY = lidH / 2 + 0.02;

  const lidBack = new THREE.Mesh(
    track(new RoundedBoxGeometry(4.5, lidH, 0.14, 6, 0.06)),
    chassis,
  );
  lidBack.position.set(0, lidCenterY, 0);
  lid.add(lidBack);

  // Bezel sits in front of the lid back; screen and notch sit in front of the
  // bezel with ~3mm gaps, so no two lid faces are coplanar (avoids z-fighting).
  const bezel = new THREE.Mesh(
    track(new RoundedBoxGeometry(4.34, lidH - 0.16, 0.03, 4, 0.012)),
    bezelMat,
  );
  bezel.position.set(0, lidCenterY, 0.088);
  lid.add(bezel);

  const screenTexture = createScreenTexture(maxAnisotropy, requestRender);
  screenMat.map = screenTexture;
  const screen = new THREE.Mesh(
    track(new RoundedBoxGeometry(SCREEN_W, SCREEN_H, 0.012, 2, 0.005)),
    screenMat,
  );
  screen.position.set(0, lidCenterY, 0.112);
  lid.add(screen);

  // Camera notch — a small dark pill in front of the bezel, not a floating dot.
  const notch = new THREE.Mesh(
    track(new RoundedBoxGeometry(0.24, 0.05, 0.01, 2, 0.004)),
    well,
  );
  notch.position.set(0, lidH - 0.02, 0.112);
  lid.add(notch);

  model.add(lid);

  const materials = [
    chassis,
    well,
    keycap,
    glass,
    bezelMat,
    screenMat,
    darkMetal,
  ];

  return { model, geometries, materials, screenTexture };
}

function isLightTheme() {
  return document.documentElement.getAttribute("data-theme") === "light";
}

export function HeroLaptopScene({
  invalidateRef,
  onReady,
  onUnavailable,
  reducedMotion,
  rotationRef,
}: HeroLaptopSceneProps) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      if (!renderer.getContext()) throw new Error("no webgl context");
    } catch {
      onUnavailable();
      return;
    }

    let animationFrame = 0;
    let ready = false;
    let currentRotation =
      HERO_LAPTOP_DEFAULT_ROTATION + (reducedMotion ? 0 : 0.16);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.classList.add("hero-laptop__vector");
    renderer.domElement.setAttribute("aria-hidden", "true");
    host.replaceChildren(renderer.domElement);

    const scene = new THREE.Scene();

    const pmrem = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTexture = pmrem.fromScene(roomEnv, 0.04).texture;
    scene.environment = envTexture;
    roomEnv.dispose?.();

    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 60);
    camera.position.set(0, 2.55, 9.3);
    camera.lookAt(0, 0.5, -0.1);

    // Contained lighting — the environment map does the reflective heavy
    // lifting; these add gentle shape and a cool rim.
    const ambient = new THREE.AmbientLight(0xffffff, 0.35);
    scene.add(ambient);
    const key = new THREE.DirectionalLight(0xfff6ec, 1.15);
    key.position.set(4.5, 7, 6);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xaebdd6, 0.5);
    rim.position.set(-5, 3, -3);
    scene.add(rim);

    const requestRender = () => {
      if (!animationFrame) animationFrame = requestAnimationFrame(render);
    };

    const { model, geometries, materials, screenTexture } = createLaptop(
      renderer.capabilities.getMaxAnisotropy(),
      requestRender,
    );
    model.rotation.x = 0.02;
    scene.add(model);

    // Grounded soft shadow.
    const shadowTexture = createShadowTexture();
    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(6.6, 4.6),
      new THREE.MeshBasicMaterial({
        map: shadowTexture,
        transparent: true,
        depthWrite: false,
        opacity: 0.9,
      }),
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.set(0, -0.12, 0.55);
    scene.add(shadow);

    const applyTheme = () => {
      const light = isLightTheme();
      renderer.toneMappingExposure = light ? 1.16 : 0.98;
      ambient.intensity = light ? 0.5 : 0.35;
      (shadow.material as THREE.MeshBasicMaterial).opacity = light ? 0.55 : 0.9;
      requestRender();
    };
    applyTheme();

    function render() {
      animationFrame = 0;
      const target = rotationRef.current;
      currentRotation = reducedMotion
        ? target
        : THREE.MathUtils.lerp(currentRotation, target, 0.14);
      model.rotation.y = currentRotation;
      model.updateMatrixWorld(true);
      renderer.render(scene, camera);

      if (!ready) {
        ready = true;
        onReady();
      }
      if (!reducedMotion && Math.abs(currentRotation - target) > 0.0004) {
        animationFrame = requestAnimationFrame(render);
      }
    }

    const resize = () => {
      const width = Math.max(host.clientWidth, 1);
      const height = Math.max(host.clientHeight, 1);
      renderer.setSize(width, height, false);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      requestRender();
    };

    const observer = new ResizeObserver(resize);
    observer.observe(host);

    const themeObserver = new MutationObserver(applyTheme);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    invalidateRef.current = requestRender;
    resize();

    return () => {
      cancelAnimationFrame(animationFrame);
      observer.disconnect();
      themeObserver.disconnect();
      invalidateRef.current = () => undefined;
      geometries.forEach((geo) => geo.dispose());
      materials.forEach((material) => material.dispose());
      screenTexture.dispose();
      shadowTexture.dispose();
      shadow.geometry.dispose();
      (shadow.material as THREE.Material).dispose();
      envTexture.dispose();
      pmrem.dispose();
      renderer.dispose();
      host.replaceChildren();
    };
  }, [invalidateRef, onReady, onUnavailable, reducedMotion, rotationRef]);

  return <div className="hero-laptop__vector-host" ref={hostRef} />;
}
