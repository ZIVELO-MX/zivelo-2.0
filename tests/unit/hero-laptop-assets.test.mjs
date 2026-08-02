import assert from "node:assert/strict";
import test from "node:test";
import { access, readFile } from "node:fs/promises";

const readSource = (path) => readFile(new URL(`../../${path}`, import.meta.url), "utf8");

test("uses the official compact ZIVELO artwork in CSS 3D and WebGL", async () => {
  const [shell, scene, logo, texture] = await Promise.all([
    readSource("src/components/hero-laptop.tsx"),
    readSource("src/components/hero-laptop-scene.tsx"),
    readSource("public/assets/logo-white-compact.svg"),
    readFile(new URL("../../public/assets/logo-white-compact-3d.png", import.meta.url)),
  ]);

  assert.match(shell, /\/assets\/logo-white-compact\.svg/);
  assert.match(shell, /hero-laptop__fallback-model/);
  assert.match(shell, /--hero-laptop-rotation/);
  assert.doesNotMatch(shell, /hero-laptop-(?:dark|light)\.webp/);
  assert.match(scene, /\/assets\/logo-white-compact-3d\.png/);
  assert.match(logo, /viewBox="0 0 162\.54 118\.54"/);
  assert.deepEqual([...texture.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);

  await assert.rejects(access(new URL("../../public/assets/hero-laptop-dark.webp", import.meta.url)));
  await assert.rejects(access(new URL("../../public/assets/hero-laptop-light.webp", import.meta.url)));
});
