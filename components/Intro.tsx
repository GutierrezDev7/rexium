"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";

import { useLanguage } from "@/context/LanguageContext";

export default function Intro({ onComplete }: { onComplete: () => void }) {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const subtextRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          gsap.to(containerRef.current, {
            yPercent: -100,
            duration: 0.8,
            ease: "power2.inOut",
            onComplete: onComplete,
          });
        },
      });

      // Initial state
      gsap.set(lineRef.current, { scaleX: 0, transformOrigin: "left center" });
      gsap.set(".char", { y: "100%", opacity: 0 }); // Start below
      gsap.set(subtextRef.current, { opacity: 0, y: 20 });

      // Animation sequence
      // 1. Line draws across
      tl.to(lineRef.current, {
        scaleX: 1,
        duration: 0.9,
        ease: "power3.inOut",
      })
      // 2. Text reveals from below the line (masked by overflow-hidden on parent)
      .to(".char", {
        y: "0%",
        opacity: 1,
        stagger: 0.05,
        duration: 0.6,
        ease: "power3.out",
      }, "-=0.4")
      // 3. Line disappears or shrinks
      .to(lineRef.current, {
        scaleX: 0,
        transformOrigin: "right center",
        duration: 0.5,
        ease: "power3.inOut",
      })
      // 4. Subtext appears
      .to(subtextRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.5,
      }, "-=0.2")
      .to({}, { duration: 1 }); // Pause before exit

    }, containerRef);

    return () => ctx.revert();
  }, [onComplete]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black text-white"
    >
      <div className="relative p-2">
        <div ref={textRef} className="flex gap-3 md:gap-6 overflow-hidden pb-2">
          {"REXIUM".split("").map((char, i) => (
            <span key={i} className="char inline-block text-5xl md:text-8xl font-bold tracking-tighter">
              {char}
            </span>
          ))}
        </div>
        <div
          ref={lineRef}
          className="absolute bottom-0 left-0 h-[1px] w-full bg-white"
        />
      </div>
      <div ref={subtextRef} className="mt-6 text-xs md:text-sm tracking-[0.4em] text-gray-400 uppercase font-light">
        {t.intro.sub}
      </div>
    </div>
  );
}
