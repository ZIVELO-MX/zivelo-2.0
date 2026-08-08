import assert from "node:assert/strict";
import test from "node:test";
import { access, readFile } from "node:fs/promises";

const readSource = (path) => readFile(new URL(`../../${path}`, import.meta.url), "utf8");
const assetUrl = (path) => new URL(`../../${path}`, import.meta.url);

test("integrates the handoff module with a static fallback", async () => {
  const [shell, scene, moduleSource] = await Promise.all([
    readSource("src/components/hero-laptop.tsx"),
    readSource("src/components/hero-laptop-scene.tsx"),
    readSource("src/lib/3d/zivelo-laptop.js"),
  ]);

  assert.match(shell, /hero-laptop-static\.webp/);
  assert.match(shell, /min-width: 768px/);
  assert.doesNotMatch(shell, /hero-laptop__controls|aria-pressed|heroLaptopHint|heroLaptopToggle/);
  assert.match(scene, /import\("three"\)/);
  assert.match(scene, /import\("three\/addons\/controls\/OrbitControls\.js"\)/);
  assert.match(scene, /createZiveloLaptop/);
  assert.match(scene, /userOrbit: false/);
  assert.match(scene, /closeOnClick: true/);
  assert.match(scene, /dispose\(\)/);
  assert.match(moduleSource, /export function createZiveloLaptop/);
  assert.match(moduleSource, /userOrbit = true/);
  assert.match(moduleSource, /closeOnClick = false/);
  assert.doesNotMatch(scene, /WebGLRenderer/);
  assert.doesNotMatch(shell, /hero-laptop-rotation/);

  await Promise.all([
    access(assetUrl("public/assets/hero-laptop-static.webp")),
    access(assetUrl("public/assets/zivelo-bars-dark-full.png")),
    access(assetUrl("public/assets/zivelo-wordmark-dark-compact.svg")),
  ]);
});
