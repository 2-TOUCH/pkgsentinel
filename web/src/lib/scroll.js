import Lenis from "lenis";

// One requestAnimationFrame loop for the whole page. Lenis advances first,
// then every scroll-driven component reads its own position and writes
// styles directly. Nothing here goes through React state while scrolling.
const subscribers = new Set();
let lenis = null;

export function startScroll(reducedMotion) {
  if (!reducedMotion) {
    lenis = new Lenis({ lerp: 0.09, smoothWheel: true, wheelMultiplier: 0.9 });
  }
  let raf = 0;
  const loop = (time) => {
    if (lenis) lenis.raf(time);
    subscribers.forEach((fn) => fn(time));
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);
  return () => {
    cancelAnimationFrame(raf);
    if (lenis) lenis.destroy();
    lenis = null;
  };
}

export function onFrame(fn) {
  subscribers.add(fn);
  return () => {
    subscribers.delete(fn);
  };
}

// Smooth-scroll to an in-page hash such as "#try", or to the top for "#top".
export function scrollToHash(hash) {
  const target = hash === "#top" ? 0 : document.querySelector(hash);
  if (target === null) return;
  if (lenis) lenis.scrollTo(target, { duration: 1.6 });
  else if (typeof target === "number") window.scrollTo({ top: target });
  else target.scrollIntoView();
  history.replaceState(null, "", hash === "#top" ? " " : hash);
}
