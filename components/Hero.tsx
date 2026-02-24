"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import dynamic from "next/dynamic";

import { useLanguage } from "@/context/LanguageContext";

const Scene = dynamic(() => import("./Scene"), { ssr: false });

export default function Hero({ startAnimation = true }: { startAnimation?: boolean }) {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const sceneWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!startAnimation) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        textRef.current,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.5,
          ease: "power3.out",
          delay: 0.2,
        }
      );

      const setTextX = gsap.quickTo(textRef.current, "x", { duration: 0.9, ease: "power2.out" });
      const setTextY = gsap.quickTo(textRef.current, "y", { duration: 0.9, ease: "power2.out" });
      const setTextScale = gsap.quickTo(textRef.current, "scale", { duration: 1.2, ease: "power2.out" });
      const setSceneX = gsap.quickTo(sceneWrapRef.current, "x", { duration: 0.9, ease: "power2.out" });
      const setSceneY = gsap.quickTo(sceneWrapRef.current, "y", { duration: 0.9, ease: "power2.out" });
      const setSceneScale = gsap.quickTo(sceneWrapRef.current, "scale", { duration: 1.2, ease: "power2.out" });

      let rafId = 0;
      let targetX = 0;
      let targetY = 0;
      let targetDepth = 0;

      const tick = () => {
        rafId = 0;
        setTextX(targetX);
        setTextY(targetY);
        setTextScale(1 + targetDepth * 0.035);
        setSceneX(targetX * 0.2);
        setSceneY(targetY * 0.2);
        setSceneScale(1 - targetDepth * 0.02);
      };

      const handleMouseMove = (e: MouseEvent) => {
        const px = e.clientX / window.innerWidth - 0.5;
        const py = e.clientY / window.innerHeight - 0.5;
        targetX = px * 30;
        targetY = py * 30;
        targetDepth = 1 - Math.min(1, Math.hypot(px, py) * 1.4);
        if (!rafId) rafId = window.requestAnimationFrame(tick);
      };

      window.addEventListener("mousemove", handleMouseMove, { passive: true });

      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        if (rafId) window.cancelAnimationFrame(rafId);
      };
    }, containerRef);

    return () => ctx.revert();
  }, [startAnimation]);

  return (
    <section
      ref={containerRef}
      className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-transparent"
      style={{ perspective: "1200px" }}
    >
      <div ref={sceneWrapRef} className="absolute inset-0 will-change-transform">
        <Scene />
      </div>
      <h2
        ref={textRef}
        className="max-w-5xl text-4xl md:text-7xl lg:text-8xl font-medium leading-[1.1] text-center px-6 text-white tracking-tight opacity-0"
        style={{
          transform: "translateZ(-80px)",
          textShadow: "0 30px 80px rgba(0,0,0,0.6)",
        }}
      >
        {t.hero.title} <br /> {t.hero.titleBr}
      </h2>
    </section>
  );
}
