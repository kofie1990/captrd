"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Navigation from "@/components/Navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const supabase = createClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setMessage(error.message);
      } else if (data.session) {
        window.location.href = "/dashboard";
      } else {
        setMessage("Account created! You can now sign in.");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage(error.message);
      } else {
        window.location.href = "/dashboard";
      }
    }
    setLoading(false);
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
          <AnimatePresence mode="wait">
            <motion.h1
              key={isSignUp ? "signup" : "login"}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
              className="font-serif text-5xl mb-2 text-center"
            >
              {isSignUp ? "Join captrd" : "Login"}
            </motion.h1>
          </AnimatePresence>

          <p className="text-center opacity-60 mb-10 font-mono uppercase tracking-widest text-[10px]">For Event Organizers</p>

          <form onSubmit={handleAuth} className="flex flex-col gap-6">
            <input
              type="email"
              placeholder="Email Address"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="mt-6 bg-white text-black py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            >
              {loading ? "Authenticating..." : isSignUp ? "Create Account" : "Enter Studio"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setMessage("");
              }}
              className="text-[10px] font-mono uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity"
            >
              {isSignUp ? "Already have an account? Sign In" : "Need an account? Sign Up"}
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
