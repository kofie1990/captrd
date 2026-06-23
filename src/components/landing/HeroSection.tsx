"use client";

import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const WORDS = ["the unseen", "the candid", "the raw", "the fleeting", "the moments", "the magic"];

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % WORDS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Parallax on scroll
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // 3D Tilt Effect on mouse move
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [15, -15]), { stiffness: 150, damping: 20 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-15, 15]), { stiffness: 150, damping: 20 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = e.clientX / innerWidth - 0.5;
      const y = e.clientY / innerHeight - 0.5;
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div ref={containerRef} className="relative min-h-screen flex flex-col items-center justify-center pt-8 pb-20 overflow-hidden bg-grain">
      {/* Background Gradient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[50vw] h-[50vw] bg-white/5 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-1/4 right-1/4 w-[40vw] h-[40vw] bg-white/5 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />

      <motion.div
        style={{ y: textY, opacity }}
        className="relative z-20 flex flex-col items-center text-center px-6 max-w-5xl mx-auto w-full mt-10 md:mt-0"
      >
        {/* <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span className="text-xs font-mono tracking-widest uppercase text-white/80">Live Beta Available</span>
        </motion.div> */}

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="font-serif lg:mt-[50px] mt-[-25px] text-[4.5rem] leading-[0.9] md:text-[6rem] lg:text-[7rem] tracking-tighter text-white drop-shadow-2xl mb-8"
        >
          captr <br />
          <span className="relative inline-grid place-items-center h-[1.0em] align-bottom">
            {/* Invisible placeholder ensures container is perfectly wide enough for all words */}
            <span className="invisible col-start-1 row-start-1 whitespace-nowrap italic font-light">
              the moments
            </span>
            <AnimatePresence mode="wait">
              <motion.span
                key={wordIndex}
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                exit={{ y: "-100%", opacity: 0 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="col-start-1 row-start-1 italic font-light text-white/60 whitespace-nowrap"
              >
                {WORDS[wordIndex]}
              </motion.span>
            </AnimatePresence>
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-md md:text-2xl text-white/60 max-w-2xl font-light leading-snug mb-12"
        >
          Recreate the disposable camera experience for modern events. Curated aesthetics, delayed reveals, and a shared film roll for everyone present.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col mt-[-20px] sm:flex-row gap-6 mb-8 items-center relative z-30"
        >
          <Link href="/dashboard/create" className="group relative inline-flex h-14 items-center justify-center overflow-hidden rounded-full bg-white px-8 font-medium text-black transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_8px_rgba(255,255,255,0.2)]">
            <span className="font-mono text-sm tracking-widest uppercase">Create an Event</span>
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link href="#timeline" className="font-mono text-sm tracking-widest uppercase py-4 px-8 rounded-full text-white/60 hover:text-white transition-colors">
            See how it works
          </Link>
        </motion.div>
      </motion.div>

      {/* 3D Interactive Device Mockups */}
      <motion.div
        className="relative z-10 w-full max-w-[500px] md:max-w-[700px] mx-auto md:mt-24 px-4"
        style={{ perspective: 2000 }}
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          animate={{ y: [0, -15, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
          className="relative w-full aspect-[4/3] flex items-center justify-center group"
        >
          {/* Dynamic Glow/Shadow behind the phones */}
          <motion.div
            style={{ z: -100 }}
            className="absolute inset-0 bg-white/10 blur-[80px] md:blur-[100px] rounded-full scale-75 group-hover:bg-white/20 group-hover:scale-90 transition-all duration-700 pointer-events-none"
          />

          {/* Left Phone: Camera Screen (Back) */}
          <motion.img
            src="/party_gallary.png"
            alt="Gallery Demo"
            className="absolute w-[55%] sm:w-[45%] h-auto object-contain drop-shadow-2xl transition-all duration-700 ease-out z-0 cursor-crosshair"
            style={{
              x: "-35%",
              y: "5%",
              z: -40,
              rotateZ: 0,
              filter: "brightness(0.6) contrast(1.1)"
            }}
            whileHover={{ scale: 1.05, filter: "brightness(1) contrast(1.1)", z: 10 }}
          />

          {/* Right Phone: Gallery (Front) */}
          <motion.img
            src="/party_cam.png"
            alt="Camera Screen Demo"
            className="absolute w-[60%] sm:w-[50%] h-auto object-contain drop-shadow-2xl transition-all duration-700 ease-out z-10 cursor-pointer"
            style={{
              x: "25%",
              y: "-10%",
              z: 60,
              rotateZ: 0
            }}
            whileHover={{ scale: 1.05, z: 90 }}
          />
        </motion.div>
      </motion.div>

    </div>
  );
}
