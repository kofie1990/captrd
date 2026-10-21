"use client";

import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { Upload, Download, Sparkles, Check } from "lucide-react";
import { motion, useTransform, useSpring, useMotionValue } from "framer-motion";
import { usePaystackPayment } from 'react-paystack';
import { createClient } from "@/lib/supabase/client";
import { STUDIO_TIERS, StudioTier, calculateAmountWithFee } from "@/lib/studio/tiers";

export default function StudioClient() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 50 } },
  };

  // 3D Tilt Effect on mouse move
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [12, -12]), { stiffness: 150, damping: 20 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-12, 12]), { stiffness: 150, damping: 20 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = e.clientX / innerWidth - 0.5;
      const y = e.clientY / innerHeight - 0.5;
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  const [user, setUser] = useState<any>(null);
  const [currentUserTier, setCurrentUserTier] = useState<StudioTier | null>(null);
  const [isAlreadySubscriber, setIsAlreadySubscriber] = useState(false);
  const [selectedTier, setSelectedTier] = useState<StudioTier>('starter');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setUser(user);
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_studio_subscriber, studio_tier")
          .eq("id", user.id)
          .single();

        if (profile?.is_studio_subscriber) {
          setIsAlreadySubscriber(true);
          setCurrentUserTier(profile.studio_tier === 'pro' ? 'pro' : 'starter');
        }
      }
    });

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tierParam = params.get('tier');
      if (tierParam === 'pro' || tierParam === 'starter') {
        setSelectedTier(tierParam);
      }
    }
  }, [supabase]);

  const currentTierConfig = STUDIO_TIERS[selectedTier];
  const amountWithFee = calculateAmountWithFee(currentTierConfig.baseAmountInPesewas);

  const paystackConfig = {
    reference: `sub_${new Date().getTime()}`,
    email: user?.email || "subscriber@captrd.com",
    amount: amountWithFee,
    plan: currentTierConfig.planCode,
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
    currency: 'GHS',
    metadata: {
      action: "studio_subscription",
      userId: user?.id,
      tier: selectedTier,
      custom_fields: []
    }
  };

  const initializePayment = usePaystackPayment(paystackConfig);

  const handleSubscribe = () => {
    if (isAlreadySubscriber) {
      if (currentUserTier === 'pro' || currentUserTier === selectedTier) {
        window.location.href = "/studio/dashboard";
        return;
      }
    }
    if (!user) {
      window.location.href = `/login?redirectTo=/studio?tier=${selectedTier}`;
      return;
    }
    setIsSubscribing(true);
    initializePayment({
      onSuccess: async (reference: any) => {
        try {
          const { data: { session } } = await supabase.auth.getSession();

          const response = await fetch('/api/payments/verify-studio', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session?.access_token}`
            },
            body: JSON.stringify({ 
              reference: reference.reference,
              tier: selectedTier 
            })
          });

          const result = await response.json();

          if (result.success) {
            window.location.href = "/studio/dashboard?onboarding=true";
          } else {
            console.error("Failed to verify subscription:", result.error);
            alert(`Payment successful but we couldn't verify it: ${result.error}. Please contact support.`);
          }
        } catch (err) {
          console.error("Network error:", err);
          alert("A network error occurred while verifying the subscription.");
        }
        setIsSubscribing(false);
      },
      onClose: () => {
        setIsSubscribing(false);
      }
    });
  };

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col relative selection:bg-foreground selection:text-background pb-24 overflow-hidden">
      {/* Cinematic ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-foreground/5 blur-[150px] rounded-full pointer-events-none -z-10" />

      <Navigation />

      <div className="flex-1 flex flex-col items-center justify-center pt-32 px-6 md:px-16 text-center max-w-5xl mx-auto z-10 w-full">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex flex-col items-center w-full"
        >
          <motion.div
            variants={itemVariants}
            whileHover="hover"
            initial="initial"
            whileTap={{ scale: 0.95 }}
            className="relative group mb-10 overflow-hidden rounded-full p-[1px] cursor-pointer"
          >
            {/* The spinning conic gradient layer */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute inset-[-1000%] opacity-30 group-hover:opacity-100 transition-opacity duration-700"
              style={{
                background: 'conic-gradient(from 90deg at 50% 50%, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)'
              }}
            />

            {/* The inner badge background */}
            <div className="relative flex items-center gap-3 px-6 py-2.5 rounded-full bg-background border border-foreground/10 group-hover:border-foreground/5 transition-colors duration-500 overflow-hidden h-full w-full">
              {/* Glassmorphism subtle overlay */}
              <div className="absolute inset-0 bg-foreground/5 backdrop-blur-md" />

              {/* Shine sweep effect on hover */}
              <motion.div
                variants={{
                  initial: { x: "-200%" },
                  hover: { x: "300%" }
                }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.5 }}
                className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-foreground/10 to-transparent skew-x-[30deg] pointer-events-none"
              />

              {/* Icon Container */}
              <motion.div
                variants={{
                  hover: { rotate: [0, -15, 15, -15, 0], scale: 1.1 }
                }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10 text-foreground/60 group-hover:text-foreground transition-all duration-500"
              >
                <Sparkles className="w-4 h-4 drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
              </motion.div>

              {/* Text Container */}
              <span className="relative z-10 font-mono text-[10px] md:text-xs uppercase tracking-[0.25em] font-medium text-foreground/60 group-hover:text-foreground transition-all duration-500">
                For Photographers
              </span>
            </div>
          </motion.div>

          <motion.h1 variants={itemVariants} className="font-serif text-6xl md:text-8xl lg:text-9xl tracking-tighter mb-8 leading-[0.9]">
            The <span className="italic font-light opacity-80">Studio</span>
          </motion.h1>

          <motion.p variants={itemVariants} className="text-lg md:text-2xl text-foreground/60 leading-relaxed font-light mb-16 max-w-2xl mx-auto">
            A dedicated subscription platform for professional photographers to upload high-resolution event galleries, making it effortless for clients and guests to view and download their memories.
          </motion.p>
        </motion.div>

        {/* 3D Interactive Device Mockups */}
        <motion.div
          className="relative z-10 w-full max-w-[550px] md:max-w-[780px] mx-auto my-6 md:my-14 px-4"
          style={{ perspective: 2000 }}
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            animate={{ y: [0, -12, 0] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            className="relative w-full aspect-[16/10] sm:aspect-[16/9] flex items-center justify-center group"
          >
            {/* Dynamic Glow/Shadow behind the devices */}
            <motion.div
              style={{ z: -100 }}
              className="absolute inset-0 bg-white/10 blur-[80px] md:blur-[100px] rounded-full scale-75 group-hover:bg-white/20 group-hover:scale-90 transition-all duration-700 pointer-events-none"
            />

            {/* Left/Back: Laptop */}
            <motion.img
              src="/laptop.png"
              alt="Studio Laptop Gallery Demo"
              className="absolute w-[85%] sm:w-[80%] h-auto object-contain drop-shadow-2xl transition-all duration-700 ease-out z-0 cursor-crosshair"
              style={{
                x: "-8%",
                y: "5%",
                z: -30,
                filter: "brightness(0.95) contrast(1.05)"
              }}
              whileHover={{ scale: 1.03, filter: "brightness(1) contrast(1.1)", z: 10 }}
            />

            {/* Right/Front: Mobile Kid Birthday Gallery */}
            <motion.img
              src="/kid_birthday.png"
              alt="Client Mobile Gallery View"
              className="absolute w-[35%] sm:w-[32%] h-auto object-contain drop-shadow-2xl transition-all duration-700 ease-out z-10 cursor-pointer"
              style={{
                x: "55%",
                y: "0%",
                z: 50,
              }}
              whileHover={{ scale: 1.06, z: 80 }}
            />
          </motion.div>
        </motion.div>

        {/* Feature Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="grid md:grid-cols-2 gap-6 lg:gap-10 text-left w-full mt-8 max-w-4xl mx-auto"
        >
          <div className="glass p-10 md:p-12 rounded-[3rem] flex flex-col group hover:bg-foreground/5 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl border border-foreground/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-foreground/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <div className="w-16 h-16 rounded-full border border-foreground/20 flex items-center justify-center mb-8 group-hover:bg-foreground group-hover:text-background transition-colors duration-500 relative z-10">
              <Upload className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-4xl mb-4 relative z-10">Upload High-Res</h3>
            <p className="text-base opacity-60 leading-relaxed relative z-10">
              Say goodbye to compressed images. Upload your pristine, high-resolution edits directly to Captrd Studio. We preserve the quality of your work so it looks exactly as you intended.
            </p>
          </div>

          <div className="glass p-10 md:p-12 rounded-[3rem] flex flex-col group hover:bg-foreground/5 transition-all duration-500 md:translate-y-12 hover:md:translate-y-10 hover:shadow-2xl border border-foreground/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-foreground/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <div className="w-16 h-16 rounded-full border border-foreground/20 flex items-center justify-center mb-8 group-hover:bg-foreground group-hover:text-background transition-colors duration-500 relative z-10">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-4xl mb-4 relative z-10">Easy Downloads</h3>
            <p className="text-base opacity-60 leading-relaxed relative z-10">
              Users and event guests can easily access the gallery and download high-resolution pictures straight to their devices without jumping through hoops or creating complex accounts.
            </p>
          </div>
        </motion.div>

        {/* Plan Selector & Checkout Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-32 max-w-3xl mx-auto flex flex-col items-center relative w-full"
        >
          {/* Subtle glow behind the CTA */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-foreground/10 blur-[120px] rounded-full pointer-events-none -z-10" />

          <h3 className="font-serif text-4xl md:text-5xl mb-4 text-center">Choose your Plan</h3>
          <p className="text-base opacity-60 mb-10 text-center font-light leading-relaxed max-w-md">
            Select the tier that best fits your workflow. Upgrade or cancel anytime.
          </p>

          {/* Tier Switcher Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-10 text-left">
            {/* Starter Option */}
            <div
              onClick={() => setSelectedTier('starter')}
              className={`glass p-8 rounded-[2.5rem] border cursor-pointer transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
                selectedTier === 'starter'
                  ? 'border-foreground bg-foreground/10 shadow-[0_0_30px_rgba(255,255,255,0.1)] scale-[1.02]'
                  : 'border-foreground/10 hover:border-foreground/30 opacity-70 hover:opacity-100'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs uppercase tracking-widest opacity-60">Starter</span>
                  {isAlreadySubscriber && currentUserTier === 'starter' ? (
                    <span className="px-3 py-1 rounded-full bg-foreground/20 text-foreground font-mono text-[9px] uppercase tracking-wider">
                      Current Plan
                    </span>
                  ) : selectedTier === 'starter' && (
                    <span className="px-3 py-1 rounded-full bg-foreground text-background font-mono text-[9px] uppercase tracking-wider">
                      Selected
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="font-serif text-4xl">GH₵ 69</span>
                  <span className="opacity-60 text-xs">/ month</span>
                </div>
                <p className="text-xs opacity-70 mb-6">
                  Perfect for independent photographers with small to mid-sized event galleries.
                </p>
                <ul className="space-y-2.5 text-xs opacity-80">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-foreground shrink-0" />
                    <span>Up to 150 photos per gallery</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-foreground shrink-0" />
                    <span>Up to 5 active galleries</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-foreground shrink-0" />
                    <span>High-res client downloads</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Pro Option */}
            <div
              onClick={() => setSelectedTier('pro')}
              className={`glass p-8 rounded-[2.5rem] border cursor-pointer transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
                selectedTier === 'pro'
                  ? 'border-foreground bg-foreground/10 shadow-[0_0_30px_rgba(255,255,255,0.1)] scale-[1.02]'
                  : 'border-foreground/10 hover:border-foreground/30 opacity-70 hover:opacity-100'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs uppercase tracking-widest opacity-60">Pro</span>
                  {isAlreadySubscriber && currentUserTier === 'pro' ? (
                    <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 font-mono text-[9px] uppercase tracking-wider">
                      Current Plan
                    </span>
                  ) : isAlreadySubscriber && currentUserTier === 'starter' && selectedTier === 'pro' ? (
                    <span className="px-3 py-1 rounded-full bg-amber-500 text-black font-mono text-[9px] uppercase tracking-wider font-bold">
                      Upgrade
                    </span>
                  ) : selectedTier === 'pro' && (
                    <span className="px-3 py-1 rounded-full bg-foreground text-background font-mono text-[9px] uppercase tracking-wider">
                      Selected
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="font-serif text-4xl">GH₵ 250</span>
                  <span className="opacity-60 text-xs">/ month</span>
                </div>
                <p className="text-xs opacity-70 mb-6">
                  Unlimited power for busy event and wedding photographers with high volume.
                </p>
                <ul className="space-y-2.5 text-xs opacity-80">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-foreground shrink-0" />
                    <span>Unlimited photos per gallery</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-foreground shrink-0" />
                    <span>Unlimited active galleries</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-foreground shrink-0" />
                    <span>Priority cloud storage & 100MB files</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <button
            onClick={handleSubscribe}
            disabled={isSubscribing}
            className="w-full max-w-md py-5 bg-foreground text-background rounded-full font-medium tracking-widest text-sm uppercase hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] disabled:opacity-50"
          >
            {isSubscribing
              ? "Processing..."
              : isAlreadySubscriber
              ? currentUserTier === "pro"
                ? "You're on Pro (Go to Dashboard)"
                : selectedTier === "pro"
                ? "Upgrade to Pro - GH₵ 250/mo"
                : "Current Plan: Starter (Go to Dashboard)"
              : `Subscribe to ${currentTierConfig.name} - GH₵ ${currentTierConfig.priceGHS}/mo`}
          </button>
        </motion.div>
      </div>
    </main>
  );
}
