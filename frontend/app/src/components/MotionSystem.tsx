import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/** A small, opt-in motion layer: reveal hierarchy, then leave the page alone. */
export function MotionDirector() {
  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    document.documentElement.classList.add("motion-enabled");
    const context = gsap.context(() => {
      gsap.from(".hero-name span", {
        yPercent: 105,
        duration: 1.05,
        stagger: 0.09,
        ease: "expo.out",
        delay: 0.12,
      });

      gsap.utils.toArray<HTMLElement>(".section-rule").forEach((element) => {
        gsap.from(element, {
          scaleX: 0,
          transformOrigin: "left",
          duration: 0.9,
          ease: "expo.out",
          scrollTrigger: { trigger: element, start: "top 92%", once: true },
        });
      });
    });

    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    return () => {
      context.revert();
      document.documentElement.classList.remove("motion-enabled");
    };
  }, []);

  return null;
}
