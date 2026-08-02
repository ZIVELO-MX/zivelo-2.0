export const HERO_LAPTOP_DEFAULT_ROTATION = -0.28;
export const HERO_LAPTOP_MIN_ROTATION = -0.78;
export const HERO_LAPTOP_MAX_ROTATION = 0.78;

const DRAG_SENSITIVITY = 0.0065;
const KEYBOARD_STEP = 0.14;

export function clampLaptopRotation(value: number) {
  return Math.min(HERO_LAPTOP_MAX_ROTATION, Math.max(HERO_LAPTOP_MIN_ROTATION, value));
}

export function laptopRotationFromDrag(startRotation: number, deltaX: number) {
  return clampLaptopRotation(startRotation + deltaX * DRAG_SENSITIVITY);
}

export function laptopRotationFromKey(currentRotation: number, key: string) {
  if (key === "ArrowLeft") return clampLaptopRotation(currentRotation - KEYBOARD_STEP);
  if (key === "ArrowRight") return clampLaptopRotation(currentRotation + KEYBOARD_STEP);
  if (key === "Home") return HERO_LAPTOP_DEFAULT_ROTATION;
  return currentRotation;
}

export function laptopRotationToDegrees(rotation: number) {
  return rotation * (180 / Math.PI);
}
