"use client";

import { motion } from "framer-motion";
import { QrCode, Smartphone, Zap, Download } from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    title: "No App Required",
    description: "Guests just scan a QR code and start taking photos instantly in their browser.",
    icon: <QrCode className="w-8 h-8 md:w-10 md:h-10 text-white/80" />,
    className: "md:col-span-2 md:row-span-2",
    image: "/birthday_invite.png",
    imageClassName: "absolute right-[-10%] bottom-[-20%] w-[70%] md:w-[50%] h-auto rounded-3xl rotate-[-5deg] shadow-2xl transition-all duration-700 group-hover:-translate-y-4 group-hover:rotate-0 opacity-50 group-hover:opacity-90 z-0",
  },
  {
    title: "Disposable Aesthetic",
    description: "Built-in film grain, high contrast, and intense flash filters.",
    icon: <Smartphone className="w-6 h-6 text-white/80" />,
    className: "md:col-span-1 md:row-span-1",
    image: "/camerascreen.png",
    imageClassName: "absolute right-[-20%] bottom-[-30%] w-[80%] h-auto rounded-3xl rotate-[10deg] shadow-2xl transition-all duration-700 group-hover:-translate-y-4 group-hover:rotate-[5deg] opacity-40 group-hover:opacity-80 z-0",
  },
  {
    title: "Instant Sync",
    description: "Every photo taken by any guest syncs to one master gallery.",
    icon: <Zap className="w-6 h-6 text-white/80" />,
    className: "md:col-span-1 md:row-span-1",
    image: "/wedding_gallary.png",
    imageClassName: "absolute right-[-15%] bottom-[-30%] w-[90%] h-auto rounded-3xl rotate-[-10deg] shadow-2xl transition-all duration-700 group-hover:-translate-y-4 group-hover:rotate-[-5deg] opacity-30 group-hover:opacity-80 z-0",
  },
  {
    title: "High-Res Export",
    description: "Download the entire roll in full resolution after the event.",
    icon: <Download className="w-6 h-6 text-white/80" />,
    className: "md:col-span-2 md:row-span-1",
    image: "/party_pictureview.png",
    imageClassName: "absolute right-[0%] md:right-[5%] bottom-[-40%] md:bottom-[-60%] w-[60%] md:w-[35%] h-auto rounded-3xl rotate-[5deg] shadow-2xl transition-all duration-700 group-hover:-translate-y-6 group-hover:rotate-0 opacity-40 group-hover:opacity-90 z-0",
  },
];

export default function BentoGrid() {
  return (
    <section className="relative w-full py-32 bg-black overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">

        <div className="mb-20">
          <h2 className="font-serif text-5xl md:text-7xl tracking-tighter text-white">
            The <span className="italic font-light text-white/50">Control Room</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 auto-rows-[300px] md:auto-rows-[300px]">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className={cn(
                "group relative overflow-hidden rounded-[2rem] glass-panel p-8 flex flex-col justify-between border border-white/10 hover:border-white/30 transition-colors duration-500",
                feature.className
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10" />

              {feature.image && (
                <img
                  src={feature.image}
                  alt={feature.title}
                  className={feature.imageClassName}
                />
              )}

              <div className="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center backdrop-blur-md border border-white/10 relative z-20">
                {feature.icon}
              </div>

              <div className="relative z-20 mt-auto pt-8">
                <h3 className="font-serif text-3xl text-white mb-3">{feature.title}</h3>
                <p className="text-white/60 font-light text-md leading-[1.4] max-w-sm">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Background glow for bento section */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-white/5 blur-[150px] rounded-[100%] pointer-events-none" />
    </section>
  );
}
