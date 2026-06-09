"use client";

import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface FlashImageProps {
  src: string;
  alt: string;
  className?: string;
  caption?: string;
  time?: string;
  parallaxOffset?: number;
}

export default function FlashImage({ src, alt, className, caption, time, parallaxOffset = 0 }: FlashImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imgRef.current?.complete) {
      setIsLoaded(true);
    }
  }, [src]);

  return (
    <motion.div 
      ref={ref}
      className={cn("relative group overflow-hidden cursor-crosshair rounded-xl md:rounded-2xl", className)}
      initial={{ opacity: 0, y: 80 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="absolute inset-0 z-10 flash-effect"></div>
      
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        onLoad={() => setIsLoaded(true)}
        className={cn(
          "w-full h-full object-cover transition-all duration-[1.5s] ease-out",
          isLoaded ? "opacity-90 grayscale-[0.2] contrast-[1.1]" : "opacity-0",
          "group-hover:scale-105 group-hover:grayscale-0 group-hover:contrast-[1.2]"
        )}
      />

      {(caption || time) && (
        <div className="absolute inset-x-4 bottom-4 glass-panel bg-black/40 p-5 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0 rounded-xl z-20 flex justify-between items-end">
          {caption && <p className="font-serif italic text-xl md:text-2xl text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">{caption}</p>}
          {time && <p className="font-mono text-[10px] md:text-xs tracking-widest uppercase opacity-90 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">{time}</p>}
        </div>
      )}
    </motion.div>
  );
}
