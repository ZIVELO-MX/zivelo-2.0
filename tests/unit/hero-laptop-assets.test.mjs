import assert from "node:assert/strict";
import test from "node:test";
import { access, readFile } from "node:fs/promises";

const readSource = (path) => readFile(new URL(`../../${path}`, import.meta.url), "utf8");

test("uses the official compact ZIVELO SVG in the Three.js vector scene", async () => {
  const [shell, scene, logo] = await Promise.all([
    readSource("src/components/hero-laptop.tsx"),
    readSource("src/components/hero-laptop-scene.tsx"),
    readSource("public/assets/logo-white-compact.svg"),
  ]);

  assert.match(shell, /\/assets\/logo-white-compact\.svg/);
  assert.match(scene, /SVGRenderer/);
  assert.match(scene, /\/assets\/logo-white-compact\.svg/);
  assert.doesNotMatch(scene, /@react-three\/fiber/);
  assert.doesNotMatch(shell, /hero-laptop-(?:dark|light)\.webp/);
  assert.match(logo, /viewBox="0 0 162\.54 118\.54"/);

  await assert.rejects(access(new URL("../../public/assets/hero-laptop-dark.webp", import.meta.url)));
  await assert.rejects(access(new URL("../../public/assets/hero-laptop-light.webp", import.meta.url)));
  await assert.rejects(access(new URL("../../public/assets/logo-white-compact-3d.png", import.meta.url)));
});
