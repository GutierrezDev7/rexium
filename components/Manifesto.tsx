"use client";
import { useEffect, useRef, type CSSProperties } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { useLanguage } from "@/context/LanguageContext";
import { useCursor } from "@/context/CursorContext";

gsap.registerPlugin(ScrollTrigger);

const Scene = dynamic(() => import("./Scene"), { ssr: false });

export default function Manifesto() {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const lastPosRef = useRef<{ x: number; y: number; angle: number } | null>(null);
  const containerStyle: CSSProperties = {};
  
  // Track mouse globally via our existing cursor system logic to update even on scroll
  // We'll use a local ref to track mouse position for scroll updates
  const mousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const ctx = gsap.context(() => {
      const container = containerRef.current;
      const overlay = overlayRef.current;
      if (!container || !overlay) return;

      const setMx = gsap.quickTo(overlay, "--mx", { duration: 0.1, ease: "power1.out" });
      const setMy = gsap.quickTo(overlay, "--my", { duration: 0.1, ease: "power1.out" });
      const setR = gsap.quickTo(overlay, "--r", { duration: 0.2, ease: "power2.out" });
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

      const apply = () => {
        rafId = 0;
        setMx(nextX);
        setMy(nextY);
        setR(300);
      };

      const handleMove = (event: MouseEvent) => {
        mousePos.current = { x: event.clientX, y: event.clientY };
        updateEffect(event.clientX, event.clientY);
      };
      
      const updateEffect = (clientX: number, clientY: number) => {
        const rect = container.getBoundingClientRect();
        
        // Check if mouse is actually inside the container boundaries
        if (
          clientX < rect.left ||
          clientX > rect.right ||
          clientY < rect.top ||
          clientY > rect.bottom
        ) {
          handleLeave();
          return;
        }

        const x = clientX - rect.left;
        const y = clientY - rect.top;
        nextX = (x / rect.width) * 100;
        nextY = (y / rect.height) * 100;
        lastPosRef.current = { x, y, angle: 0 };
        if (!rafId) rafId = window.requestAnimationFrame(apply);
      };
      
      const handleScroll = () => {
          // Update effect based on last known mouse position relative to new scroll position
          // Since clientX/Y are relative to viewport, they don't change on scroll unless mouse moves.
          // However, the element moves relative to viewport.
          // So we just need to re-run the bounds check and relative calculation.
          updateEffect(mousePos.current.x, mousePos.current.y);
      };

      const handleLeave = () => {
        if (containerRef.current) {
          setMx(50);
          setMy(50);
          setR(0);
        }
      };

      // Listen to window mousemove to track position even if entered via scroll
      window.addEventListener("mousemove", handleMove, { passive: true });
      window.addEventListener("scroll", handleScroll, { passive: true });
      // Keep local listeners too for specificity if needed, but window is safer for scroll logic
      
      return () => {
        window.removeEventListener("mousemove", handleMove);
        window.removeEventListener("scroll", handleScroll);
        if (rafId) window.cancelAnimationFrame(rafId);
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
      
      
      
      <div className="max-w-5xl mx-auto select-none space-y-20 md:space-y-40 text-4xl md:text-6xl lg:text-7xl font-light tracking-tight leading-tight relative z-20">
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
