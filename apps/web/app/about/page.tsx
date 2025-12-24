"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import Link from "next/link";
import {
  FaRobot,
  FaBrain,
  FaUsers,
  FaChartLine,
  FaShieldAlt,
  FaClock,
  FaLightbulb,
  FaHandshake,
  FaTwitter,
  FaLinkedin,
  FaGithub,
} from "react-icons/fa";
import { HiOutlineMail } from "react-icons/hi";

gsap.registerPlugin(ScrollTrigger);

const coreValues = [
  {
    icon: <FaLightbulb className="text-3xl text-main" />,
    title: "Innovation First",
    description:
      "We leverage cutting-edge AI to transform traditional hiring into an intelligent, data-driven process.",
  },
  {
    icon: <FaShieldAlt className="text-3xl text-main" />,
    title: "Fair & Unbiased",
    description:
      "Our AI evaluates candidates on skills and potential, not demographics—ensuring equal opportunity for all.",
  },
  {
    icon: <FaClock className="text-3xl text-main" />,
    title: "Time is Valuable",
    description:
      "We believe both recruiters and candidates deserve a faster, more efficient hiring experience.",
  },
  {
    icon: <FaHandshake className="text-3xl text-main" />,
    title: "Human-Centered",
    description:
      "Technology should enhance human decision-making, not replace it. We keep people at the core.",
  },
];

const stats = [
  { value: "2024", label: "Founded" },
  { value: "AI-First", label: "Approach" },
  { value: "Global", label: "Vision" },
  { value: "24/7", label: "AI Availability" },
];

const teamFocus = [
  {
    icon: <FaRobot className="text-2xl text-main" />,
    title: "AI & Machine Learning",
    description:
      "Building intelligent interview systems that understand context and evaluate fairly.",
  },
  {
    icon: <FaBrain className="text-2xl text-main" />,
    title: "Natural Language Processing",
    description:
      "Enabling seamless voice interactions and smart resume parsing.",
  },
  {
    icon: <FaUsers className="text-2xl text-main" />,
    title: "User Experience",
    description:
      "Creating intuitive interfaces for both recruiters and candidates.",
  },
  {
    icon: <FaChartLine className="text-2xl text-main" />,
    title: "Data Analytics",
    description: "Providing actionable insights to improve hiring decisions.",
  },
];

