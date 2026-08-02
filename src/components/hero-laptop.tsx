"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import {
  Component,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type MutableRefObject,
  type PointerEvent,
  type ReactNode,
} from "react";
import {
  HERO_LAPTOP_DEFAULT_ROTATION,
  laptopRotationFromDrag,
  laptopRotationFromKey,
  laptopRotationToDegrees,
} from "@/lib/hero-laptop-rotation";

interface HeroLaptopSceneProps {
  invalidateRef: MutableRefObject<() => void>;
  reducedMotion: boolean;
  rotationRef: MutableRefObject<number>;
  onReady: () => void;
  onUnavailable: () => void;
}

const HeroLaptopScene = dynamic<HeroLaptopSceneProps>(
  () => import("./hero-laptop-scene").then((module) => module.HeroLaptopScene),
  { loading: () => null, ssr: false },
);

class SceneBoundary extends Component<
  { children: ReactNode; onError: () => void },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);

    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return reducedMotion;
}

interface HeroLaptopProps {
  label: string;
  hint: string;
}

export function HeroLaptop({ label, hint }: HeroLaptopProps) {
  const hintId = useId();
  const reducedMotion = useReducedMotion();
  const [sceneReady, setSceneReady] = useState(false);
  const fallbackModelRef = useRef<HTMLDivElement>(null);
  const rotationRef = useRef(HERO_LAPTOP_DEFAULT_ROTATION);
  const invalidateRef = useRef<() => void>(() => undefined);
  const dragRef = useRef<{ pointerId: number; startX: number; startRotation: number } | null>(null);
  const handleSceneReady = useCallback(() => setSceneReady(true), []);
  const handleSceneUnavailable = useCallback(() => setSceneReady(false), []);

  function applyRotation(nextRotation: number) {
    rotationRef.current = nextRotation;
    fallbackModelRef.current?.style.setProperty(
      "--hero-laptop-rotation",
      `${laptopRotationToDegrees(nextRotation)}deg`,
    );
    invalidateRef.current();
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;

    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startRotation: rotationRef.current,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    applyRotation(laptopRotationFromDrag(drag.startRotation, event.clientX - drag.startX));
  }

  function finishPointerInteraction(event: PointerEvent<HTMLDivElement>) {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    dragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const nextRotation = laptopRotationFromKey(rotationRef.current, event.key);
    if (nextRotation === rotationRef.current) return;

    event.preventDefault();
    applyRotation(nextRotation);
  }

  return (
    <div className="hero-laptop-shell">
      <div
        aria-describedby={hintId}
        aria-label={label}
        className="hero-laptop"
        data-ready={sceneReady ? "true" : "false"}
        data-testid="hero-laptop"
        onKeyDown={handleKeyDown}
        onLostPointerCapture={() => { dragRef.current = null; }}
        onPointerCancel={finishPointerInteraction}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishPointerInteraction}
        role="group"
        tabIndex={0}
      >
        <div className="hero-laptop__fallback-stage" aria-hidden="true">
          <div
            className="hero-laptop__fallback-model"
            ref={fallbackModelRef}
            style={{
              "--hero-laptop-rotation": `${laptopRotationToDegrees(HERO_LAPTOP_DEFAULT_ROTATION)}deg`,
            } as CSSProperties}
          >
            <div className="hero-laptop__fallback-lid">
              <div className="hero-laptop__fallback-screen">
                <Image
                  alt=""
                  height={119}
                  priority
                  src="/assets/logo-white-compact.svg"
                  width={163}
                />
              </div>
            </div>
            <div className="hero-laptop__fallback-hinge" />
            <div className="hero-laptop__fallback-base">
              <div className="hero-laptop__fallback-keyboard" />
              <div className="hero-laptop__fallback-trackpad" />
            </div>
          </div>
        </div>
        <SceneBoundary onError={handleSceneUnavailable}>
          <HeroLaptopScene
            invalidateRef={invalidateRef}
            onReady={handleSceneReady}
            onUnavailable={handleSceneUnavailable}
            reducedMotion={reducedMotion}
            rotationRef={rotationRef}
          />
        </SceneBoundary>
      </div>
      <p className="hero-laptop__hint" id={hintId}>
        <span aria-hidden="true">↔</span> {hint}
      </p>
    </div>
  );
}
