"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { useLanguage } from "@/context/LanguageContext";
import dynamic from "next/dynamic";

const FluidReveal = dynamic(() => import("./FluidReveal"), { ssr: false });

gsap.registerPlugin(ScrollTrigger);

export default function About() {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const words = gsap.utils.toArray<HTMLElement>(".about-word");

      gsap.from(words, {
        y: 120,
        opacity: 0,
        duration: 1.2,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 60%",
        },
      });
    }, containerRef);
    return () => ctx.revert();
  }, [t]);

  return (
    <section ref={containerRef} className="py-24 md:py-64 px-6 md:px-24 bg-black text-white relative min-h-[80vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <FluidReveal />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 w-full relative z-10 pointer-events-none">
            <div className="lg:col-span-4 self-end text-right pr-8 hidden lg:block">
                <p className="text-xs md:text-sm text-gray-500 mb-4 uppercase tracking-[0.3em]">{t.about.label}</p>
                <div className="h-[1px] w-24 bg-gray-800 ml-auto"></div>
            </div>
            <div className="lg:col-span-8 text-5xl md:text-8xl lg:text-9xl font-bold uppercase leading-[0.9] tracking-tighter space-y-4 md:space-y-8">
                <div className="overflow-hidden"><span className="about-word inline-block text-white">{t.about.words[0]}</span></div>
                <div className="overflow-hidden ml-8 md:ml-40"><span className="about-word inline-block text-gray-400">{t.about.words[1]}</span></div>
                <div className="overflow-hidden ml-16 md:ml-80"><span className="about-word inline-block text-white">{t.about.words[2]}</span></div>
            </div>
        </div>
    </section>
  );
}
