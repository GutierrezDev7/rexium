"use client";
import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLanguage } from "@/context/LanguageContext";

gsap.registerPlugin(ScrollTrigger);

export default function Stack() {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate grid items appearing
      gsap.from(gridRef.current?.children || [], {
        y: 30,
        opacity: 0,
        stagger: 0.1,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
            trigger: containerRef.current,
            start: "top 75%",
        }
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="py-20 md:py-48 px-6 md:px-24 bg-black text-white relative">
      <div className="flex flex-col mb-16 md:mb-24">
         <h3 className="text-xs md:text-sm text-gray-500 uppercase tracking-[0.3em] mb-4">{t.stack.label}</h3>
         <div className="h-[1px] w-full bg-white/20"></div>
      </div>

      <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-l border-t border-white/10">
        {t.stack.items.map((item, i) => (
          <div
            key={i}
            className="group relative border-r border-b border-white/10 p-8 md:p-12 transition-colors duration-500 hover:bg-white hover:text-black cursor-none"
            data-cursor-text="STACKS"
          >
            {/* Tech Number */}
            <span className="block text-xs font-mono opacity-50 mb-8 md:mb-12 group-hover:opacity-100 transition-opacity">
              {(i + 1).toString().padStart(2, '0')}
            </span>

            {/* Tech Name */}
            <h4 className="text-3xl md:text-4xl font-light tracking-tight mb-4 group-hover:font-normal transition-all">
              {item.name}
            </h4>

            {/* Tech Description */}
            <p className="text-xs md:text-sm font-mono opacity-60 max-w-[200px] leading-relaxed group-hover:opacity-100 transition-opacity">
              {item.desc}
            </p>

            {/* Corner Accent */}
            <div className="absolute top-0 right-0 w-3 h-3 border-l border-b border-transparent group-hover:border-black/20 transition-all duration-300"></div>
          </div>
        ))}
      </div>
    </section>
  );
}
