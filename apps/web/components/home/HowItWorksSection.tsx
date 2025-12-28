"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FaUserPlus, FaRobot, FaHandshake } from "react-icons/fa";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    id: "01",
    title: "Create Profile",
    description:
      "Sign up and upload your resume or post a job. Our AI parses details instantly to build a comprehensive profile.",
    icon: <FaUserPlus />,
    color: "bg-[#4a7199]",
  },
  {
    id: "02",
    title: "AI Screening",
    description:
      "Candidates complete AI-driven interviews. We analyze soft skills, technical knowledge, and cultural fit automatically.",
    icon: <FaRobot />,
    color: "bg-[#3b5c7d]",
  },
  {
    id: "03",
    title: "Perfect Match",
    description:
      "Get instant, ranked recommendations. Connect with the best fit candidates or companies within seconds.",
    icon: <FaHandshake />,
    color: "bg-[#2a4a6d]",
  },
];

export default function HowItWorksSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>(".how-it-works-card");

      // Horizontal Scroll Tween
      const scrollTween = gsap.to(cards, {
        xPercent: -100 * (cards.length - 1),
        ease: "none",
        scrollTrigger: {
          trigger: triggerRef.current,
          pin: true,
          scrub: 1,
          snap: 1 / (cards.length - 1),
          end: () => "+=" + window.innerHeight * 2,
        },
      });

      // Text Reveal Animations
      cards.forEach((card, i) => {
        const texts = card.querySelectorAll(".reveal-text");
        const icon = card.querySelector(".reveal-icon");

        if (i === 0) {
          // First card animates on vertical scroll into view
          gsap.from([texts, icon], {
            y: 50,
            opacity: 0,
            duration: 1,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: triggerRef.current,
              start: "top 60%",
              toggleActions: "play none none reverse",
            },
          });
        } else {
          // Subsequent cards animate on horizontal scroll
          gsap.from([texts, icon], {
            y: 50,
            opacity: 0,
            duration: 1,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              containerAnimation: scrollTween,
              start: "left 60%",
              toggleActions: "play none none reverse",
            },
          });
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="bg-white overflow-hidden">
      <div
        ref={triggerRef}
        className="h-screen w-full relative flex items-center overflow-hidden"
      >
        <div
          ref={containerRef}
          className="flex flex-nowrap h-full w-[300vw] bg-linear-to-br from-white via-cream/70 to-cream"
        >
          {steps.map((step, index) => (
            <div
              key={index}
              className="how-it-works-card w-screen h-screen shrink-0 flex items-center justify-center relative overflow-hidden px-6 md:px-20 bg-transparent"
            >
              <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="order-2 md:order-1">
                  <div className="reveal-text text-8xl md:text-[12rem] font-bold text-gray-200 font-heading leading-none mb-6 select-none">
                    {step.id}
                  </div>
                  <h3 className="reveal-text text-4xl md:text-6xl font-bold text-gray-900 mb-8 font-heading">
                    {step.title}
                  </h3>
                  <p className="reveal-text text-xl md:text-2xl text-gray-600 font-body leading-relaxed max-w-xl">
                    {step.description}
                  </p>
                </div>

                <div className="order-1 md:order-2 flex justify-center">
                  <div
                    className={`reveal-icon w-40 h-40 md:w-64 md:h-64 rounded-[3rem] ${step.color} flex items-center justify-center text-white text-6xl md:text-8xl shadow-2xl transform hover:scale-105 transition-transform duration-500`}
                  >
                    {step.icon}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
