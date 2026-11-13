import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { animate, cancelFrame, easeInOut, frame, scroll } from "motion";
import type { Category } from "@/data/products";

const jump = { duration: 1.6, easing: easeInOut };

export function useStoreScroll(category: Category, modalOpen: boolean) {
  const engine = useRef<Lenis | null>(null);
  const progress = useRef<HTMLDivElement>(null);
  const readout = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const bar = progress.current!;
    const label = readout.current!;
    const motion = matchMedia("(prefers-reduced-motion: no-preference)");
    let cleanup = () => {};
    function configure() {
      cleanup();
      if (!motion.matches) return;
      const lenis = new Lenis({ autoRaf: false, anchors: jump });
      engine.current = lenis;
      if (document.querySelector("dialog[open]")) lenis.stop();
      const tick = ({ timestamp }: { timestamp: number }) =>
        lenis.raf(timestamp);
      frame.setup(tick, true);
      const stopBar = scroll(
        animate(bar, { scaleX: [0, 1] }, { ease: "linear" }),
      );
      const stopReadout = scroll((value) => {
        const percent = Math.round(value * 100) + "%";
        if (label.textContent !== percent) label.textContent = percent;
      });
      cleanup = () => {
        cancelFrame(tick);
        stopBar();
        stopReadout();
        lenis.destroy();
        engine.current = null;
        cleanup = () => {};
      };
    }
    configure();
    motion.addEventListener("change", configure);
    return () => {
      motion.removeEventListener("change", configure);
      cleanup();
    };
  }, []);

  useEffect(() => {
    const media = matchMedia(
      "(min-width: 800px) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
    );
    let cleanups: (() => void)[] = [];
    function update() {
      cleanups.forEach((stop) => stop());
      cleanups = [];
      if (!media.matches) return;
      document.querySelectorAll<HTMLElement>(".hero").forEach((target) => {
        const layer = target.querySelector<HTMLElement>("h1");
        if (!layer) return;
        const travel = 54;
        const animation = animate(
          layer,
          { y: [-travel, travel] },
          { ease: "linear" },
        );
        const stop = scroll(animation, {
          target,
          offset: ["start end", "end start"],
        });
        cleanups.push(() => {
          stop();
          animation.cancel();
          layer.style.removeProperty("transform");
        });
      });
    }
    update();
    media.addEventListener("change", update);
    return () => {
      media.removeEventListener("change", update);
      cleanups.forEach((stop) => stop());
    };
  }, [category]);

  useEffect(() => {
    if (modalOpen) engine.current?.stop();
    else if (engine.current) {
      engine.current.resize();
      engine.current.start();
      engine.current.scrollTo(window.scrollY, { immediate: true, force: true });
    }
  }, [modalOpen]);

  function toCatalog() {
    const catalog = document.getElementById("catalog");
    if (!catalog) return;
    if (engine.current) engine.current.scrollTo(catalog, jump);
    else catalog.scrollIntoView({ behavior: "instant" });
  }
  return { progress, readout, toCatalog };
}
