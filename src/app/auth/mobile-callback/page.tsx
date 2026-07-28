"use client";

import { useEffect } from "react";

/**
 * Mobile OAuth Callback Relay
 * 
 * This page acts as a bridge between Supabase OAuth and the mobile app.
 * 
 * Flow:
 * 1. Supabase redirects here after Google auth: /auth/mobile-callback#access_token=...&refresh_token=...
 * 2. This page reads the tokens from the URL hash fragment
 * 3. Redirects to the mobile app via deep link: captrdmobile://callback#access_token=...
 * 4. The mobile app catches the deep link and sets the session
 */
export default function MobileCallbackPage() {
  useEffect(() => {
    // The tokens are in the URL hash fragment (after #)
    const hash = window.location.hash;

    if (hash) {
      // Redirect to the mobile app with the tokens via deep link
      const mobileUrl = `captrdmobile://callback${hash}`;
      window.location.href = mobileUrl;
    }
  }, []);

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
      <p className="text-white/60 font-mono text-sm animate-pulse">
        Redirecting to app...
      </p>
    </main>
  );
}
