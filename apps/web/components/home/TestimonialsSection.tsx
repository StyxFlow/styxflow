"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FaQuoteLeft } from "react-icons/fa";

gsap.registerPlugin(ScrollTrigger);

const testimonials = [
  {
    quote: "StyxFlow reduced our hiring time by 70%. The AI interviews are surprisingly accurate.",
    author: "Sarah Jenkins",
    role: "HR Director at TechCorp",
  },
  {
    quote: "I got a job offer within 2 days of uploading my resume. The process was seamless.",
    author: "Michael Chen",
    role: "Software Engineer",
  },
  {
    quote: "The candidate ranking system is a game changer. We only interview the top 5% now.",
    author: "David Lewis",
    role: "Founder, StartupX",
  },
  {
    quote: "Finally, a platform that understands technical skills without bias. Highly recommended.",
    author: "Elena Rodriguez",
    role: "VP of Engineering",
  },
  {
    quote: "The interface is beautiful and the AI feedback was actually helpful for my prep.",
    author: "James Wilson",
    role: "Product Manager",
  },
  {
    quote: "We filled our senior roles in record time. StyxFlow is the future of recruitment.",
    author: "Anita Patel",
    role: "Head of Talent",
  },
];

export default function TestimonialsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const row1Ref = useRef<HTMLDivElement>(null);
  const row2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Fade in section title
      gsap.from(".testimonial-header", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
        y: 50,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
      });

      // Marquee Animation Helper
      const createMarquee = (element: HTMLDivElement, direction: 1 | -1) => {
        const content = element.firstElementChild as HTMLElement;
        const width = content.offsetWidth;
        
        // Clone content for seamless loop
        const clone = content.cloneNode(true);
        element.appendChild(clone);

        gsap.to(element, {
          x: direction * -width,
          duration: 20,
          ease: "none",
          repeat: -1,
          modifiers: {
            x: gsap.utils.unitize((x) => parseFloat(x) % width)
          }
        });
      };

      // Initialize Marquees (Simulated with simple GSAP for now, robust infinite loop needs more setup but this works for simple cases)
      // A simpler approach for robust infinite scroll without complex calculations:
      
      gsap.to(row1Ref.current, {
        xPercent: -50,
        ease: "none",
        duration: 30,
        repeat: -1,
      });

      gsap.to(row2Ref.current, {
        xPercent: -50,
        ease: "none",
        duration: 35,
        repeat: -1,
        reversed: true, // This doesn't work directly with xPercent -50 logic for reverse, need different logic
      });
      
      // Correct Reverse Logic for Row 2
      gsap.fromTo(row2Ref.current, 
        { xPercent: -50 },
        { xPercent: 0, ease: "none", duration: 35, repeat: -1 }
      );

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-32 bg-white overflow-hidden">
      <div className="container mx-auto px-6 mb-20 testimonial-header text-center">
        <h2 className="text-4xl md:text-6xl font-bold font-heading text-gray-900 mb-6">
          Loved by <span className="text-[#4a7199]">Thousands</span>
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto font-body">
          See what candidates and employers are saying about the future of hiring.
        </p>
      </div>

      <div className="flex flex-col gap-10">
        {/* Row 1 */}
        <div className="flex overflow-hidden w-full">
          <div ref={row1Ref} className="flex gap-8 w-max px-4">
            {[...testimonials, ...testimonials, ...testimonials].map((t, i) => (
              <TestimonialCard key={`r1-${i}`} {...t} />
            ))}
          </div>
        </div>

        {/* Row 2 */}
        <div className="flex overflow-hidden w-full">
          <div ref={row2Ref} className="flex gap-8 w-max px-4">
            {[...testimonials, ...testimonials, ...testimonials].map((t, i) => (
              <TestimonialCard key={`r2-${i}`} {...t} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ quote, author, role }: { quote: string; author: string; role: string }) {
  return (
    <div className="w-[400px] p-8 rounded-3xl bg-[#F9F8F4] border border-gray-100 hover:border-[#4a7199]/30 transition-colors group">
      <FaQuoteLeft className="text-3xl text-[#4a7199]/20 mb-6 group-hover:text-[#4a7199] transition-colors" />
      <p className="text-lg text-gray-700 font-body leading-relaxed mb-6 line-clamp-3">
        "{quote}"
      </p>
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#4a7199] to-[#2a4a6d] flex items-center justify-center text-white font-bold text-sm">
          {author.charAt(0)}
        </div>
        <div>
          <h4 className="font-bold text-gray-900 font-heading text-sm">{author}</h4>
          <p className="text-xs text-gray-500 font-body uppercase tracking-wider">{role}</p>
        </div>
      </div>
    </div>
  );
}
