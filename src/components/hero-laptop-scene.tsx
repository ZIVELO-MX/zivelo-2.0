"use client";

import { useEffect, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { SVGRenderer } from "three/examples/jsm/renderers/SVGRenderer.js";
import { HERO_LAPTOP_DEFAULT_ROTATION } from "@/lib/hero-laptop-rotation";

interface HeroLaptopSceneProps {
  invalidateRef: MutableRefObject<() => void>;
  reducedMotion: boolean;
  rotationRef: MutableRefObject<number>;
  onReady: () => void;
  onUnavailable: () => void;
}

const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
const KEYBOARD_ROWS = [14, 14, 13, 13, 12, 9];

function createLaptopModel() {
  const model = new THREE.Group();
  model.name = "zivelo-laptop";

  const aluminium = new THREE.MeshLambertMaterial({ color: "#454a52" });
  const aluminiumLight = new THREE.MeshLambertMaterial({ color: "#737982" });
  const edge = new THREE.MeshLambertMaterial({ color: "#24282e" });
  const keyMaterial = new THREE.MeshLambertMaterial({ color: "#0d0f12" });
  const screenMaterial = new THREE.MeshBasicMaterial({ color: "#050608" });
  const cameraMaterial = new THREE.MeshBasicMaterial({ color: "#272a30" });

  const base = new THREE.Mesh(new RoundedBoxGeometry(4.62, 0.105, 3.04, 6, 0.065), aluminium);
  base.position.set(0, -0.2, 0.38);
  base.renderOrder = 0;
  model.add(base);

  const deck = new THREE.Mesh(new RoundedBoxGeometry(4.48, 0.035, 2.9, 4, 0.045), aluminiumLight);
  deck.position.set(0, -0.112, 0.36);
  deck.renderOrder = 1;
  model.add(deck);

  const frontEdge = new THREE.Mesh(new RoundedBoxGeometry(4.18, 0.035, 0.07, 3, 0.025), edge);
  frontEdge.position.set(0, -0.222, 1.89);
  frontEdge.renderOrder = 2;
  model.add(frontEdge);

  const hinge = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 3.76, 24), edge);
  hinge.position.set(0, -0.05, -1.06);
  hinge.rotation.z = Math.PI / 2;
  hinge.renderOrder = 2;
  model.add(hinge);

  const keyGeometry = new THREE.BoxGeometry(0.245, 0.036, 0.245);
  const keyboard = new THREE.Group();
  keyboard.name = "keyboard";
  KEYBOARD_ROWS.forEach((keyCount, row) => {
    const gap = 0.034;
    const rowWidth = keyCount * 0.245 + (keyCount - 1) * gap;
    const offset = row === 5 ? 0.27 : 0;

    for (let column = 0; column < keyCount; column += 1) {
      const key = new THREE.Mesh(keyGeometry, keyMaterial);
      key.position.set(-rowWidth / 2 + 0.1225 + column * (0.245 + gap) + offset, 0, row * 0.284);
      key.renderOrder = 3;
      keyboard.add(key);
    }
  });
  keyboard.position.set(0, -0.068, -0.68);
  model.add(keyboard);

  const spacebar = new THREE.Mesh(new RoundedBoxGeometry(1.48, 0.045, 0.245, 2, 0.035), keyMaterial);
  spacebar.position.set(0, -0.068, 0.74);
  spacebar.renderOrder = 3;
  model.add(spacebar);

  const trackpad = new THREE.Mesh(new RoundedBoxGeometry(1.56, 0.025, 0.75, 3, 0.045), aluminiumLight);
  trackpad.position.set(0, -0.072, 1.28);
  trackpad.renderOrder = 3;
  model.add(trackpad);

  const speakerGeometry = new THREE.CylinderGeometry(0.018, 0.018, 0.012, 8);
  for (const side of [-1, 1]) {
    for (let row = 0; row < 9; row += 1) {
      for (let column = 0; column < 3; column += 1) {
        const speaker = new THREE.Mesh(speakerGeometry, keyMaterial);
        speaker.position.set(side * (1.79 + column * 0.105), -0.071, -0.4 + row * 0.18);
        speaker.renderOrder = 3;
        model.add(speaker);
      }
    }
  }

  const lid = new THREE.Group();
  lid.name = "display";
  lid.position.set(0, -0.03, -1.08);
  lid.rotation.x = -0.105;

  const lidBack = new THREE.Mesh(new RoundedBoxGeometry(4.34, 2.68, 0.105, 6, 0.08), aluminium);
  lidBack.position.set(0, 1.32, 0);
  lidBack.renderOrder = 0;
  lid.add(lidBack);

  const bezel = new THREE.Mesh(new RoundedBoxGeometry(4.16, 2.5, 0.035, 5, 0.055), edge);
  bezel.position.set(0, 1.32, 0.064);
  bezel.renderOrder = 4;
  lid.add(bezel);

  const screen = new THREE.Mesh(new RoundedBoxGeometry(4.02, 2.34, 0.018, 4, 0.035), screenMaterial);
  screen.position.set(0, 1.3, 0.088);
  screen.renderOrder = 5;
  lid.add(screen);

  const camera = new THREE.Mesh(new THREE.CircleGeometry(0.022, 18), cameraMaterial);
  camera.position.set(0, 2.54, 0.102);
  camera.renderOrder = 6;
  lid.add(camera);

  const logoAnchor = new THREE.Object3D();
  logoAnchor.name = "logo-center";
  logoAnchor.position.set(0, 1.3, 0.11);
  lid.add(logoAnchor);

  const logoRight = new THREE.Object3D();
  logoRight.name = "logo-right";
  logoRight.position.set(0.46, 1.3, 0.11);
  lid.add(logoRight);

  const logoUp = new THREE.Object3D();
  logoUp.name = "logo-up";
  logoUp.position.set(0, 1.635, 0.11);
  lid.add(logoUp);

  model.add(lid);

  return {
    disposable: [aluminium, aluminiumLight, cameraMaterial, edge, keyGeometry, keyMaterial, screenMaterial],
    logoAnchor,
    logoRight,
    logoUp,
    model,
  };
}

