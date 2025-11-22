"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";

gsap.registerPlugin(ScrollTrigger);

export default function CTASection() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(containerRef.current, {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
        },
        y: 50,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="py-32 px-6 bg-[#F9F8F4]">
      <div
        ref={containerRef}
        className="container mx-auto max-w-5xl bg-[#4a7199] rounded-[3rem] p-12 md:p-24 text-center text-white relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        
        <div className="relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold font-heading mb-8">
            Ready to Transform Your Hiring?
          </h2>
          <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-2xl mx-auto font-body">
            Join thousands of companies and candidates using StyxFlow today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="px-8 py-4 rounded-full bg-white text-[#4a7199] text-lg font-bold hover:bg-gray-100 transition-transform hover:scale-105 active:scale-95"
            >
              Get Started for Free
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
