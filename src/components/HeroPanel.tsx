"use client";

import { motion } from "framer-motion";

export default function HeroPanel() {
  return (
    <div className="w-full h-full lg:w-[45%] lg:h-[1200px] relative overflow-hidden rounded-[2rem] lg:rounded-none lg:rounded-l-[40px]">
      <motion.div 
        className="absolute inset-0 bg-[#111] dark:bg-[#222]"
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
        <img 
          src="/hero_visual.png" 
          alt="Disposable Camera Aesthetic"
          className="object-cover w-full h-full opacity-90"
        />
        <div className="absolute bottom-16 left-12 md:left-16 z-20">
          <p className="text-white font-serif text-3xl md:text-5xl italic font-light tracking-wide mb-4">
            the atelier
          </p>
          <p className="text-white/60 text-xs md:text-sm font-mono uppercase tracking-[0.3em]">
            est. 2026
          </p>
        </div>
      </motion.div>
    </div>
  );
}
