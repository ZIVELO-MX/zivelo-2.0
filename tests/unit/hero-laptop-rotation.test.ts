import assert from "node:assert/strict";
import test from "node:test";
import {
  HERO_LAPTOP_DEFAULT_ROTATION,
  HERO_LAPTOP_MAX_ROTATION,
  HERO_LAPTOP_MIN_ROTATION,
  clampLaptopRotation,
  laptopRotationFromDrag,
  laptopRotationFromKey,
  laptopRotationToDegrees,
} from "../../src/lib/hero-laptop-rotation";

test("laptop rotation stays within the presentational range", () => {
  assert.equal(clampLaptopRotation(20), HERO_LAPTOP_MAX_ROTATION);
  assert.equal(clampLaptopRotation(-20), HERO_LAPTOP_MIN_ROTATION);
});

test("converts the shared rotation to CSS degrees", () => {
  assert.equal(laptopRotationToDegrees(0), 0);
  assert.equal(laptopRotationToDegrees(Math.PI / 2), 90);
});

test("horizontal dragging rotates the laptop in the expected direction", () => {
  assert.ok(laptopRotationFromDrag(0, 80) > 0);
  assert.ok(laptopRotationFromDrag(0, -80) < 0);
});

test("keyboard controls rotate and reset the laptop", () => {
  assert.ok(laptopRotationFromKey(0, "ArrowRight") > 0);
  assert.ok(laptopRotationFromKey(0, "ArrowLeft") < 0);
  assert.equal(laptopRotationFromKey(0.5, "Home"), HERO_LAPTOP_DEFAULT_ROTATION);
  assert.equal(laptopRotationFromKey(0.5, "Enter"), 0.5);
});
