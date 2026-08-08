import type * as THREE from "three";
import type { OrbitControls } from "three/addons/controls/OrbitControls.js";

export interface ZiveloLaptopOptions {
  THREE: typeof THREE;
  OrbitControls?: typeof OrbitControls | null;
  container: HTMLElement;
  screenLogoUrl?: string;
  lidMarkUrl?: string;
  background?: string | null;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  interactive?: boolean;
  userOrbit?: boolean;
  closeOnClick?: boolean;
  openAngle?: number;
  startOpen?: boolean;
  cameraAzimuth?: number;
  cameraElevation?: number;
  fitScale?: number;
  pauseWhenOffscreen?: boolean;
  maxPixelRatio?: number;
}

export interface ZiveloLaptopApi {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls | null;
  object: THREE.Group;
  lid: THREE.Group;
  readonly isOpen: boolean;
  setOpen(open: boolean): ZiveloLaptopApi;
  toggle(): ZiveloLaptopApi;
  setAutoRotate(on: boolean): ZiveloLaptopApi;
  reframe(): ZiveloLaptopApi;
  requestRender(): void;
  dispose(): void;
}

export function createZiveloLaptop(options: ZiveloLaptopOptions): ZiveloLaptopApi;
