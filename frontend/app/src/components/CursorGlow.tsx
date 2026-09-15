import { useEffect, useRef } from "react";

/**
 * Keeps the decorative cursor light outside React state so pointer movement
 * only updates one CSS-rendered layer rather than rerendering the portfolio.
 */
export function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const glow = glowRef.current;
    if (!glow) return;

    const finePointer = window.matchMedia("(pointer: fine)");
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    let frame = 0;
    let enabled = false;
    let visible = false;
    let pointerX = window.innerWidth / 2;
    let pointerY = window.innerHeight / 2;

    const cancelFrame = () => {
      if (!frame) return;
      window.cancelAnimationFrame(frame);
      frame = 0;
    };

    const hideGlow = () => {
      visible = false;
      glow.classList.remove("is-visible");
      cancelFrame();
    };

    const applyPointerPosition = () => {
      frame = 0;
      if (!visible) return;
      glow.style.setProperty("--cursor-x", `${pointerX}px`);
      glow.style.setProperty("--cursor-y", `${pointerY}px`);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      pointerX = event.clientX;
      pointerY = event.clientY;
      visible = true;
      glow.classList.add("is-visible");
      if (!frame) frame = window.requestAnimationFrame(applyPointerPosition);
    };

    const setTracking = (shouldEnable: boolean) => {
      if (shouldEnable === enabled) return;
      enabled = shouldEnable;
      if (enabled) {
        document.addEventListener("pointermove", handlePointerMove, {
          passive: true,
        });
        document.addEventListener("pointerleave", hideGlow);
        window.addEventListener("blur", hideGlow);
      } else {
        document.removeEventListener("pointermove", handlePointerMove);
        document.removeEventListener("pointerleave", hideGlow);
        window.removeEventListener("blur", hideGlow);
        hideGlow();
      }
    };

    const syncAvailability = () =>
      setTracking(finePointer.matches && !reducedMotion.matches);

    finePointer.addEventListener("change", syncAvailability);
    reducedMotion.addEventListener("change", syncAvailability);
    syncAvailability();

    return () => {
      finePointer.removeEventListener("change", syncAvailability);
      reducedMotion.removeEventListener("change", syncAvailability);
      setTracking(false);
      cancelFrame();
    };
  }, []);

  return <div ref={glowRef} className="cursor-glow" aria-hidden="true" />;
}
