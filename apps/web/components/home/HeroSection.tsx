"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";

gsap.registerPlugin(ScrollTrigger);

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const blobRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Initial reveal animation
      gsap.from(textRef.current!.children, {
        y: 50,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out",
      });

      // Morphing blob animation (continuous)
      gsap.to(blobRef.current, {
        borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%",
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // Scroll-based parallax/morph for the blob
      gsap.to(blobRef.current, {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
        y: 200,
        scale: 1.2,
        rotate: 45,
      });

      // Grid Zoom Animation
      gsap.to(gridRef.current, {
        scale: 1.5,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-cream pt-20"
    >
      {/* Subtle Background */}
      <div className="absolute inset-0 z-0">
        <div 
          ref={gridRef}
          className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px] origin-center"
        ></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-main opacity-20 blur-[100px]"></div>
        <div 
          ref={blobRef}
          className="absolute right-0 top-1/2 -translate-y-1/2 w-160 h-160 bg-linear-to-br from-main/10 to-main/5 blur-3xl rounded-[60%_40%_30%_70%/60%_30%_70%_40%]"
        />
      </div>

      <div className="container mx-auto px-6 relative z-10 text-center">
        <div ref={textRef} className="max-w-4xl mx-auto">
          <div className="inline-block mb-6 px-4 py-1.5 rounded-full border border-gray-200 bg-white/50 backdrop-blur-sm text-sm font-medium text-gray-600">
            Reimagining Recruitment with AI
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-gray-900 mb-8 leading-[1.1] font-heading">
            Find the perfect match <br />
            <span className="text-main">in seconds.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed font-body">
            The AI-powered job portal that interviews candidates for you. 
            Save time, reduce bias, and hire the best talent effortlessly.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/register"
              className="px-8 py-4 rounded-full bg-main text-white text-lg font-medium hover:bg-[#3b5c7d] transition-all hover:scale-105 active:scale-95 shadow-lg shadow-main/20"
            >
              Start Hiring Now
            </Link>
            <Link
              href="#how-it-works"
              className="px-8 py-4 rounded-full bg-white text-gray-900 border border-gray-200 text-lg font-medium hover:bg-gray-50 transition-all hover:scale-105 active:scale-95"
            >
              See How it Works
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-gray-300 flex justify-center pt-2">
          <div className="w-1 h-2 bg-gray-400 rounded-full" />
        </div>
      </div>
    </section>
  );
}
