import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import type { RefObject } from "react";

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin, useGSAP);

const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const desktopMotion = () => matchMedia("(min-width: 1101px) and (prefers-reduced-motion: no-preference)").matches;

export function usePortfolioMotion(scope: RefObject<HTMLElement | null>) {
  useGSAP(() => {
    if (!scope.current || reduced()) return;
    const root = scope.current;

    const lines = gsap.utils.toArray<HTMLElement>("[data-hero-line]");
    gsap.set(lines, { willChange: "transform" });
    const intro = gsap.timeline({ defaults: { ease: "power3.out" }, onComplete: () => gsap.set(lines, { clearProps: "willChange" }) });
    intro
      .from(lines[0], { yPercent: 112, xPercent: -8, duration: 0.56 })
      .from(lines[1], { xPercent: 105, duration: 0.58 }, "-=.42")
      .from(lines[2], { yPercent: -112, letterSpacing: ".12em", duration: 0.5 }, "-=.4")
      .from(".hero-rule", { scaleX: 0, transformOrigin: "left", duration: 0.55 }, "-=.28")
      .from("[data-hero-support]", { clipPath: "inset(0 100% 0 0)", x: 18, duration: 0.42, stagger: 0.035 }, "-=.42")
      .from(".pulse-path", { strokeDashoffset: 1, duration: 0.5, stagger: 0.07 }, "-=.48")
      .from(".pulse-node", { scale: 0.72, transformOrigin: "center", duration: 0.2, stagger: 0.055 }, "-=.35")
      .fromTo(".pulse-packet", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.04 })
      .to(".pulse-packet", { motionPath: { path: ".pulse-route", align: ".pulse-route", alignOrigin: [0.5, 0.5] }, duration: 0.46, ease: "power1.inOut" })
      .to(".pulse-destination", { scale: 1.1, transformOrigin: "center", duration: 0.09, yoyo: true, repeat: 1 }, "-=.05")
      .to(".pulse-packet", { autoAlpha: 0, duration: 0.08 }, "-=.08");

    const media = gsap.matchMedia();
    media.add("(min-width: 1101px) and (prefers-reduced-motion: no-preference)", () => {
      const hero = root.querySelector<HTMLElement>(".hero");
      if (hero) {
        gsap.timeline({ scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 0.45 } })
          .to("[data-axis=x]", { xPercent: -16, ease: "none" }, 0)
          .to("[data-axis=y]", { xPercent: 10, ease: "none" }, 0)
          .to("[data-axis=lock]", { xPercent: 28, ease: "none" }, 0)
          .to(".hero-system", { xPercent: -20, yPercent: 32, scale: 1.08, ease: "none" }, 0)
          .to(".handoff-line", { scaleY: 1, ease: "none" }, 0);
      }
      const about = root.querySelector<HTMLElement>("#about");
      if (about) {
        gsap.timeline({ scrollTrigger: { trigger: about, start: "top bottom", end: "center center", scrub: 0.5 } })
          .fromTo(about.querySelector(".about-copy"), { xPercent: -7 }, { xPercent: 0, ease: "none" }, 0)
          .fromTo(about.querySelector(".principle-list"), { xPercent: 7 }, { xPercent: 0, ease: "none" }, 0)
          .fromTo(about.querySelector(".principle-list"), { clipPath: "inset(0 0 0 100%)" }, { clipPath: "inset(0 0 0 0%)", ease: "none" }, 0);
      }
    });

    const experience = root.querySelector<HTMLElement>("#experience");
    if (experience) {
      gsap.fromTo(experience, { "--timeline-progress": "0%" }, { "--timeline-progress": "100%", ease: "none", scrollTrigger: { trigger: experience, start: "top 65%", end: "bottom 65%", scrub: true } });
      experience.querySelectorAll<HTMLElement>(".experience-row").forEach((row) => {
        ScrollTrigger.create({
          trigger: row,
          start: "top 58%",
          end: "bottom 42%",
          toggleClass: { targets: row, className: "is-current" },
        });
        media.add("(min-width: 1101px) and (prefers-reduced-motion: no-preference)", () => {
          gsap.fromTo(row.querySelector(".experience-meta"), { xPercent: -18 }, { xPercent: 0, ease: "none", scrollTrigger: { trigger: row, start: "top 82%", end: "top 46%", scrub: 0.4 } });
        });
      });
    }

    const skills = root.querySelector<HTMLElement>("#skills");
    if (skills) gsap.fromTo(skills.querySelectorAll(".capability-signal i"), { scaleX: 0 }, { scaleX: 1, transformOrigin: "left", stagger: 0.06, duration: 0.5, scrollTrigger: { trigger: skills, start: "top 72%", once: true } });

    const credentials = root.querySelector<HTMLElement>(".credential-layout");
    if (credentials) gsap.from(credentials.children, { clipPath: "inset(0 100% 0 0)", duration: 0.5, stagger: 0.08, scrollTrigger: { trigger: credentials, start: "top 78%", once: true } });
    return () => media.revert();
  }, { scope });
}

