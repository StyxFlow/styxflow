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
    description: "Our AI conducts initial interviews based on resumes, evaluating soft skills and technical knowledge automatically.",
  },
  {
    icon: <FaFileAlt className="text-4xl text-main" />,
    title: "Smart Resume Matching",
    description: "Advanced algorithms analyze resumes to find the perfect alignment with your job requirements.",
  },
  {
    icon: <FaBolt className="text-4xl text-main" />,
    title: "Instant Recommendations",
    description: "Get a ranked list of top candidates within seconds of posting a job. No more manual screening.",
  },
  {
    icon: <FaUserCheck className="text-4xl text-main" />,
    title: "Unbiased Evaluation",
    description: "Standardized AI evaluation ensures every candidate gets a fair chance, reducing unconscious bias.",
  },
];

export default function FeaturesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title animation
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

      // Cards staggered animation
      gsap.from(cardsRef.current!.children, {
        scrollTrigger: {
          trigger: cardsRef.current,
          start: "top 75%",
        },
        y: 100,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="features" ref={sectionRef} className="py-32 bg-white relative z-10">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20 feature-title">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-gray-900 mb-6 font-heading">
            Why Choose StyxFlow?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto font-body">
            Streamline your hiring process with cutting-edge AI technology designed for modern recruitment.
          </p>
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-8 rounded-3xl bg-[#F9F8F4] hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-gray-100 group"
            >
              <div className="mb-6 p-4 rounded-2xl bg-white inline-block shadow-sm group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 font-heading">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed font-body">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
