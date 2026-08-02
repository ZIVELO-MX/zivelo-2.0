import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

const readSource = (path) => readFile(new URL(`../../${path}`, import.meta.url), "utf8");

test("uses the official compact ZIVELO SVG in fallback and WebGL", async () => {
  const [shell, scene, logo] = await Promise.all([
    readSource("src/components/hero-laptop.tsx"),
    readSource("src/components/hero-laptop-scene.tsx"),
    readSource("public/assets/logo-white-compact.svg"),
  ]);

  assert.match(shell, /\/assets\/logo-white-compact\.svg/);
  assert.match(scene, /\/assets\/logo-white-compact\.svg/);
  assert.match(logo, /viewBox="0 0 162\.54 118\.54"/);
});
