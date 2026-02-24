"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Header from "@/components/Header";
import Intro from "@/components/Intro";
import Hero from "@/components/Hero";
import CustomCursor from "@/components/CustomCursor";
import PerformanceMonitor from "@/components/PerformanceMonitor";

// Lazy load heavy sections
const Manifesto = dynamic(() => import("@/components/Manifesto"), { ssr: false });
const Projects = dynamic(() => import("@/components/Projects"), { ssr: false });
const About = dynamic(() => import("@/components/About"), { ssr: false });
const Stack = dynamic(() => import("@/components/Stack"), { ssr: false });
const Contact = dynamic(() => import("@/components/Contact"), { ssr: false });

export default function Home() {
  const [introFinished, setIntroFinished] = useState(false);

  useEffect(() => {
    if (!introFinished) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [introFinished]);

  return (
    <main className="bg-black min-h-screen w-full text-white selection:bg-white selection:text-black relative">
      <div className="fixed inset-0 z-[60] pointer-events-none opacity-[0.03] mix-blend-overlay" 
           style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}>
       </div>
       
       <CustomCursor />
       <PerformanceMonitor />
       {!introFinished && <Intro onComplete={() => setIntroFinished(true)} />}
       
       <Header />
      <Hero startAnimation={introFinished} />
      <Manifesto />
      <Projects />
      <About />
      <Stack />
      <Contact />
    </main>
  );
}
