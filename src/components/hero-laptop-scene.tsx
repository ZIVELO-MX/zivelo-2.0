"use client";

import { useEffect, useRef } from "react";
import type { ZiveloLaptopApi } from "@/lib/3d/zivelo-laptop";

interface HeroLaptopSceneProps {
  onReady: (api: ZiveloLaptopApi) => void;
  onUnavailable: () => void;
  onOpenChange: (open: boolean) => void;
}

const SCREEN_LOGO_URL = "/assets/zivelo-bars-dark-full.png";
const LID_MARK_URL = "/assets/zivelo-wordmark-dark-compact.svg";

export function HeroLaptopScene({
  onOpenChange,
  onReady,
  onUnavailable,
}: HeroLaptopSceneProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<ZiveloLaptopApi | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const syncOpenStateRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let disposed = false;

    const mount = async () => {
      try {
        const [THREE, { OrbitControls }, { createZiveloLaptop }] = await Promise.all([
          import("three"),
          import("three/addons/controls/OrbitControls.js"),
          import("@/lib/3d/zivelo-laptop"),
        ]);

        if (disposed) return;

        const api = createZiveloLaptop({
          THREE,
          OrbitControls,
          container: host,
          screenLogoUrl: SCREEN_LOGO_URL,
          lidMarkUrl: LID_MARK_URL,
          background: null,
          autoRotate: true,
          openAngle: 110,
          cameraAzimuth: 38,
          cameraElevation: 22,
          fitScale: 1.18,
        });

        if (disposed) {
          api.dispose();
          return;
        }

        apiRef.current = api;
        const canvas = api.renderer.domElement;
        canvasRef.current = canvas;
        canvas.setAttribute("aria-hidden", "true");

        const syncOpenState = () => {
          queueMicrotask(() => onOpenChange(api.isOpen));
        };
        syncOpenStateRef.current = syncOpenState;
        canvas.addEventListener("pointerup", syncOpenState);
        onReady(api);
      } catch {
        if (!disposed) onUnavailable();
      }
    };

    void mount();

    return () => {
      disposed = true;
      const api = apiRef.current;
      const canvas = canvasRef.current;

      if (api && canvas) {
        if (syncOpenStateRef.current) {
          canvas.removeEventListener("pointerup", syncOpenStateRef.current);
        }
        api.dispose();
      }

      apiRef.current = null;
      canvasRef.current = null;
      syncOpenStateRef.current = null;
    };
  }, [onOpenChange, onReady, onUnavailable]);

  return <div aria-hidden="true" className="hero-laptop__scene" ref={hostRef} />;
}
