"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import HeroSection from "./HeroSection";
import FeaturesSection from "./FeaturesSection";
import HowItWorksSection from "./HowItWorksSection";
import TestimonialsSection from "./TestimonialsSection";
import CTASection from "./CTASection";
import Footer from "./Footer";
import BackgroundMorph from "./BackgroundMorph";

export default function LandingPage() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <main className="bg-[#F9F8F4] min-h-screen overflow-hidden selection:bg-main selection:text-white relative">
      <BackgroundMorph />
      <div className="relative z-10 ">
        <HeroSection />
        <div className="bg-cream">
          <FeaturesSection />
        </div>
        <HowItWorksSection />
        <TestimonialsSection />
        <CTASection />
        <Footer />
      </div>
    </main>
  );
}
