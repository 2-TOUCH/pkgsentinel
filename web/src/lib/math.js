// Small helpers for scroll-driven animation (plain arithmetic, no library).
export const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
export const lerp = (a, b, t) => a + (b - a) * t;
// Where v sits between a and b, clamped to 0..1.
export const range = (v, a, b) => clamp((v - a) / (b - a));
export const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

// Scroll progress through a tall section whose child is `position: sticky`.
// 0 when the section top meets the viewport top, 1 when the pin is about to end.
export function pinProgress(el) {
  const rect = el.getBoundingClientRect();
  const vh = window.innerHeight;
  const span = Math.max(1, rect.height - vh);
  return { p: clamp(-rect.top / span), rect, vh };
}
