"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

const defaultSlides = [
  {
    eyebrow: "Premium Collection",
    title: "THE SIGNATURE CANVAS",
    description: "Heavyweight 280 GSM washed black cotton silhouette, printed with a high-definition matte black embossed finish.",
    image: "/hero_black_embossed.png",
    link: "/shop",
    glow: "rgba(30, 30, 30, 0.45)",
    watermark: "ARCHIVE 01",
    coord: "[45.38° N, 12.06° E]",
  },
  {
    eyebrow: "Atelier Series",
    title: "THE ATELIER SILHOUETTE",
    description: "Vintage taupe heavyweight cotton tailored with tonal contrast stitching and centered yourTee brand typography.",
    image: "/hero_taupe_studio.png",
    link: "/shop",
    glow: "rgba(212, 175, 55, 0.15)",
    watermark: "ATELIER 05",
    coord: "[51.50° N, 0.12° W]",
  },
  {
    eyebrow: "Exclusive Drop",
    title: "THE ARCHITECT SERIES",
    description: "Geometric line art printed in fine gold ink on heavyweight cotton, designed to structural proportions.",
    image: "/hero_architect_back.jpg",
    link: "/shop",
    glow: "rgba(212, 175, 55, 0.12)",
    watermark: "SERIES 03",
    coord: "[35.67° N, 139.65° E]",
  },
];

