"use client";

import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

export default function PricingPage() {
  const eventTiers = [
    { guests: 3, price: 0, desc: "Trial Tier", maxPhotos: 5 },
    { guests: 5, price: 20, desc: "Intimate Gathering", maxPhotos: 15 },
    { guests: 10, price: 30, desc: "Small Party", maxPhotos: 20 },
    { guests: 15, price: 40, desc: "Dinner Party", maxPhotos: 25 },
    { guests: 20, price: 50, desc: "Get Together", maxPhotos: 30 },
    { guests: 30, price: 60, desc: "Celebration", maxPhotos: 35 },
    { guests: 50, price: 70, desc: "Large Event", maxPhotos: 40 },
    { guests: 100, price: 80, desc: "Wedding / Gala", maxPhotos: 50 },
  ];

  const [selectedIdx, setSelectedIdx] = useState(0);
  const selectedTier = eventTiers[selectedIdx];
  const [studioLink, setStudioLink] = useState("/studio");
  const supabase = createClient();

  useEffect(() => {
    const checkUserSubscription = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data } = await supabase
          .from("profiles")
          .select("is_studio_subscriber")
          .eq("id", session.user.id)
          .single();

        if (data?.is_studio_subscriber) {
          setStudioLink("/studio/dashboard");
        }
      }
    };
    checkUserSubscription();
  }, [supabase]);

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col relative selection:bg-foreground selection:text-background pb-32 overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-foreground/5 blur-[120px] rounded-full pointer-events-none -z-10" />
      
      <Navigation />
      
      {/* Event Pricing Section */}
      <div className="flex flex-col items-center justify-center pt-32 px-6 md:px-16 text-center max-w-6xl mx-auto w-full relative z-10">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="font-serif text-5xl md:text-7xl lg:text-8xl tracking-tighter mb-6"
        >
          Film Roll <span className="italic font-light opacity-80">Pricing</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          className="text-lg md:text-xl text-foreground/60 max-w-xl mx-auto mb-16 font-light"
        >
          Pay per event based on your guest count. No subscriptions required for event hosts.
        </motion.p>

        {/* Interactive Pricing Calculator */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="w-full max-w-2xl mx-auto glass p-8 md:p-12 rounded-[3rem] relative overflow-hidden border border-foreground/10 shadow-2xl mb-32"
        >
          <div className="mb-10 text-left">
            <h3 className="font-mono text-xs uppercase tracking-widest opacity-60 mb-6">Select Guest Count</h3>
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-3 pb-4 scrollbar-hide -mx-4 px-4 [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
              {eventTiers.map((tier, idx) => (
                <button
                  key={tier.guests}
                  onClick={() => setSelectedIdx(idx)}
                  className={`flex-shrink-0 snap-center px-6 py-4 rounded-2xl font-mono text-lg transition-all border ${
                    selectedIdx === idx
                      ? 'bg-foreground text-background border-foreground shadow-[0_0_20px_rgba(255,255,255,0.15)] scale-105'
                      : 'bg-foreground/5 border-foreground/10 text-foreground/60 hover:border-foreground/30 hover:text-foreground'
                  }`}
                >
                  {tier.guests}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end border-t border-foreground/10 pt-10 text-left">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest opacity-60 mb-2">Tier</p>
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedTier.desc}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="font-serif text-2xl mb-2"
                >
                  {selectedTier.desc}
                </motion.div>
              </AnimatePresence>
              <p className="text-sm opacity-60">Up to {selectedTier.maxPhotos} photos per guest</p>
            </div>
            
            <div className="md:text-right">
              <p className="font-mono text-[10px] uppercase tracking-widest opacity-60 mb-2">Total Price</p>
              <div className="flex items-baseline md:justify-end gap-1">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedTier.price}
                    initial={{ opacity: 0, scale: 0.9, filter: "blur(4px)" }}
                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, scale: 1.1, filter: "blur(4px)" }}
                    transition={{ duration: 0.4 }}
                    className="font-serif text-6xl md:text-7xl tracking-tighter"
                  >
                    {selectedTier.price === 0 ? 'Free' : `GH₵ ${selectedTier.price}`}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Captrd Studio Subscription Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1 }}
        className="flex flex-col items-center justify-center px-6 md:px-16 text-center max-w-6xl mx-auto z-10 w-full"
      >
        <h2 className="font-serif text-4xl md:text-6xl tracking-tighter mb-6">
          Captrd <span className="italic font-light opacity-80">Studio</span>
        </h2>
        
        <p className="text-lg text-foreground/60 max-w-xl mx-auto mb-16 font-light">
          A dedicated subscription for photographers to upload high-res galleries and deliver them beautifully to clients.
        </p>

        <div className="glass p-10 md:p-16 rounded-[3rem] flex flex-col md:flex-row text-left relative overflow-hidden border border-foreground/10 bg-foreground/5 max-w-4xl w-full gap-12 group hover:border-foreground/20 transition-colors duration-500">
          {/* Decorative glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-foreground/5 blur-[80px] rounded-full group-hover:bg-foreground/10 transition-colors duration-700 pointer-events-none" />

          <div className="flex-1 relative z-10">
            <h3 className="font-mono text-sm tracking-widest uppercase opacity-60 mb-2">Pro Photographer</h3>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="font-serif text-6xl tracking-tighter">GH₵ 59</span>
              <span className="opacity-60 text-sm">/ month</span>
            </div>
            <p className="text-sm opacity-80 mb-8 leading-relaxed">
              Everything a professional photographer needs to host high-res event photos and provide easy downloads for users.
            </p>
            <a href={studioLink} className="inline-block text-center w-full md:w-auto px-8 py-4 bg-foreground text-background rounded-full font-medium tracking-widest text-sm uppercase hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              {studioLink === "/studio/dashboard" ? "Go to Dashboard" : "Subscribe to Studio"}
            </a>
          </div>
          
          <div className="flex-1 flex flex-col justify-center relative z-10">
            <ul className="flex flex-col gap-6 text-sm">
              {[
                "Unlimited high-res photo uploads",
                "Easy high-res client downloads",
                "Custom branded galleries",
                "Priority cloud storage"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-4 group/item">
                  <div className="w-6 h-6 rounded-full border border-foreground/20 flex items-center justify-center shrink-0 group-hover/item:bg-foreground group-hover/item:text-background transition-colors duration-300">
                    <Check className="w-3 h-3" />
                  </div>
                  <span className="opacity-80 group-hover/item:opacity-100 transition-opacity">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
