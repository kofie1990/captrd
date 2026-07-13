"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Navigation from "@/components/Navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [message, setMessage] = useState("");
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const urlParams = new URLSearchParams(window.location.search);
        const redirectTo = urlParams.get('redirectTo');
        if (redirectTo) {
          router.push(redirectTo);
        } else {
          router.push("/dashboard");
        }
      } else {
        setCheckingSession(false);
      }
    };
    checkSession();
  }, [supabase, router]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setMessage("");

    const urlParams = new URLSearchParams(window.location.search);
    const redirectToPath = urlParams.get('redirectTo') || "/dashboard";

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}${redirectToPath}`,
      },
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center relative overflow-hidden px-6 md:px-0">
      {/* Immersive Background */}
      <div className="absolute inset-0 z-0">
        {/* High-contrast flash party background image */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-lighten filter grayscale-[20%] contrast-[115%] brightness-[60%] scale-105 pointer-events-none" 
          style={{ backgroundImage: 'url("/login_party_flash.jpg")' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/60 to-black pointer-events-none" />

        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.4, 0.2],
            rotate: [0, 5, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-white/5 blur-[120px] rounded-full pointer-events-none"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.3, 0.15],
            rotate: [0, -5, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-20%] right-[-10%] w-[70vw] h-[70vw] bg-white/10 blur-[150px] rounded-full pointer-events-none"
        />
        {/* Subtle noise texture overlay */}
        <div className="absolute inset-0 opacity-[0.18] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
      </div>

      <Navigation />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md p-10 md:p-14 bg-black/40 backdrop-blur-2xl rounded-[3rem] shadow-[0_0_80px_rgba(255,255,255,0.05)] border border-white/10 z-10 mt-20 md:mt-0 relative overflow-hidden"
      >
        {/* Card internal glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-[100px] bg-white/10 blur-[50px] rounded-full pointer-events-none" />

        <div className="relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-serif text-5xl mb-2 text-center"
          >
            Studio Login
          </motion.h1>

          <p className="text-center opacity-60 mb-10 font-mono uppercase tracking-widest text-[10px]">For Event Organizers</p>

          <div className="flex flex-col gap-6">
            <button
              onClick={handleGoogleLogin}
              disabled={loading || checkingSession}
              className="w-full bg-white text-black py-4 rounded-full font-bold tracking-wide text-sm hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center justify-center gap-3"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={checkingSession ? "opacity-50" : ""}>
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {checkingSession ? "Loading..." : loading ? "Connecting to Google..." : "Continue with Google"}
            </button>
          </div>

          <AnimatePresence>
            {message && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className={`mt-6 text-center text-xs font-mono tracking-wide ${message.includes("Account created") ? "text-green-400" : "text-red-400"}`}
              >
                {message}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </main>
  );
}
