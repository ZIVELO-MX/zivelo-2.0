"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { Component, useCallback, useEffect, useState, type ReactNode } from "react";

interface HeroLaptopSceneProps {
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

export function HeroLaptop() {
  const isDesktop = useDesktopScene();
  const [sceneReady, setSceneReady] = useState(false);

  const handleSceneReady = useCallback(() => setSceneReady(true), []);

  const handleSceneUnavailable = useCallback(() => setSceneReady(false), []);

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
              onReady={handleSceneReady}
              onUnavailable={handleSceneUnavailable}
            />
          </SceneBoundary>
        ) : null}
      </div>
    </div>
  );
}