export function Hero() {
  const [slidesList, setSlidesList] = useState<any[]>(defaultSlides);
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right

  useEffect(() => {
    fetch("/api/hero")
      .then((r) => r.json())
      .then((data) => {
        if (data?.slides && data.slides.length > 0) {
          setSlidesList(data.slides);
        }
      })
      .catch((err) => console.error("Error loading dynamic hero slides:", err));
  }, []);

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const shirtY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const shirtScale = useTransform(scrollYProgress, [0, 1], [1, 1.07]);

  // 3D Tilt and Parallax Motion Values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 120 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  // Parallax layers transformations
  const glowX = useTransform(springX, [-1, 1], [-20, 20]);
  const glowY = useTransform(springY, [-1, 1], [-20, 20]);

  const textX = useTransform(springX, [-1, 1], [-15, 15]);
  const textY = useTransform(springY, [-1, 1], [-15, 15]);

  const accentX = useTransform(springX, [-1, 1], [12, -12]);
  const accentY = useTransform(springY, [-1, 1], [12, -12]);

  const shirtParallaxX = useTransform(springX, [-1, 1], [35, -35]);
  const shirtParallaxY = useTransform(springY, [-1, 1], [35, -35]);

  const shirtRotateX = useTransform(springY, [-1, 1], [12, -12]);
  const shirtRotateY = useTransform(springX, [-1, 1], [-12, 12]);

  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 6500);
    return () => clearInterval(timer);
  }, [current, slidesList]);

  const handlePrev = () => {
    setDirection(-1);
    setCurrent((prev) => (prev === 0 ? slidesList.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setDirection(1);
    setCurrent((prev) => (prev === slidesList.length - 1 ? 0 : prev + 1));
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    mouseX.set(x);
    mouseY.set(y);
    setHovered(true);
  };

  const handleMouseLeave = () => {
    setHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir < 0 ? "100%" : "-100%",
      opacity: 0,
    }),
  };

  return (
    <section ref={heroRef} style={{ position: "relative" }} className="relative min-h-[90vh] lg:min-h-screen w-full overflow-hidden bg-bg border-b border-ink/10">
      {/* Scroll-progress accent line */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-ink/5" />

      {/* Slide Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[90vh] lg:min-h-screen pt-20 lg:pt-0">
        
        {/* Left Side: Editorial Slide Content Card */}
        <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-20 bg-surface/20 relative z-10">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={current}
              custom={direction}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-md w-full"
            >
              <div className="inline-flex items-center gap-1.5 border border-gold/15 bg-surface/80 px-3 py-1 text-[9px] uppercase tracking-[0.25em] text-gold/90 rounded-full">
                <Sparkles size={10} />
                {slidesList[current]?.eyebrow}
              </div>

              <h1 className="mt-6 font-serif text-4xl sm:text-5xl lg:text-6xl font-light leading-[1.15] tracking-tight text-ink uppercase">
                {slidesList[current]?.title}
              </h1>

              <p className="mt-4 text-xs sm:text-sm leading-relaxed text-muted">
                {slidesList[current]?.description}
              </p>

              <div className="mt-8">
                <Link
                  href={slidesList[current]?.link || "/shop"}
                  className="group relative inline-flex items-center gap-2.5 overflow-hidden bg-[#0c0a06] hover:bg-gold border border-gold/45 text-gold hover:text-[#0c0a06] font-semibold tracking-luxe uppercase text-[10px] rounded-full px-9 py-4 transition-all duration-500 hover:shadow-[0_0_35px_rgba(212,175,55,0.25)]"
                >
                  <span className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-[250%] transition-transform duration-1000 ease-out" />
                  Shop Collection
                  <span className="group-hover:translate-x-1.5 transition-transform duration-300">→</span>
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Indicators Dots */}
          <div className="flex gap-2.5 mt-16 items-center">
            {slidesList.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setDirection(idx > current ? 1 : -1);
                  setCurrent(idx);
                }}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  idx === current ? "w-8 bg-gold" : "w-1.5 bg-ink/15 hover:bg-ink/30"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Right Side: Showcase Product Image with 3D Parallax Depth Layers */}
        <motion.div
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={handleMouseLeave}
          style={{
            y: shirtY,
            scale: shirtScale,
            transformStyle: "preserve-3d",
            transformPerspective: 1000,
          }}
          className="relative h-[50vh] sm:h-[60vh] lg:h-full bg-surface/35 overflow-hidden flex items-center justify-center cursor-crosshair z-0"
        >
          {/* Dynamic ambient color glow Layer */}
          <motion.div
            className="absolute left-1/2 top-1/2 w-96 h-96 rounded-full blur-[120px] pointer-events-none transition-all duration-1000 z-0"
            style={{
              backgroundColor: slidesList[current]?.glow || "rgba(212,175,55,0.15)",
              x: glowX,
              y: glowY,
              translateX: "-50%",
              translateY: "-50%",
            }}
          />

          {/* Large Typographical Watermark Layer */}
          <motion.div 
            className="absolute inset-0 pointer-events-none flex items-center justify-center select-none z-0"
            style={{
              x: textX,
              y: textY,
            }}
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={current}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.6 }}
                className="font-sans text-[90px] sm:text-[140px] font-black tracking-[0.25em] text-ink/[0.025] dark:text-white/[0.015] select-none"
              >
                {slidesList[current]?.watermark}
              </motion.span>
            </AnimatePresence>
          </motion.div>

          {/* Grid Layout Accents Layer */}
          <motion.div 
            className="absolute inset-0 pointer-events-none z-0 opacity-20"
            style={{
              x: accentX,
              y: accentY,
            }}
          >
            <span className="absolute left-6 top-6 text-[8px] font-mono uppercase tracking-widest text-muted/60">{slidesList[current]?.coord}</span>
            <span className="absolute right-6 top-6 text-[8px] font-mono uppercase tracking-widest text-gold font-medium">DROP SYSTEM v1.0.4</span>
            <span className="absolute left-6 bottom-6 text-[8px] font-mono uppercase tracking-widest text-muted/60">YOURTEE ATELIER</span>
            
            {/* Fine framing border crosses */}
            <span className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-px bg-ink/10" />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-px bg-ink/10" />
          </motion.div>

          {/* Pop-Out T-Shirt Layer */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={current}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 32 },
                opacity: { duration: 0.4 },
              }}
              style={{
                transformStyle: "preserve-3d",
                x: shirtParallaxX,
                y: shirtParallaxY,
                rotateX: shirtRotateX,
                rotateY: shirtRotateY,
                transformPerspective: 1000,
              }}
              className="absolute inset-0 w-full h-full flex items-center justify-center z-10"
            >
              <Image
                src={slidesList[current]?.image || "/product_white_embossed.jpg"}
                alt={slidesList[current]?.title || ""}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain p-8 lg:p-20 select-none drop-shadow-[0_12px_24px_rgba(0,0,0,0.12)] z-10 pointer-events-none"
                unoptimized
              />
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Navigation Controls Left / Right arrows */}
      <button
        onClick={handlePrev}
        className="absolute left-6 bottom-6 lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2 z-20 h-10 w-10 rounded-full border border-ink/15 bg-bg/85 backdrop-blur-sm flex items-center justify-center text-ink hover:bg-gold hover:text-black hover:border-gold transition-all duration-300 shadow-sm hover:scale-105 active:scale-95"
        aria-label="Previous Slide"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        onClick={handleNext}
        className="absolute right-6 bottom-6 lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2 z-20 h-10 w-10 rounded-full border border-ink/15 bg-bg/85 backdrop-blur-sm flex items-center justify-center text-ink hover:bg-gold hover:text-black hover:border-gold transition-all duration-300 shadow-sm hover:scale-105 active:scale-95"
        aria-label="Next Slide"
      >
        <ChevronRight size={18} />
      </button>
    </section>
  );
}
