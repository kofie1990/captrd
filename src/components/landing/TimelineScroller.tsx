"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import FlashImage from "./FlashImage";

export default function TimelineScroller() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const lineHeight = useTransform(scrollYProgress, [0.1, 0.9], ["0%", "100%"]);

  return (
    <section id="timeline" ref={containerRef} className="relative w-full py-32 md:py-48 bg-black overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative">

        {/* Section Header */}
        <div className="text-center mb-32 md:mb-48">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="font-serif text-5xl md:text-7xl lg:text-8xl tracking-tighter text-white"
          >
            The <span className="italic font-light text-white/50">Timeline</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2 }}
            className="mt-6 font-mono text-sm tracking-[0.2em] uppercase text-white/40"
          >
            Scroll to reveal the roll
          </motion.p>
        </div>

        {/* Central Line */}
        <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-white/10 transform md:-translate-x-1/2 z-0">
          <motion.div
            className="absolute top-0 w-full bg-white origin-top"
            style={{ height: lineHeight }}
          />
        </div>

        {/* Timeline Items */}
        <div className="relative z-10 flex flex-col gap-24 md:gap-48">

          {/* Item 1 - Left */}
          <div className="flex flex-col md:flex-row items-center w-full relative">
            <div className="w-full md:w-1/2 flex justify-center md:justify-end md:pr-16 lg:pr-24 relative">
              <FlashImage
                src="/wedding_invite.png"
                alt="Wedding Invite"
                caption="The Invite"
                time="08:00 PM"
                className="w-full max-w-[280px] md:max-w-xs aspect-[9/19]"
                parallaxOffset={-20}
              />
              <motion.div
                className="md:hidden absolute top-8 -right-4 z-20 w-[220px] pointer-events-none"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, margin: "-20%" }}
                transition={{ duration: 0.6 }}
              >
                <div className="glass-panel p-4 rounded-2xl bg-black/80 backdrop-blur-xl border border-white/10 shadow-2xl text-left">
                  <p className="font-mono text-[9px] text-white/50 uppercase tracking-widest mb-1 drop-shadow-md">01 // The Invite</p>
                  <p className="text-[13px] font-light text-white/90 leading-snug drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Send a beautiful invite to your friends to join the roll.</p>
                </div>
              </motion.div>
            </div>
            <div className="w-full md:w-1/2 hidden md:flex items-center pl-16">
              <div className="max-w-xs">
                <p className="font-mono text-xs text-white/40 uppercase tracking-widest mb-4">01 // The Invite</p>
                <p className="text-xl font-light text-white/80 leading-relaxed">Send a beautiful invite to your friends to join the roll.</p>
              </div>
            </div>
          </div>

          {/* Item 2 - Right */}
          <div className="flex flex-col md:flex-row items-center w-full relative">
            <div className="w-full md:w-1/2 hidden md:flex justify-end items-center pr-16 text-right">
              <div className="max-w-xs">
                <p className="font-mono text-xs text-white/40 uppercase tracking-widest mb-4">02 // The Captr</p>
                <p className="text-xl font-light text-white/80 leading-relaxed">Snap photos all night long. No retakes, no filters, just raw moments.</p>
              </div>
            </div>
            <div className="w-full md:w-1/2 flex justify-center md:justify-start md:pl-16 lg:pl-24 relative">
              <FlashImage
                src="/wedding_camera.png"
                alt="Disposable Camera"
                caption="The Camera"
                time="10:30 PM"
                className="w-full max-w-[280px] md:max-w-xs aspect-[9/19]"
                parallaxOffset={20}
              />
              <motion.div
                className="md:hidden absolute top-16 -left-4 z-20 w-[220px] pointer-events-none"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, margin: "-20%" }}
                transition={{ duration: 0.6 }}
              >
                <div className="glass-panel p-4 rounded-2xl bg-black/80 backdrop-blur-xl border border-white/10 shadow-2xl text-left">
                  <p className="font-mono text-[9px] text-white/50 uppercase tracking-widest mb-1 drop-shadow-md">02 // The Captr</p>
                  <p className="text-[13px] font-light text-white/90 leading-snug drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Snap photos all night long. No retakes, no filters, just raw moments.</p>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Item 3 - Left */}
          <div className="flex flex-col md:flex-row items-center w-full relative">
            <div className="w-full md:w-1/2 flex justify-center md:justify-end md:pr-16 lg:pr-24 relative">
              <FlashImage
                src="/wedding_gallary.png"
                alt="Photo Gallery"
                caption="The Roll"
                time="09:00 AM"
                className="w-full max-w-[280px] md:max-w-xs aspect-[9/19]"
                parallaxOffset={-10}
              />
              <motion.div
                className="md:hidden absolute bottom-16 -right-4 z-20 w-[220px] pointer-events-none"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, margin: "-20%" }}
                transition={{ duration: 0.6 }}
              >
                <div className="glass-panel p-4 rounded-2xl bg-black/80 backdrop-blur-xl border border-white/10 shadow-2xl text-left">
                  <p className="font-mono text-[9px] text-white/50 uppercase tracking-widest mb-1 drop-shadow-md">03 // The Reveal</p>
                  <p className="text-[13px] font-light text-white/90 leading-snug drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Wake up to a shared gallery of everyone's photos from the event.</p>
                </div>
              </motion.div>
            </div>
            <div className="w-full md:w-1/2 hidden md:flex items-center pl-16">
              <div className="max-w-xs">
                <p className="font-mono text-xs text-white/40 uppercase tracking-widest mb-4">03 // The Reveal</p>
                <p className="text-xl font-light text-white/80 leading-relaxed">Wake up to a shared gallery of everyone's photos from the event.</p>
              </div>
            </div>
          </div>

          {/* Item 4 - Right */}
          <div className="flex flex-col md:flex-row items-center w-full relative">
            <div className="w-full md:w-1/2 hidden md:flex justify-end items-center pr-16 text-right">
              <div className="max-w-xs">
                <p className="font-mono text-xs text-white/40 uppercase tracking-widest mb-4">04 // The Memories</p>
                <p className="text-xl font-light text-white/80 leading-relaxed">Relive the night from every perspective. Download and share your favorites.</p>
              </div>
            </div>
            <div className="w-full md:w-1/2 flex justify-center md:justify-start md:pl-16 lg:pl-24 relative">
              <FlashImage
                src="/wedding_pictureview.png"
                alt="Picture View"
                caption="The Memories"
                time="09:15 AM"
                className="w-full max-w-[280px] md:max-w-xs aspect-[9/19]"
                parallaxOffset={30}
              />
              <motion.div
                className="md:hidden absolute top-12 -left-4 z-20 w-[220px] pointer-events-none"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, margin: "-20%" }}
                transition={{ duration: 0.6 }}
              >
                <div className="glass-panel p-4 rounded-2xl bg-black/80 backdrop-blur-xl border border-white/10 shadow-2xl text-left">
                  <p className="font-mono text-[9px] text-white/50 uppercase tracking-widest mb-1 drop-shadow-md">04 // The Memories</p>
                  <p className="text-[13px] font-light text-white/90 leading-snug drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Relive the night from every perspective. Download and share your favorites.</p>
                </div>
              </motion.div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