export function useProjectStory(scope: RefObject<HTMLElement | null>, setActive: (index: number) => void) {
  useGSAP(() => {
    if (!scope.current) return;
    const media = gsap.matchMedia();
    media.add("(min-width: 1101px) and (prefers-reduced-motion: no-preference)", () => {
      const entries = gsap.utils.toArray<HTMLElement>(".project-narrative", scope.current);
      const images = gsap.utils.toArray<HTMLElement>(".project-stage-frame img", scope.current);
      if (images.length < 2) return;

    gsap.set(images[0], { autoAlpha: 1, xPercent: 0, scale: 1, clipPath: "inset(0 0% 0 0)" });
    gsap.set(images[1], { autoAlpha: 1, xPercent: 18, scale: 1.06, clipPath: "inset(0 0 0 100%)" });
    gsap.timeline({ scrollTrigger: { trigger: scope.current, start: "top 28%", end: "bottom 72%", scrub: 0.65 } })
      .to(images[0], { xPercent: -18, scale: 0.92, clipPath: "inset(8% 58% 8% 0)", ease: "none" }, 0)
      .to(images[1], { xPercent: 0, scale: 1, clipPath: "inset(0 0 0 0%)", ease: "none" }, 0)
      .to(".project-stage-frame", { "--stage-axis": "100%", ease: "none" }, 0);

      entries.forEach((entry, index) => ScrollTrigger.create({
        trigger: entry,
        start: "top 54%",
        end: "bottom 46%",
        onToggle: ({ isActive }) => { if (isActive) setActive(index); },
        onEnterBack: () => setActive(index),
      }));
    });
    return () => media.revert();
  }, { scope, dependencies: [setActive] });
}

export function useCaseStudyMotion() {
  useGSAP(() => {
    if (reduced()) return;
    gsap.timeline({ defaults: { ease: "power3.out" } })
      .from(".case-masthead h1", { clipPath: "inset(100% 0 0 0)", yPercent: 20, duration: 0.55 })
      .from(".case-masthead>p, .case-masthead .action-row", { clipPath: "inset(0 100% 0 0)", x: 12, duration: 0.38, stagger: 0.06 }, "-=.26")
      .from(".system-trace, .case-artifact", { clipPath: "inset(0 0 100% 0)", scale: 0.985, duration: 0.48 }, "-=.18");
  });
}

export function useTraceMotion(active: string) {
  useGSAP(() => {
    if (reduced()) return;
    const trace = document.querySelector<HTMLElement>(".system-trace");
    const path = trace?.querySelector<SVGPathElement>(`.path.${active}`);
    const note = trace?.querySelector<HTMLElement>(".trace-note");
    if (!path) return;
    const length = path.getTotalLength();
    gsap.fromTo(path, { strokeDasharray: length, strokeDashoffset: length }, { strokeDashoffset: 0, duration: 0.72, ease: "power2.inOut" });
    if (note) gsap.fromTo(note.children, { x: 12, clipPath: "inset(0 100% 0 0)" }, { x: 0, clipPath: "inset(0 0% 0 0)", duration: 0.32, stagger: 0.045, ease: "power2.out" });
  }, { dependencies: [active] });
}

export function attachTilt(element: HTMLElement) {
  if (reduced() || !matchMedia("(pointer: fine)").matches) return () => {};
  const xTo = gsap.quickTo(element, "rotationY", { duration: 0.35, ease: "power2.out" });
  const yTo = gsap.quickTo(element, "rotationX", { duration: 0.35, ease: "power2.out" });
  const imgX = gsap.quickTo(element.querySelectorAll("img"), "x", { duration: 0.5, ease: "power2.out" });
  const move = (event: PointerEvent) => {
    const rect = element.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    xTo(x * 4); yTo(-y * 4); imgX(x * 5);
  };
  const reset = () => { xTo(0); yTo(0); imgX(0); };
  element.addEventListener("pointermove", move);
  element.addEventListener("pointerleave", reset);
  return () => { element.removeEventListener("pointermove", move); element.removeEventListener("pointerleave", reset); };
}
