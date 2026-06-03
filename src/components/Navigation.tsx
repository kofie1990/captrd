"use client";

import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Camera, Menu, X } from "lucide-react";
import Link from "next/link";

export default function Navigation() {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
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
        className="fixed top-0 inset-x-0 z-50 glass h-20 md:h-24 flex items-center px-6 md:px-16"
      >
        <div className="w-full max-w-[1600px] mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 group z-50" onClick={() => setMenuOpen(false)}>
            <Camera className="w-7 h-7 text-foreground group-hover:opacity-70 transition-opacity" />
            <span className="font-serif text-3xl tracking-tighter font-medium">
              captrd.
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex gap-10 text-sm font-medium tracking-wide uppercase">
            <Link href="/studio" className="hover:opacity-70 transition-opacity">Studio</Link>
            <Link href="/pricing" className="hover:opacity-70 transition-opacity">Pricing</Link>
            <Link href="/login" className="hover:opacity-70 transition-opacity">Sign In</Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden z-50 p-2 -mr-2 text-foreground"
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
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 z-40 bg-background/95 backdrop-blur-xl flex flex-col items-center justify-center"
          >
            <div className="flex flex-col gap-12 text-3xl font-serif tracking-wide text-center">
              <Link href="/studio" onClick={() => setMenuOpen(false)} className="hover:opacity-70 transition-opacity">Studio</Link>
              <Link href="/pricing" onClick={() => setMenuOpen(false)} className="hover:opacity-70 transition-opacity">Pricing</Link>
              <Link href="/login" onClick={() => setMenuOpen(false)} className="hover:opacity-70 transition-opacity">Sign In</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
