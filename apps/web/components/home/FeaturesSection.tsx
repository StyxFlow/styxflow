"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FaRobot, FaFileAlt, FaBolt, FaUserCheck } from "react-icons/fa";

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: <FaRobot className="text-4xl text-main" />,
    title: "AI Interviews",
    description:
      "Our AI conducts initial interviews based on resumes, evaluating soft skills and technical knowledge automatically.",
  },
  {
    icon: <FaFileAlt className="text-4xl text-main" />,
    title: "Smart Resume Matching",
    description:
      "Advanced algorithms analyze resumes to find the perfect alignment with your job requirements.",
  },
  {
    icon: <FaBolt className="text-4xl text-main" />,
    title: "Instant Recommendations",
    description:
      "Get a ranked list of top candidates within seconds of posting a job. No more manual screening.",
  },
  {
    icon: <FaUserCheck className="text-4xl text-main" />,
    title: "Unbiased Evaluation",
    description:
      "Standardized AI evaluation ensures every candidate gets a fair chance, reducing unconscious bias.",
  },
];

export default function FeaturesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null); // Ref for the curve

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Title & Card Entrance Animations (Kept same as before)
      gsap.from(".feature-title", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
        y: 50,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
      });
    }, sectionRef);

    // 2. THE ELASTIC WARP ANIMATION
    // We target the SVG Filter (texture) AND the SVG Path (shape)
    const displacementMap = document.querySelector(".displacement-node");

    // Helper to set the curve path
    // curveY: 0 = Flat. Positive = Curve Down. Negative = Curve Up.
    const setPath = (curveY: number) => {
      if (!pathRef.current) return;
      // const width = 100; // working in percentage for width
      const height = 200; // arbitrary height units for the SVG viewbox
      const startY = 100; // The "flat" baseline

      // Quadratic Bezier Curve: Q controlPointX controlPointY, endX endY
      // We keep the ends flat at 100, and pull the middle (50) to (100 + curveY)
      const d = `M 0,${startY} Q 50,${startY + curveY} 100,${startY} V ${height} H 0 Z`;
      pathRef.current.setAttribute("d", d);
    };

    const proxy = {
      curve: 0, // Tracks the bend of the top border
      distortion: 0, // Tracks the liquid ripple intensity
    };

    ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top bottom",
      end: "bottom top",
      onUpdate: (self) => {
        const velocity = self.getVelocity();

        // INTENSITY TWEAKS:
        // 1. Changed divisor from 15 to 5 (3x more sensitive to scroll speed)
        // 2. Changed max clamp from 100 to 150 (allows deeper stretch)
        const sensitivity = 10;
        const maxStretch = 150;

        const targetCurve = Math.max(
          Math.min(velocity / sensitivity, maxStretch),
          -maxStretch
        );

        // 3. Increased texture distortion intensity (optional)
        const targetDistortion = Math.min(Math.abs(velocity / 100), 100);

        gsap.to(proxy, {
          curve: -targetCurve,
          distortion: targetDistortion,
          duration: 0.8, // Slightly longer duration to let the wobble play out

          // ELASTIC PHYSICS:
          // elastic.out(amplitude, period)
          // 1.2 = Overshoot amount (higher = more bounce)
          // 0.4 = Period (lower = faster/tighter wobbles)
          ease: "elastic.out(1.2, 0.4)",

          overwrite: true,
          onUpdate: () => {
            setPath(proxy.curve);
            if (displacementMap) {
              displacementMap.setAttribute("scale", `${proxy.distortion}`);
            }
          },
        });
      },
    });

    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <section
      id="features"
      ref={sectionRef}
      className="relative z-10 bg-main -mx-4 top-[75px] " // Added pt-10 to account for curve overlapping
      // Removed skewY transform here
      style={{
        // We keep the filter for the "texture" ripple, but the shape comes from the SVG
        filter: "url(#liquid-distortion)",
        willChange: "filter",
      }}
    >
      {/* ELASTIC SVG HEADER 
        This sits absolutely at the top, pulling upwards/downwards visually 
      */}
      <div className="absolute top-0 left-0 w-full overflow-visible -translate-y-[99%]">
        <svg
          viewBox="0 0 100 200" // 0 to 100 width, 0 to 200 height
          preserveAspectRatio="none"
          className="w-full h-[150px] fill-main pointer-events-none block"
        >
          <path ref={pathRef} d="M 0,100 Q 50,100 100,100 V 200 H 0 Z" />
        </svg>
      </div>

      <div className="container mx-auto px-6 py-12  min-h-screen bg-main flex flex-col justify-center items-center">
        <div className="text-center mb-20 feature-title">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-cream mb-6 font-heading">
            <span className="font-mark font-extralight">Why </span>
            Choose StyxFlow?
          </h2>
          <p className="text-xl max-w-2xl mx-auto font-body text-white/50">
            Streamline your hiring process with cutting-edge AI technology
            designed for modern recruitment.
          </p>
        </div>

        <div
          ref={cardsRef}
          className="grid  grid-cols-1 md:grid-cols-2 lg:grid-cols-4  gap-8"
        >
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-8 rounded-3xl bg-[#F9F8F4] hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-gray-100 group"
            >
              <div className="mb-6 p-4 rounded-2xl bg-white inline-block shadow-sm group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl  font-bold text-main mb-4 font-heading">
                {feature.title}
              </h3>
              <p className="text-gray-600/80 leading-relaxed font-body">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
