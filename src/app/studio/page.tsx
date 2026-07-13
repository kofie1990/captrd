"use client";

import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { Upload, Download, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { usePaystackPayment } from 'react-paystack';
import { createClient } from "@/lib/supabase/client";
import dynamic from "next/dynamic";

function StudioPageContent() {
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

  const [user, setUser] = useState<any>(null);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  // Paystack fee in Ghana is 1.95%. To pass fee to customer: amount = original / (1 - 0.0195)
  const baseAmountInPesewas = 5900;
  const amountWithFee = Math.ceil(baseAmountInPesewas / 0.9805);

  const paystackConfig = {
    reference: `sub_${new Date().getTime()}`,
    email: user?.email || "subscriber@captrd.com",
    amount: amountWithFee,
    plan: process.env.NEXT_PUBLIC_PAYSTACK_STUDIO_PLAN_CODE || '',
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
    currency: 'GHS',
    metadata: {
      action: "studio_subscription",
      userId: user?.id,
      custom_fields: []
    }
  };

  const initializePayment = usePaystackPayment(paystackConfig);

  const handleSubscribe = () => {
    if (!user) {
      window.location.href = "/login?redirectTo=/studio";
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
            body: JSON.stringify({ reference: reference.reference })
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
            A dedicated subscription platform for professional photographers to upload their high-resolution event galleries, making it effortless for guests to view and download their memories.
          </motion.p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="grid md:grid-cols-2 gap-6 lg:gap-10 text-left w-full mt-8 max-w-4xl mx-auto"
        >
          
          <div className="glass p-10 md:p-12 rounded-[3rem] flex flex-col group hover:bg-foreground/5 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl border border-foreground/10 relative overflow-hidden">
            {/* Hover gradient effect */}
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
             {/* Hover gradient effect */}
             <div className="absolute inset-0 bg-gradient-to-b from-foreground/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
             
            <div className="w-16 h-16 rounded-full border border-foreground/20 flex items-center justify-center mb-8 group-hover:bg-foreground group-hover:text-background transition-colors duration-500 relative z-10">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-4xl mb-4 relative z-10">Easy Downloads</h3>
            <p className="text-base opacity-60 leading-relaxed relative z-10">
              Users and event guests can easily access the gallery and download the high-resolution pictures straight to their devices without jumping through hoops or creating complex accounts.
            </p>
          </div>
          
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-40 max-w-xl mx-auto flex flex-col items-center relative"
        >
          {/* Subtle glow behind the CTA */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-foreground/10 blur-[100px] rounded-full pointer-events-none -z-10" />

          <h3 className="font-serif text-4xl md:text-5xl mb-4 text-center">Start your Studio</h3>
          <p className="text-base opacity-60 mb-10 text-center font-light leading-relaxed">
            Join Captrd Studio for GH₵ 59/month to get unlimited high-resolution uploads and easy client delivery.
          </p>
          <button 
            onClick={handleSubscribe}
            disabled={isSubscribing}
            className="px-12 py-5 bg-foreground text-background rounded-full font-medium tracking-widest text-sm uppercase hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] disabled:opacity-50"
          >
            {isSubscribing ? "Processing..." : "Subscribe Now"}
          </button>
        </motion.div>
      </div>
    </main>
  );
}

export default dynamic(() => Promise.resolve(StudioPageContent), { ssr: false });
