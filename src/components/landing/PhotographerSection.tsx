"use client";

import { motion } from "framer-motion";
import FlashImage from "./FlashImage";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function PhotographerSection() {
  const itemVariants = {
    hidden: { opacity: 0, y: 80 },
    show: { opacity: 1, y: 0, transition: { duration: 1.5, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <section id="photographer" className="relative w-full py-32 md:py-48 bg-black overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20 md:mb-32">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="font-serif text-5xl md:text-7xl lg:text-8xl tracking-tighter text-white"
          >
            Are you a <span className="italic font-light text-white/50">photographer?</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2 }}
            className="mt-6 font-mono text-sm tracking-[0.2em] uppercase text-white/40 max-w-2xl mx-auto leading-relaxed"
          >
            Elevate your delivery with Captrd Studio
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {/* Card 1 */}
          <motion.div 
            variants={itemVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="glass p-4 rounded-[2rem] md:rounded-[2.5rem] border border-white/10 hover:border-white/20 hover:bg-white/[0.02] transition-all duration-500 group flex flex-col"
          >
            <div className="w-full aspect-[3/4] mb-6 relative rounded-[1.5rem] overflow-hidden bg-white/5">
              <FlashImage
                src="/event_lights.jpg"
                alt="Upload High-Res"
                className="w-full h-full"
              />
            </div>
            <div className="px-4 pb-4 mt-auto flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center gap-4 mb-3">
                  <span className="font-mono text-xs text-white/30 uppercase tracking-widest">01</span>
                  <h3 className="font-serif text-2xl md:text-3xl text-white">Upload High-Res</h3>
                </div>
                <p className="text-white/60 font-light leading-relaxed text-sm">
                  Say goodbye to compressed images. Upload pristine, high-resolution edits directly. We preserve the quality of your work exactly as intended.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Card 2 */}
          <motion.div 
            variants={itemVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="glass p-4 rounded-[2rem] md:rounded-[2.5rem] border border-white/10 hover:border-white/20 hover:bg-white/[0.02] transition-all duration-500 group flex flex-col md:translate-y-12"
          >
            <div className="w-full aspect-[3/4] mb-6 relative rounded-[1.5rem] overflow-hidden bg-white/5">
              <FlashImage
                src="/download_button.png"
                alt="Easy Downloads"
                className="w-full h-full"
              />
            </div>
            <div className="px-4 pb-4 mt-auto flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center gap-4 mb-3">
                  <span className="font-mono text-xs text-white/30 uppercase tracking-widest">02</span>
                  <h3 className="font-serif text-2xl md:text-3xl text-white">Easy Downloads</h3>
                </div>
                <p className="text-white/60 font-light leading-relaxed text-sm">
                  Guests can easily access the gallery and download pictures straight to their devices without jumping through hoops or creating complex accounts.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Card 3 */}
          <motion.div 
            variants={itemVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="glass p-4 rounded-[2rem] md:rounded-[2.5rem] border border-white/10 hover:border-white/20 hover:bg-white/[0.02] transition-all duration-500 group flex flex-col md:translate-y-24"
          >
            <div className="w-full aspect-[3/4] mb-6 relative rounded-[1.5rem] overflow-hidden bg-white/5">
              <FlashImage
                src="/studio_2.jpg"
                alt="The Studio"
                className="w-full h-full"
              />
            </div>
            <div className="px-4 pb-4 mt-auto flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center gap-4 mb-3">
                  <span className="font-mono text-xs text-white/30 uppercase tracking-widest">03</span>
                  <h3 className="font-serif text-2xl md:text-3xl text-white">The Studio</h3>
                </div>
                <p className="text-white/60 font-light leading-relaxed text-sm mb-8">
                  Join Captrd Studio for GH₵ 59/month to get unlimited high-res uploads and effortless client delivery.
                </p>
              </div>
              
              <Link href="/studio" className="mt-auto inline-flex items-center justify-center w-full py-4 rounded-full bg-white text-black font-mono text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                Explore Studio
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
