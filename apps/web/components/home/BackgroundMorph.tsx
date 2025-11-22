"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function BackgroundMorph() {
  const blobRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const blob = blobRef.current;
    
    // Continuous morphing (breathing effect)
    gsap.to(blob, {
      borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
      duration: 8,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

    // Scroll-based movement and shape change
    gsap.to(blob, {
      scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
      },
      x: "50vw",
      y: "80vh",
      scale: 1.5,
      rotation: 180,
      borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%",
      backgroundColor: "rgba(74, 113, 153, 0.08)", // Slight color shift
      ease: "none",
    });
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div
        ref={blobRef}
        className="absolute -top-[20%] -left-[10%] w-[50vw] h-[50vw] bg-[#4a7199]/5 blur-[100px] rounded-[40%_60%_70%_30%/40%_50%_60%_50%]"
      />
    </div>
  );
}
