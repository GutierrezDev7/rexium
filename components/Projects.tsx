"use client";
import { useEffect, useRef, useMemo } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { useLanguage } from "@/context/LanguageContext";
import { KronosPreview, OrionPreview, AetherPreview } from "./ProjectPreviews";
import Link from "next/link";

gsap.registerPlugin(ScrollTrigger);

export default function Projects() {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Need to merge static data (images/year) with translated data (titles)
  const projects = useMemo(() => [
    {
      ...t.projects.items[0],
      id: "kronos",
      year: "2024",
      component: <KronosPreview />,
    },
    {
      ...t.projects.items[1],
      id: "orion",
      year: "2024",
      component: <OrionPreview />,
    },
    {
      ...t.projects.items[2],
      id: "aether",
      year: "2023",
      component: <AetherPreview />,
    },
  ], [t]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const projectItems = gsap.utils.toArray<HTMLElement>(".project-item");

      projectItems.forEach((item) => {
        const componentWrapper = item.querySelector(".project-component-wrapper");
        const component = item.querySelector(".project-component");
        const title = item.querySelector(".project-title");
        const sub = item.querySelector(".project-sub");
        const meta = item.querySelector(".project-meta");
        const desc = item.querySelector(".project-desc");

        // Reveal animation on scroll - More artistic approach
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: item,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        });

        if (componentWrapper) {
          // Parallax effect on scroll
          gsap.to(componentWrapper, {
            y: -50,
            ease: "none",
            scrollTrigger: {
              trigger: item,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            }
          });

          // Reveal mask
          tl.fromTo(
            componentWrapper,
            { clipPath: "inset(10% 10% 10% 10%)", scale: 0.95, opacity: 0, filter: "grayscale(100%)" },
            {
              clipPath: "inset(0% 0% 0% 0%)",
              scale: 1,
              opacity: 1,
              filter: "grayscale(0%)",
              duration: 1.8,
              ease: "power3.out",
            }
          );
        }

        if (title) {
          tl.from(
            title,
            { y: 60, opacity: 0, duration: 1.2, ease: "power4.out" },
            "-=1.4"
          );
        }

        if (sub) {
          tl.from(
            sub,
            { y: 30, opacity: 0, duration: 1, ease: "power3.out" },
            "-=1.2"
          );
        }
        
        if (desc) {
            tl.to(
                desc,
                { opacity: 1, y: 0, duration: 1, ease: "power2.out" },
                "-=1.0"
            );
        }

        if (meta) {
            tl.from(
                meta,
                { opacity: 0, x: -20, duration: 1, ease: "power2.out" },
                "-=1.0"
            );
        }

        // Hover effect handled via GSAP events
        const handleMouseEnter = () => {
          if (component) gsap.to(component, { scale: 1.05, duration: 1.2, ease: "power2.out" });
          if (title) gsap.to(title, { x: 15, duration: 0.6, ease: "power2.out", color: "#fff" });
          if (componentWrapper) gsap.to(componentWrapper, { borderColor: "rgba(255,255,255,0.3)", duration: 0.5 });
        };

        const handleMouseLeave = () => {
          if (component) gsap.to(component, { scale: 1, duration: 1.2, ease: "power2.out" });
          if (title) gsap.to(title, { x: 0, duration: 0.6, ease: "power2.out", color: "#fff" });
          if (componentWrapper) gsap.to(componentWrapper, { borderColor: "rgba(255,255,255,0.1)", duration: 0.5 });
        };

        item.addEventListener("mouseenter", handleMouseEnter);
        item.addEventListener("mouseleave", handleMouseLeave);
      });
    }, containerRef);

    return () => ctx.revert();
  }, [projects]); // Depend on projects so it updates on lang switch

  return (
    <section ref={containerRef} className="py-20 md:py-48 px-4 md:px-12 bg-black text-white relative z-10">
      <div className="flex flex-col gap-16 md:gap-48">
        {projects.map((project, index) => (
          <Link href={`/projects/${project.id}`} key={index} className="block project-item group cursor-pointer" data-cursor-text="VIEW">
            <div className="project-component-wrapper relative w-full h-[60vh] md:h-[80vh] overflow-hidden mb-8 md:mb-12 border border-white/10 bg-[#050505]">
              <div className="project-component w-full h-full transform transition-transform duration-700 ease-out pointer-events-none">
                 {project.component}
              </div>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/20 pb-4 md:pb-8">
              <div className="md:w-1/2">
                <h3 className="project-title text-5xl md:text-8xl font-bold tracking-tighter mb-2 md:mb-4">
                  {project.title}
                </h3>
                <p className="project-sub text-sm md:text-lg text-gray-400 tracking-widest uppercase">
                  {project.subtitle}
                </p>
              </div>
              <div className="md:w-1/2 flex flex-col items-end text-right">
                <p className="project-desc text-base md:text-lg text-gray-200 font-light leading-relaxed max-w-md mb-6 opacity-0 transform translate-y-4">
                  {project.description}
                </p>
                <span className="project-meta text-xs md:text-sm text-gray-500 font-mono flex items-center gap-2 group-hover:text-white transition-colors">
                  {t.projects.view} <span className="group-hover:translate-x-1 transition-transform">→</span>
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
