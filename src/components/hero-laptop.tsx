"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { Component, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type { ZiveloLaptopApi } from "@/lib/3d/zivelo-laptop";

interface HeroLaptopSceneProps {
  onReady: (api: ZiveloLaptopApi) => void;
  onUnavailable: () => void;
  onOpenChange: (open: boolean) => void;
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

function useDesktopScene() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(media.matches);

    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return isDesktop;
}

interface HeroLaptopProps {
  hint: string;
  toggleLabel: string;
}

export function HeroLaptop({ hint, toggleLabel }: HeroLaptopProps) {
  const isDesktop = useDesktopScene();
  const apiRef = useRef<ZiveloLaptopApi | null>(null);
  const [sceneReady, setSceneReady] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  const handleSceneReady = useCallback((api: ZiveloLaptopApi) => {
    apiRef.current = api;
    setIsOpen(api.isOpen);
    setSceneReady(true);
  }, []);

  const handleSceneUnavailable = useCallback(() => {
    apiRef.current = null;
    setSceneReady(false);
  }, []);

  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
  }, []);

  const handleToggle = useCallback(() => {
    const api = apiRef.current;
    if (!api) return;

    api.toggle();
    setIsOpen(api.isOpen);
  }, []);

  return (
    <div className="hero-laptop-shell">
      <div
        className="hero-laptop"
        data-ready={sceneReady ? "true" : "false"}
        data-testid="hero-laptop"
      >
        <Image
          alt=""
          className="hero-laptop__fallback"
          data-testid="hero-laptop-fallback"
          fill
          priority
          sizes="(max-width: 900px) 100vw, 54vw"
          src="/assets/hero-laptop-static.webp"
        />
        {isDesktop ? (
          <SceneBoundary onError={handleSceneUnavailable}>
            <HeroLaptopScene
              onOpenChange={handleOpenChange}
              onReady={handleSceneReady}
              onUnavailable={handleSceneUnavailable}
            />
          </SceneBoundary>
        ) : null}
      </div>
      {isDesktop ? (
        <div className="hero-laptop__controls">
          <button
            aria-pressed={isOpen}
            className="btn btn--ghost hero-laptop__toggle"
            disabled={!sceneReady}
            onClick={handleToggle}
            type="button"
          >
            {toggleLabel}
          </button>
          <p className="hero-laptop__hint">{hint}</p>
        </div>
      ) : null}
    </div>
  );
}
