import { useEffect } from "react";
import { Footer, Header } from "./components/Chrome";
import { Contribute } from "./components/Contribute";
import { Hero } from "./components/Hero";
import { Pipeline } from "./components/Pipeline";
import { StoryReel } from "./components/StoryReel";
import { Ways } from "./components/Ways";
import Tool from "./Tool";
import { useReducedMotion } from "./hooks/useReducedMotion";
import { startScroll } from "./lib/scroll";

export default function App() {
  const reduced = useReducedMotion();
  useEffect(() => startScroll(reduced), [reduced]);
  return (
    <>
      <Header />
      <main>
        <Hero />
        <StoryReel />
        <Pipeline />
        <section id="try" aria-label="Try PkgSentinel" style={{ background: "#0A0F1F" }}>
          <Tool />
        </section>
        <Ways />
        <Contribute />
      </main>
      <Footer />
    </>
  );
}