import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center relative selection:bg-white selection:text-black overflow-hidden px-6 text-center">
      {/* Grain overlay to match the website's vibe */}
      <div className="absolute inset-0 bg-grain mix-blend-overlay opacity-30 pointer-events-none"></div>
      
      <div className="relative z-10 flex flex-col items-center max-w-2xl">
        <h1 className="font-serif text-8xl md:text-[10rem] lg:text-[12rem] leading-none tracking-tighter mb-2 opacity-90">
          404
        </h1>
        
        <h2 className="font-serif text-3xl md:text-5xl mb-6">
          This moment wasn't <span className="italic font-light opacity-60">captrd</span>
        </h2>
        
        <p className="text-lg md:text-xl text-white/50 mb-12 font-light max-w-md mx-auto">
          The page you're looking for seems to have been lost in the darkroom. Let's get you back in focus.
        </p>
        
        <Link 
          href="/" 
          className="group relative inline-flex h-14 md:h-16 items-center justify-center overflow-hidden rounded-full bg-white px-8 md:px-10 font-medium text-black transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_8px_rgba(255,255,255,0.2)]"
        >
          <ArrowLeft className="mr-3 h-5 w-5 transition-transform group-hover:-translate-x-1" />
          <span className="font-mono text-sm md:text-base tracking-widest uppercase">Back Home</span>
        </Link>
      </div>
    </main>
  );
}
