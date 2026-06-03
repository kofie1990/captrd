"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Navigation from "@/components/Navigation";

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
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center relative">
      <Navigation />
      
      <div className="w-full max-w-md p-8 md:p-12 glass rounded-[2.5rem] shadow-2xl z-10 mt-20 md:mt-0">
        <h1 className="font-serif text-4xl mb-2 text-center">
          {isSignUp ? "Join Studio" : "Studio Login"}
        </h1>
        <p className="text-center opacity-60 mb-10 font-mono uppercase tracking-widest text-xs">For Event Organizers</p>
        
        <form onSubmit={handleAuth} className="flex flex-col gap-6">
          <input
            type="email"
            placeholder="Email Address"
            className="w-full bg-transparent border-b border-foreground/20 py-3 focus:outline-none focus:border-foreground transition-colors"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full bg-transparent border-b border-foreground/20 py-3 focus:outline-none focus:border-foreground transition-colors"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button 
            type="submit" 
            disabled={loading}
            className="mt-6 bg-foreground text-background py-4 rounded-full font-medium uppercase tracking-widest text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
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
            className="text-xs font-mono uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity"
          >
            {isSignUp ? "Already have an account? Sign In" : "Need an account? Sign Up"}
          </button>
        </div>

        {message && (
          <p className={`mt-6 text-center text-sm ${message.includes("Account created") ? "text-green-500" : "text-red-500"}`}>
            {message}
          </p>
        )}
      </div>
    </main>
  );
}
