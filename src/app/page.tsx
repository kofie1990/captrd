import Navigation from "@/components/Navigation";
import HeroSection from "@/components/landing/HeroSection";
import TimelineScroller from "@/components/landing/TimelineScroller";
import BentoGrid from "@/components/landing/BentoGrid";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col relative selection:bg-white selection:text-black overflow-x-hidden">
      <Navigation />

      <HeroSection />

      <TimelineScroller />

      <BentoGrid />

      {/* Footer CTA */}
      <footer className="relative w-full py-48 bg-black flex flex-col items-center justify-center text-center px-6 overflow-hidden">
        <div className="absolute inset-0 bg-grain mix-blend-overlay opacity-30"></div>
        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
          <h2 className="font-serif text-5xl md:text-7xl lg:text-8xl tracking-tighter mb-8">
            Ready to <br />
            <span className="italic font-light opacity-60">captr </span> the night?
          </h2>
          <p className="text-xl text-white/50 mb-12 font-light">
            Start your event in seconds. No app required.
          </p>
          <Link href="/dashboard/create" className="group relative inline-flex h-16 items-center justify-center overflow-hidden rounded-full bg-white px-10 font-medium text-black transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_8px_rgba(255,255,255,0.2)]">
            <span className="font-mono text-base tracking-widest uppercase">Create Event</span>
            <ArrowRight className="ml-3 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </footer>
    </main>
  );
}
