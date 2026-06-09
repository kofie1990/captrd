"use client";

import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Camera, Menu, X } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function Navigation() {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }

    if (latest > 20) {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }
  });

  return (
    <>
      <motion.nav
        variants={{
          visible: { y: 0 },
          hidden: { y: "-100%" },
        }}
        animate={hidden && !menuOpen ? "hidden" : "visible"}
        transition={{ duration: 0.35, ease: "easeInOut" }}
        className={cn(
          "fixed top-0 inset-x-0 z-50 h-16 md:h-18 flex items-center px-6 md:px-16 transition-all duration-500",
          isScrolled ? "bg-black/60 backdrop-blur-2xl border-b border-white/5 opacity-0" : "bg-transparent"
        )}
      >
        <div className="w-full mx-auto flex justify-between items-center max-w-[2000px]">
          <Link href="/" className="flex items-center gap-3 group z-50" onClick={() => setMenuOpen(false)}>
            <Camera className="w-6 h-6 text-white group-hover:opacity-70 transition-opacity" />
            <span className="font-serif text-2xl md:text-3xl tracking-tighter text-white">
              captrd.
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex gap-12 text-xs font-mono tracking-[0.2em] uppercase text-white/70">
            <Link href="/studio" className="hover:text-white transition-colors duration-300">Studio</Link>
            <Link href="/pricing" className="hover:text-white transition-colors duration-300">Pricing</Link>
            <Link href="/login" className="hover:text-white transition-colors duration-300">Sign In</Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden z-50 p-2 -mr-2 text-white"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle Menu"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Fullscreen Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(24px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-40 bg-black/90 flex flex-col items-center justify-center"
          >
            <div className="flex flex-col gap-12 text-4xl font-serif tracking-wide text-center text-white">
              <Link href="/studio" onClick={() => setMenuOpen(false)} className="hover:opacity-50 transition-opacity">Studio</Link>
              <Link href="/pricing" onClick={() => setMenuOpen(false)} className="hover:opacity-50 transition-opacity">Pricing</Link>
              <Link href="/login" onClick={() => setMenuOpen(false)} className="hover:opacity-50 transition-opacity">Sign In</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
