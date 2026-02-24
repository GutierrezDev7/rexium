"use client";
import { useEffect, useRef, type CSSProperties } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { useLanguage } from "@/context/LanguageContext";

gsap.registerPlugin(ScrollTrigger);

const Scene = dynamic(() => import("./Scene"), { ssr: false });

export default function Manifesto() {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const lastPosRef = useRef<{ x: number; y: number; angle: number } | null>(null);
  const containerStyle: CSSProperties = {};

  useEffect(() => {
    const ctx = gsap.context(() => {
      const container = containerRef.current;
      const overlay = overlayRef.current;
      if (!container || !overlay) return;

      const setMx = gsap.quickTo(overlay, "--mx", { duration: 0.35, ease: "power2.out" });
      const setMy = gsap.quickTo(overlay, "--my", { duration: 0.35, ease: "power2.out" });
      const setR = gsap.quickTo(overlay, "--r", { duration: 0.35, ease: "power2.out" });
      const phrases = gsap.utils.toArray<HTMLElement>(".manifesto-phrase");

      phrases.forEach((phrase) => {
        gsap.fromTo(
          phrase,
          { opacity: 0.2, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 1.5,
            ease: "power2.out",
            scrollTrigger: {
              trigger: phrase,
              start: "top 85%",
              end: "top 50%",
              scrub: true,
            },
          }
        );

        gsap.to(phrase, {
          opacity: 0.2,
          y: -30,
          scrollTrigger: {
            trigger: phrase,
            start: "bottom 40%",
            end: "bottom 10%",
            scrub: true,
          },
        });
      });

      let rafId = 0;
      let nextX = 50;
      let nextY = 50;
      let idleTimer = 0;

      const apply = () => {
        rafId = 0;
        setMx(nextX);
        setMy(nextY);
        setR(300);
      };

      const handleMove = (event: MouseEvent) => {
        const rect = container.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        nextX = (x / rect.width) * 100;
        nextY = (y / rect.height) * 100;
        lastPosRef.current = { x, y, angle: 0 };
        if (!rafId) rafId = window.requestAnimationFrame(apply);
        if (idleTimer) window.clearTimeout(idleTimer);
        idleTimer = window.setTimeout(() => {
          setR(0);
        }, 250);
      };

      const handleLeave = () => {
        if (containerRef.current) {
          setMx(50);
          setMy(50);
          setR(0);
        }
        if (idleTimer) window.clearTimeout(idleTimer);
      };

      container.addEventListener("mousemove", handleMove, { passive: true });
      container.addEventListener("mouseleave", handleLeave);

      return () => {
        container.removeEventListener("mousemove", handleMove);
        container.removeEventListener("mouseleave", handleLeave);
        if (rafId) window.cancelAnimationFrame(rafId);
        if (idleTimer) window.clearTimeout(idleTimer);
      };
    }, containerRef);

    return () => ctx.revert();
  }, [t]);

  return (
    <section
      ref={containerRef}
      className="py-40 md:py-60 px-6 md:px-20 bg-black text-white min-h-screen flex flex-col justify-center relative overflow-hidden isolate"
      style={containerStyle}
    >
      <div className="absolute inset-0 pointer-events-none z-0">
        <Scene blendMode="normal" opacity={1} />
      </div>
      <div
        ref={overlayRef}
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background:
            "radial-gradient(circle calc(var(--r, 0) * 1px) at calc(var(--mx, 50) * 1%) calc(var(--my, 50) * 1%), transparent 0, transparent 40%, black 70%)",
        }}
      />
      
      
      
      <div className="max-w-5xl mx-auto space-y-20 md:space-y-40 text-4xl md:text-6xl lg:text-7xl font-light tracking-tight leading-tight relative z-20">
        <p className="manifesto-phrase">{t.manifesto.line1}</p>
        <p className="manifesto-phrase">{t.manifesto.line2}</p>
        <p className="manifesto-phrase">
          {t.manifesto.line3} <br /> {t.manifesto.line3Br}
        </p>
        <p className="manifesto-phrase">{t.manifesto.line4}</p>
        <p className="manifesto-phrase text-white">
          {t.manifesto.line5} <br /> {t.manifesto.line5Br}
        </p>
      </div>
    </section>
  );
}
