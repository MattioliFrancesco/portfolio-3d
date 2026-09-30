import * as THREE from 'three';

/**
 * Global scroll progress (0 → 1) across the whole page.
 * Used by the scene to drive camera / light choreography without
 * duplicating GSAP ScrollTrigger state.
 */
export function getScrollProgress() {
  if (typeof window === 'undefined') return 0;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  return max > 0 ? THREE.MathUtils.clamp(window.scrollY / max, 0, 1) : 0;
}

/**
 * Continuous "act" coordinate: page is 5 acts (sections).
 * Returns 0…4 — the integer part is the act, the fraction the
 * transition toward the next one.
 */
export function getActFloat() {
  return THREE.MathUtils.clamp(getScrollProgress() * 5 - 0.5, 0, 4);
}

/**
 * Smoothly interpolate a keyframe array (one value per act) at a
 * fractional act coordinate t (0…keys.length-1).
 */
export function lerpKeys(keys, t) {
  const clamped = THREE.MathUtils.clamp(t, 0, keys.length - 1);
  const i = Math.min(Math.floor(clamped), keys.length - 2);
  const f = clamped - i;
  return keys[i] + (keys[i + 1] - keys[i]) * f;
}
