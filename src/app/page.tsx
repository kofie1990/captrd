import Navigation from "@/components/Navigation";
import HeroPanel from "@/components/HeroPanel";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col relative selection:bg-foreground selection:text-background overflow-x-hidden">
      <Navigation />

      {/* Asymmetric Split Layout */}
      <div className="flex flex-col lg:flex-row w-full mx-auto h-[100dvh] lg:h-auto lg:min-h-0 pt-20 lg:pt-0">

        {/* Left Copy Area */}
        <div className="w-full lg:w-[55%] flex flex-col justify-center px-6 md:px-16 lg:px-24 xl:px-32 pt-4 pb-0 lg:py-0 lg:min-h-screen z-10 relative shrink-0">
          <div className="max-w-3xl">
            <h1 className="font-serif text-[3.5rem] leading-[0.95] md:text-8xl xl:text-[8rem] md:leading-[0.9] tracking-tighter mb-8 md:mb-12">
              captr <br />
              <span className="text-foreground/40 italic font-light">every moment</span> <br />
              through every lens.
            </h1>

            <p className="hidden md:block text-lg md:text-xl text-foreground/60 max-w-xl mb-16 font-light leading-relaxed">
              Recreating the disposable camera experience for modern events. Curated aesthetics, delayed reveals, and a shared film roll for everyone present.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 md:gap-6 mt-2 md:mt-0">
              <button className="bg-foreground text-background px-8 md:px-10 py-4 md:py-5 text-sm font-medium tracking-widest uppercase hover:opacity-90 transition-opacity flex items-center justify-center">
                Create Event
              </button>
              <button className="border border-foreground/20 px-8 md:px-10 py-4 md:py-5 text-sm font-medium tracking-widest uppercase hover:bg-foreground/5 transition-colors flex items-center justify-center">
                Join a Film
              </button>
            </div>
          </div>
        </div>

        {/* Right Visual Anchor */}
        <div className="flex items-end justify-center w-full flex-1 lg:flex-none lg:w-[45%] lg:min-h-screen lg:sticky lg:top-0 mt-6 lg:mt-0 px-4 pb-4 lg:px-0 lg:pb-0">
          <HeroPanel />
        </div>

      </div>

      {/* Featured Moments Gallery - Redesigned */}
      <section className="w-full px-4 md:px-8 py-12 md:py-32">
        <div className="max-w-[2000px] mx-auto bg-[#0a0a0a] text-[#fcfcfc] rounded-[2.5rem] md:rounded-[4rem] p-6 md:p-16 lg:p-24 overflow-hidden relative shadow-2xl">

          <div className="mb-12 md:mb-20 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8 md:pb-12">
            <h2 className="font-serif text-5xl md:text-6xl lg:text-7xl tracking-tighter">
              Captrd <br className="hidden md:block" />
              <span className="italic font-light opacity-80">Moments</span>
            </h2>
            <div className="flex items-center gap-4">
              <p className="font-mono text-xs tracking-[0.2em] uppercase opacity-50 md:hidden">Swipe to view roll</p>
              <p className="font-mono text-xs tracking-[0.2em] uppercase opacity-50 hidden md:block">Hover to reveal</p>
            </div>
          </div>

          {/* Swipeable on Mobile / Staggered Grid on Desktop */}
          <div className="flex overflow-x-auto md:grid md:grid-cols-3 gap-6 md:gap-12 snap-x snap-mandatory hide-scrollbar -mx-6 px-6 md:mx-0 md:px-0 md:pb-24">

            {/* Image 1 */}
            <div className="relative group shrink-0 w-[85vw] sm:w-[60vw] md:w-auto aspect-[4/5] bg-[#111] snap-center rounded-[2rem] md:rounded-none overflow-hidden">
              <img src="/candid_spill_1.png" alt="Candid moment" className="w-full h-full object-cover opacity-90 md:group-hover:scale-105 transition-transform duration-700 ease-out" />
              <div className="absolute inset-x-4 bottom-4 glass p-6 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-500 translate-y-0 md:translate-y-4 md:group-hover:translate-y-0 rounded-[1.5rem] md:rounded-none">
                <p className="font-serif italic text-2xl">The Spill</p>
                <p className="font-mono text-[10px] tracking-widest uppercase mt-3 opacity-60">10:42 PM</p>
              </div>
            </div>

            {/* Image 2 */}
            <div className="relative group shrink-0 w-[85vw] sm:w-[60vw] md:w-auto aspect-[4/5] bg-[#111] snap-center md:translate-y-12 rounded-[2rem] md:rounded-none overflow-hidden">
              <img src="/wedding_flash.png" alt="Wedding flash" className="w-full h-full object-cover opacity-90 md:group-hover:scale-105 transition-transform duration-700 ease-out" />
              <div className="absolute inset-x-4 bottom-4 glass p-6 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-500 translate-y-0 md:translate-y-4 md:group-hover:translate-y-0 rounded-[1.5rem] md:rounded-none">
                <p className="font-serif italic text-2xl">The Flash</p>
                <p className="font-mono text-[10px] tracking-widest uppercase mt-3 opacity-60">11:15 PM</p>
              </div>
            </div>

            {/* Image 3 */}
            <div className="relative group shrink-0 w-[85vw] sm:w-[60vw] md:w-auto aspect-[4/5] bg-[#111] snap-center md:translate-y-24 rounded-[2rem] md:rounded-none overflow-hidden">
              <img src="/candid_spill_2.png" alt="Candid aftermath" className="w-full h-full object-cover opacity-90 md:group-hover:scale-105 transition-transform duration-700 ease-out" />
              <div className="absolute inset-x-4 bottom-4 glass p-6 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-500 translate-y-0 md:translate-y-4 md:group-hover:translate-y-0 rounded-[1.5rem] md:rounded-none">
                <p className="font-serif italic text-2xl">The Aftermath</p>
                <p className="font-mono text-[10px] tracking-widest uppercase mt-3 opacity-60">11:59 PM</p>
              </div>
            </div>

          </div>
        </div>
      </section>

    </main>
  );
}
