"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Navigation from "@/components/Navigation";
import MasonryGrid from "@/components/studio/MasonryGrid";
import { ChevronDown } from "lucide-react";

type Photo = {
  id: string;
  public_url: string;
};

type Props = {
  studio: { business_name: string };
  event: { name: string; cover_image_url: string | null };
  photos: Photo[];
};

export default function GalleryClient({ studio, event, photos }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollY } = useScroll();
  
  // Parallax calculations
  const heroScale = useTransform(scrollY, [0, 800], [1, 1.05]);
  const heroOpacity = useTransform(scrollY, [0, 600], [1, 0.3]);
  const heroY = useTransform(scrollY, [0, 800], [0, 250]);
  const textY = useTransform(scrollY, [0, 500], [0, -100]);
  const textOpacity = useTransform(scrollY, [0, 300], [1, 0]);

  // Use the first photo as the cover if no explicit cover image is provided
  const coverImage = event.cover_image_url || (photos.length > 0 ? photos[0].public_url : null);

  const scrollToGallery = () => {
    window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
  };

  return (
    <div className="relative min-h-screen bg-[#050505] text-[#fcfcfc]" ref={containerRef}>
      
      {/* Absolute Navigation on top of hero */}
      <div className="absolute top-0 left-0 w-full z-50">
         <Navigation />
      </div>
      
      {/* Full Screen Hero */}
      <div className="relative h-[100vh] w-full overflow-hidden flex flex-col items-center justify-center px-6 selection:bg-white selection:text-black">
        {coverImage ? (
          <motion.div 
            style={{ 
              scale: heroScale,
              opacity: heroOpacity,
              y: heroY
            }}
            className="absolute inset-0 z-0 origin-center"
          >
            <img 
              src={coverImage} 
              alt="Event Cover" 
              className="w-full h-full object-cover"
            />
            {/* Elegant gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/30 to-[#050505]" />
          </motion.div>
        ) : (
          <div className="absolute inset-0 z-0 bg-gradient-to-br from-neutral-900 to-black" />
        )}
        
        {/* Hero Content */}
        <motion.div 
          style={{ y: textY, opacity: textOpacity }}
          className="relative z-10 w-full h-full flex flex-col items-center justify-center pointer-events-none"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center text-center px-6 py-12"
          >
            <p className="font-mono text-[10px] md:text-xs uppercase tracking-[0.5em] text-white/70 mb-4 md:mb-6">
              A Gallery By <span className="text-white">{studio.business_name}</span>
            </p>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
              className="font-serif font-light text-6xl md:text-8xl lg:text-9xl tracking-tighter leading-[0.9] text-white drop-shadow-2xl mix-blend-overlay"
            >
              {event.name}
            </motion.h1>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator (moved to bottom center) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center cursor-pointer group z-20"
          onClick={scrollToGallery}
        >
          <span className="font-mono text-[9px] uppercase tracking-widest text-white/50 mb-4 group-hover:text-white transition-colors duration-700">
            Scroll
          </span>
          <motion.div 
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center bg-white/5 backdrop-blur-md group-hover:bg-white/20 group-hover:border-white/30 transition-all duration-700"
          >
            <ChevronDown className="w-4 h-4 text-white" />
          </motion.div>
        </motion.div>


      </div>

      {/* Gallery Section */}
      <div className="relative z-20 bg-[#050505] w-full pt-8">
        <div className="w-full mx-auto min-h-screen px-2 md:px-4">
          
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center text-center mb-20 md:mb-32"
          >
            <h2 className="font-serif text-4xl md:text-6xl mb-6 text-white/90">The Collection</h2>
            <div className="w-12 h-[1px] bg-white/20 mb-6" />
            <p className="opacity-50 max-w-lg font-mono text-xs tracking-widest uppercase">
              {photos.length} High-Resolution Captures
            </p>
          </motion.div>
          
          <MasonryGrid photos={photos} />
        </div>
        
        {/* Footer */}
        <div className="w-full pb-16 pt-32 flex justify-center opacity-30 hover:opacity-100 transition-opacity">
          <a href="/" className="font-serif text-2xl italic">Captrd Studio</a>
        </div>
      </div>
    </div>
  );
}
