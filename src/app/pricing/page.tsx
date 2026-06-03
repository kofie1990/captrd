import Navigation from "@/components/Navigation";
import { Check } from "lucide-react";

export default function PricingPage() {
  const eventTiers = [
    { guests: 3, price: 0, desc: "Trial Tier" },
    { guests: 5, price: 10, desc: "Intimate Gathering" },
    { guests: 10, price: 20, desc: "Small Party" },
    { guests: 15, price: 30, desc: "Dinner Party" },
    { guests: 20, price: 40, desc: "Get Together" },
    { guests: 30, price: 60, desc: "Celebration" },
    { guests: 50, price: 100, desc: "Large Event" },
    { guests: 100, price: 150, desc: "Wedding / Gala" },
  ];

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col relative selection:bg-foreground selection:text-background pb-32">
      <Navigation />
      
      {/* Event Pricing Section */}
      <div className="flex flex-col items-center justify-center pt-32 px-6 md:px-16 text-center max-w-6xl mx-auto z-10 w-full">
        <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl tracking-tighter mb-6">
          Film Roll <span className="italic font-light opacity-80">Pricing</span>
        </h1>
        
        <p className="text-lg md:text-xl text-foreground/60 max-w-xl mx-auto mb-16 font-light">
          Pay per event based on your guest count. No subscriptions required for event hosts.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl mx-auto mb-32">
          {eventTiers.map((tier, idx) => (
            <div key={idx} className="glass p-6 md:p-8 rounded-[2rem] flex flex-col text-left group hover:bg-foreground/5 transition-colors duration-300">
              <p className="font-mono text-[10px] tracking-widest uppercase opacity-60 mb-2">{tier.desc}</p>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="font-serif text-3xl md:text-4xl">{tier.price === 0 ? 'Free' : `$${tier.price}`}</span>
              </div>
              <p className="text-sm opacity-80 border-t border-foreground/10 pt-4 mt-auto">
                Up to <span className="font-bold">{tier.guests}</span> guests
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Captrd Studio Subscription Section */}
      <div className="flex flex-col items-center justify-center px-6 md:px-16 text-center max-w-6xl mx-auto z-10 w-full">
        <h2 className="font-serif text-4xl md:text-6xl tracking-tighter mb-6">
          Captrd <span className="italic font-light opacity-80">Studio</span>
        </h2>
        
        <p className="text-lg text-foreground/60 max-w-xl mx-auto mb-16 font-light">
          A dedicated subscription for photographers to upload high-res galleries and deliver them beautifully to clients.
        </p>

        <div className="glass p-10 md:p-16 rounded-[3rem] flex flex-col md:flex-row text-left relative overflow-hidden border border-foreground/20 bg-foreground/5 max-w-4xl w-full gap-12">
          <div className="flex-1">
            <h3 className="font-mono text-sm tracking-widest uppercase opacity-60 mb-2">Pro Photographer</h3>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="font-serif text-6xl tracking-tighter">$29</span>
              <span className="opacity-60 text-sm">/ month</span>
            </div>
            <p className="text-sm opacity-80 mb-8 leading-relaxed">
              Everything a professional photographer needs to host high-res event photos and provide easy downloads for users.
            </p>
            <button className="w-full md:w-auto px-8 py-4 bg-foreground text-background rounded-full font-medium tracking-widest text-sm uppercase hover:opacity-90 transition-opacity duration-300">
              Subscribe to Studio
            </button>
          </div>
          
          <div className="flex-1 flex flex-col justify-center">
            <ul className="flex flex-col gap-5 text-sm">
              <li className="flex items-center gap-4">
                <div className="w-5 h-5 rounded-full bg-foreground text-background flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </div>
                Unlimited high-res photo uploads
              </li>
              <li className="flex items-center gap-4">
                <div className="w-5 h-5 rounded-full bg-foreground text-background flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </div>
                Easy high-res client downloads
              </li>
              <li className="flex items-center gap-4">
                <div className="w-5 h-5 rounded-full bg-foreground text-background flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </div>
                Custom branded galleries
              </li>
              <li className="flex items-center gap-4">
                <div className="w-5 h-5 rounded-full bg-foreground text-background flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </div>
                Priority cloud storage
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
