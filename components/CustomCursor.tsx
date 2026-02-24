"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [cursorText, setCursorText] = useState("");

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Move cursor
      const moveCursor = (e: MouseEvent) => {
        gsap.to(cursorRef.current, {
          x: e.clientX,
          y: e.clientY,
          duration: 0.1,
          ease: "power2.out",
        });
        gsap.to(followerRef.current, {
          x: e.clientX,
          y: e.clientY,
          duration: 0.5,
          ease: "power2.out",
        });
      };

      // Hover effects
      const handleMouseOver = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const isInteractive =
          target.tagName === "A" ||
          target.tagName === "BUTTON" ||
          target.closest("a") ||
          target.closest("button") ||
          target.classList.contains("cursor-pointer");

        const dataText = target.getAttribute("data-cursor-text") || target.closest("[data-cursor-text]")?.getAttribute("data-cursor-text");

        setIsHovering(!!isInteractive || !!dataText);
        setCursorText(dataText || "");
      };

      window.addEventListener("mousemove", moveCursor);
      window.addEventListener("mouseover", handleMouseOver);

      return () => {
        window.removeEventListener("mousemove", moveCursor);
        window.removeEventListener("mouseover", handleMouseOver);
      };
    });

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (isHovering) {
      gsap.to(followerRef.current, {
        scale: cursorText ? 4 : 3, // Larger scale if text is present
        opacity: 0.9, // More opaque for readability
        backgroundColor: "#fff",
        border: "none",
        duration: 0.3,
      });
      gsap.to(cursorRef.current, {
        scale: 0, // Hide center dot
        backgroundColor: "transparent",
        duration: 0.3,
      });
      if (textRef.current) {
          gsap.to(textRef.current, {
              opacity: 1,
              scale: 1,
              duration: 0.2,
              delay: 0.1
          });
      }
    } else {
      gsap.to(followerRef.current, {
        scale: 1,
        opacity: 0.6,
        backgroundColor: "transparent",
        border: "1px solid rgba(255, 255, 255, 0.5)",
        duration: 0.3,
      });
      gsap.to(cursorRef.current, {
        scale: 1,
        backgroundColor: "#fff",
        duration: 0.3,
      });
      if (textRef.current) {
          gsap.to(textRef.current, {
              opacity: 0,
              scale: 0.5,
              duration: 0.2
          });
      }
    }
  }, [isHovering, cursorText]);

  return (
    <>
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 w-2 h-2 bg-white rounded-full pointer-events-none z-[100] mix-blend-difference -translate-x-1/2 -translate-y-1/2 hidden md:block"
      />
      <div
        ref={followerRef}
        className="fixed top-0 left-0 w-8 h-8 border border-white/50 rounded-full pointer-events-none z-[99] mix-blend-difference -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center justify-center transition-transform duration-75 ease-out"
      >
          <span ref={textRef} className="text-[3px] font-bold text-black opacity-0 uppercase tracking-widest pointer-events-none">{cursorText}</span>
      </div>
      <style jsx global>{`
        @media (min-width: 768px) {
          body, a, button {
            cursor: none !important;
          }
        }
      `}</style>
    </>
  );
}