export default function AboutPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const missionRef = useRef<HTMLDivElement>(null);
  const valuesRef = useRef<HTMLDivElement>(null);
  const teamRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize Lenis smooth scroll
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

    // GSAP animations
    const ctx = gsap.context(() => {
      // Hero animation
      gsap.from(".about-hero-content > *", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
      });

      // Mission section
      gsap.from(".mission-content", {
        scrollTrigger: {
          trigger: missionRef.current,
          start: "top 80%",
        },
        y: 60,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      });

      // Stats animation
      gsap.from(".stat-item", {
        scrollTrigger: {
          trigger: ".stats-container",
          start: "top 85%",
        },
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power3.out",
      });

      // Values cards
      gsap.from(".value-card", {
        scrollTrigger: {
          trigger: valuesRef.current,
          start: "top 75%",
        },
        y: 80,
        opacity: 0,
        duration: 0.7,
        stagger: 0.15,
        ease: "power3.out",
      });

      // Team focus cards
      gsap.from(".team-card", {
        scrollTrigger: {
          trigger: teamRef.current,
          start: "top 75%",
        },
        y: 60,
        opacity: 0,
        duration: 0.7,
        stagger: 0.12,
        ease: "power3.out",
      });
    });

    return () => {
      ctx.revert();
      lenis.destroy();
    };
  }, []);

  return (
    <main className="bg-[#F9F8F4] min-h-screen selection:bg-main selection:text-white">
      {/* Hero Section */}
      <section ref={heroRef} className="relative pt-32 pb-20 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]" />
          <div className="absolute left-1/2 top-20 -translate-x-1/2 h-[400px] w-[600px] rounded-full bg-main/20 blur-[100px]" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="about-hero-content max-w-4xl mx-auto text-center">
            <div className="inline-block mb-6 px-4 py-1.5 rounded-full border border-gray-200 bg-white/50 backdrop-blur-sm text-sm font-medium text-gray-600">
              About StyxFlow
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-gray-900 mb-8 leading-[1.1] font-heading">
              Reimagining how the world{" "}
              <span className="text-main">hires talent</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed font-body">
              StyxFlow is an AI-powered recruitment platform that conducts
              intelligent interviews, matches candidates with precision, and
              helps companies build exceptional teams faster than ever before.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section ref={missionRef} className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="mission-content max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tighter text-gray-900 mb-6 font-heading">
                  Our Mission
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed font-body mb-6">
                  Traditional hiring is broken. Recruiters spend countless hours
                  screening resumes and conducting repetitive interviews, while
                  qualified candidates get overlooked due to unconscious bias or
                  simply being lost in the pile.
                </p>
                <p className="text-lg text-gray-600 leading-relaxed font-body">
                  We built StyxFlow to change that. Our AI-powered platform
                  automates initial interviews, evaluates candidates fairly
                  based on their actual skills, and delivers ranked
                  recommendations in seconds—not weeks.
                </p>
              </div>
              <div className="bg-[#F9F8F4] rounded-3xl p-8">
                <blockquote className="text-xl md:text-2xl font-medium text-gray-900 leading-relaxed font-heading">
                  &ldquo;Every candidate deserves a fair chance. Every company
                  deserves the best talent. AI makes both possible.&rdquo;
                </blockquote>
                <p className="mt-6 text-gray-600 font-body">
                  — The StyxFlow Team
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-main">
        <div className="container mx-auto px-6">
          <div className="stats-container grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="stat-item text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2 font-heading">
                  {stat.value}
                </div>
                <div className="text-white/80 font-body">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section ref={valuesRef} className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tighter text-gray-900 mb-6 font-heading">
              What We Believe
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto font-body">
              Our values guide every decision we make—from the algorithms we
              build to the experiences we create.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreValues.map((value, index) => (
              <div
                key={index}
                className="value-card p-6 rounded-2xl bg-[#F9F8F4] hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-gray-100"
              >
                <div className="mb-4 p-3 rounded-xl bg-white inline-block shadow-sm">
                  {value.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 font-heading">
                  {value.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed font-body">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Summary */}
      <section className="py-24 bg-[#F9F8F4]">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tighter text-gray-900 mb-6 font-heading">
              How StyxFlow Works
            </h2>
            <p className="text-lg text-gray-600 font-body">
              A seamless experience for both recruiters and candidates.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-main text-white text-2xl font-bold flex items-center justify-center mx-auto mb-6 font-heading">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 font-heading">
                Post a Job
              </h3>
              <p className="text-gray-600 font-body">
                Recruiters create job postings with requirements. Our AI
                analyzes and prepares tailored interview questions.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-main text-white text-2xl font-bold flex items-center justify-center mx-auto mb-6 font-heading">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 font-heading">
                AI Interviews
              </h3>
              <p className="text-gray-600 font-body">
                Candidates complete voice-based AI interviews at their
                convenience. No scheduling hassles.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-main text-white text-2xl font-bold flex items-center justify-center mx-auto mb-6 font-heading">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 font-heading">
                Get Ranked Results
              </h3>
              <p className="text-gray-600 font-body">
                Receive a ranked list of candidates with AI-generated insights
                and recommendations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Focus Section */}
      <section ref={teamRef} className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tighter text-gray-900 mb-6 font-heading">
              Our Focus Areas
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto font-body">
              We&apos;re a team of engineers, designers, and AI researchers
              passionate about transforming recruitment.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamFocus.map((item, index) => (
              <div
                key={index}
                className="team-card p-6 rounded-2xl border border-gray-100 hover:border-main/30 hover:shadow-lg transition-all duration-300"
              >
                <div className="mb-4 p-3 rounded-xl bg-[#F9F8F4] inline-block">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 font-heading">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed font-body">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-main">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 font-heading">
            Ready to transform your hiring?
          </h2>
          <p className="text-lg text-white/80 mb-10 max-w-xl mx-auto font-body">
            Join forward-thinking companies using AI to find the best talent
            faster.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="px-8 py-4 bg-white text-main font-semibold rounded-full hover:bg-gray-100 transition-colors duration-300 font-body"
            >
              Get Started Free
            </Link>
            <Link
              href="/"
              className="px-8 py-4 border-2 border-white text-white font-semibold rounded-full hover:bg-white/10 transition-colors duration-300 font-body"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-[#F9F8F4]">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 font-heading">
              Get in Touch
            </h2>
            <p className="text-gray-600 mb-8 font-body">
              Have questions about StyxFlow? We&apos;d love to hear from you.
            </p>
            <div className="flex items-center justify-center gap-2 text-main mb-8">
              <HiOutlineMail className="text-xl" />
              <a
                href="mailto:hello@styxflow.io"
                className="text-lg font-medium hover:underline font-body"
              >
                hello@styxflow.io
              </a>
            </div>
            <div className="flex justify-center gap-6">
              <a
                href="#"
                className="text-gray-400 hover:text-main transition-colors text-2xl"
                aria-label="Twitter"
              >
                <FaTwitter />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-main transition-colors text-2xl"
                aria-label="LinkedIn"
              >
                <FaLinkedin />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-main transition-colors text-2xl"
                aria-label="GitHub"
              >
                <FaGithub />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-white border-t border-gray-200">
        <div className="container mx-auto px-6 text-center">
          <p className="text-gray-500 text-sm font-body">
            © {new Date().getFullYear()} StyxFlow. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