function appendProjectedLogo(
  svg: SVGElement,
  camera: THREE.Camera,
  width: number,
  height: number,
  centerAnchor: THREE.Object3D,
  rightAnchor: THREE.Object3D,
  upAnchor: THREE.Object3D,
) {
  const project = (anchor: THREE.Object3D) => {
    const point = anchor.getWorldPosition(new THREE.Vector3()).project(camera);
    return new THREE.Vector2(point.x * width * 0.5, -point.y * height * 0.5);
  };
  const center = project(centerAnchor);
  const right = project(rightAnchor);
  const up = project(upAnchor);
  const logoWidth = center.distanceTo(right) * 2;
  const logoHeight = center.distanceTo(up) * 2;
  const rotation = THREE.MathUtils.radToDeg(Math.atan2(right.y - center.y, right.x - center.x));
  const image = document.createElementNS(SVG_NAMESPACE, "image");

  image.setAttribute("href", "/assets/logo-white-compact.svg");
  image.setAttribute("width", logoWidth.toFixed(2));
  image.setAttribute("height", logoHeight.toFixed(2));
  image.setAttribute("x", (-logoWidth / 2).toFixed(2));
  image.setAttribute("y", (-logoHeight / 2).toFixed(2));
  image.setAttribute("preserveAspectRatio", "xMidYMid meet");
  image.setAttribute("transform", `translate(${center.x.toFixed(2)} ${center.y.toFixed(2)}) rotate(${rotation.toFixed(2)})`);
  image.setAttribute("class", "hero-laptop__vector-logo");
  svg.append(image);
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

    let animationFrame = 0;
    let currentRotation = HERO_LAPTOP_DEFAULT_ROTATION + (reducedMotion ? 0 : 0.18);

    try {
      const renderer = new SVGRenderer();
      renderer.setQuality("high");
      renderer.overdraw = 0.8;
      renderer.domElement.setAttribute("aria-hidden", "true");
      renderer.domElement.setAttribute("focusable", "false");
      renderer.domElement.classList.add("hero-laptop__vector");
      host.replaceChildren(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 40);
      camera.position.set(0, 2.3, 8.85);
      camera.lookAt(0, 0.48, 0.18);

      scene.add(new THREE.AmbientLight("#ffffff", 0.62));
      const keyLight = new THREE.DirectionalLight("#fffaf2", 0.58);
      keyLight.position.set(4, 6, 5);
      scene.add(keyLight);
      const rimLight = new THREE.DirectionalLight("#b8c3d6", 0.24);
      rimLight.position.set(-4, 2, 3);
      scene.add(rimLight);

      const { disposable, logoAnchor, logoRight, logoUp, model } = createLaptopModel();
      scene.add(model);

      const render = () => {
        animationFrame = 0;
        currentRotation = reducedMotion
          ? rotationRef.current
          : THREE.MathUtils.lerp(currentRotation, rotationRef.current, 0.16);
        model.rotation.y = currentRotation;
        model.rotation.x = 0.015;
        model.updateMatrixWorld(true);
        renderer.render(scene, camera);
        renderer.domElement.style.backgroundColor = "transparent";
        appendProjectedLogo(renderer.domElement, camera, host.clientWidth, host.clientHeight, logoAnchor, logoRight, logoUp);

        if (Math.abs(currentRotation - rotationRef.current) > 0.001) {
          animationFrame = requestAnimationFrame(render);
        }
      };

      const requestRender = () => {
        if (!animationFrame) animationFrame = requestAnimationFrame(render);
      };

      const resize = () => {
        const width = Math.max(host.clientWidth, 1);
        const height = Math.max(host.clientHeight, 1);
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        requestRender();
      };

      const observer = new ResizeObserver(resize);
      observer.observe(host);
      invalidateRef.current = requestRender;
      resize();
      queueMicrotask(onReady);

      return () => {
        cancelAnimationFrame(animationFrame);
        observer.disconnect();
        invalidateRef.current = () => undefined;
        scene.traverse((object) => {
          if (object instanceof THREE.Mesh) object.geometry.dispose();
        });
        disposable.forEach((resource) => resource.dispose());
        host.replaceChildren();
      };
    } catch {
      onUnavailable();
      return;
    }
  }, [invalidateRef, onReady, onUnavailable, reducedMotion, rotationRef]);

  return <div className="hero-laptop__vector-host" ref={hostRef} />;
}
