"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Scanner } from "@yudiel/react-qr-scanner";

export default function ActionButtons() {
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [joinMethod, setJoinMethod] = useState<"code" | "qr">("code");
  const [code, setCode] = useState("");
  const router = useRouter();

  const handleJoin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (code.length === 6) {
      router.push(`/e/${code}`);
    }
  };

  const handleScan = (result: string) => {
    if (result) {
      try {
        const url = new URL(result);
        if (url.pathname.startsWith("/e/")) {
          router.push(url.pathname);
        } else if (result.length === 6) {
          router.push(`/e/${result}`);
        }
      } catch (err) {
        if (result.length === 6) {
          router.push(`/e/${result}`);
        }
      }
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 md:gap-6 mt-2 md:mt-0 z-20 relative">
        <button 
          onClick={() => router.push("/dashboard/create")}
          className="bg-foreground text-background px-8 md:px-10 py-4 md:py-5 text-sm font-medium tracking-widest uppercase hover:opacity-90 transition-opacity flex items-center justify-center"
        >
          Create Event
        </button>
        <button 
          onClick={() => setIsJoinModalOpen(true)}
          className="border border-foreground/20 bg-background/50 backdrop-blur-sm px-8 md:px-10 py-4 md:py-5 text-sm font-medium tracking-widest uppercase hover:bg-foreground/5 transition-colors flex items-center justify-center"
        >
          Join a Film
        </button>
      </div>

      {isJoinModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={() => setIsJoinModalOpen(false)} />
          <div className="relative w-full max-w-md bg-background border border-foreground/10 rounded-[2rem] p-8 shadow-2xl flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsJoinModalOpen(false)}
              className="absolute top-6 right-6 text-foreground/50 hover:text-foreground transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
            
            <h3 className="font-serif text-3xl mb-6 text-foreground">Join a Film</h3>
            
            <div className="flex bg-foreground/5 p-1 rounded-full mb-8 w-full">
              <button 
                onClick={() => setJoinMethod("code")}
                className={`flex-1 py-3 px-4 rounded-full text-xs font-mono uppercase tracking-widest transition-colors ${joinMethod === "code" ? "bg-background shadow text-foreground" : "text-foreground/60 hover:text-foreground"}`}
              >
                Enter Code
              </button>
              <button 
                onClick={() => setJoinMethod("qr")}
                className={`flex-1 py-3 px-4 rounded-full text-xs font-mono uppercase tracking-widest transition-colors ${joinMethod === "qr" ? "bg-background shadow text-foreground" : "text-foreground/60 hover:text-foreground"}`}
              >
                Scan QR
              </button>
            </div>

            {joinMethod === "code" ? (
              <form onSubmit={handleJoin} className="w-full flex flex-col items-center">
                <p className="text-sm text-foreground/60 mb-4 text-center">Enter the 6-digit code provided by the event host.</p>
                <input 
                  type="text" 
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="XXXXXX"
                  maxLength={6}
                  className="w-full text-center font-mono text-4xl py-4 bg-foreground/5 border border-foreground/10 rounded-2xl mb-6 focus:outline-none focus:ring-2 focus:ring-foreground/20"
                />
                <button 
                  type="submit"
                  disabled={code.length !== 6}
                  className="w-full py-4 rounded-full bg-foreground text-background font-mono text-xs uppercase tracking-widest disabled:opacity-50 transition-opacity"
                >
                  Join Film
                </button>
              </form>
            ) : (
              <div className="w-full flex flex-col items-center">
                <p className="text-sm text-foreground/60 mb-4 text-center">Point your camera at the event QR code.</p>
                <div className="w-full aspect-square bg-black rounded-2xl overflow-hidden relative flex items-center justify-center">
                  <Scanner 
                    onScan={(detectedCodes) => {
                      if (detectedCodes && detectedCodes.length > 0) {
                        handleScan(detectedCodes[0].rawValue);
                      }
                    }} 
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
