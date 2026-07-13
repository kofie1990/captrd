"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { QRCodeSVG } from "qrcode.react";
import { toPng } from "html-to-image";

type Event = {
  id: string;
  title: string;
  reveal_at: string;
  short_code: string;
  cover_photo_url?: string;
  invite_details?: string;
};

export default function PrintPoster() {
  const params = useParams();
  const eventId = params.id as string;
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const posterRef = useRef<HTMLElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const hasAutoDownloaded = useRef(false);

  const supabase = createClient();

  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) return;
      const { data } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .single();
      
      if (data) setEvent(data);
      setLoading(false);
    };
    fetchEvent();
  }, [eventId, supabase]);

  const handleDownload = async () => {
    if (!posterRef.current || !event) return;
    try {
      setIsGenerating(true);
      
      const dataUrl = await toPng(posterRef.current, {
        pixelRatio: 4, // Very high definition
        backgroundColor: "#000000"
      });
      
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `${event.title.replace(/\s+/g, '_')}_Poster.png`;
      link.click();
    } catch (error) {
      console.error("Error generating poster:", error);
      alert("Failed to generate high-resolution poster. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (!loading && event && !hasAutoDownloaded.current) {
      hasAutoDownloaded.current = true;
      const timer = setTimeout(() => {
        handleDownload();
      }, 800);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, event]);

  if (loading) return null;
  if (!event) return <div className="p-8 text-white">Event not found.</div>;

  const eventUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/e/${event.short_code || event.id}`
    : "";

  return (
    <>
      <style jsx global>{`
        body {
          margin: 0;
          padding: 0;
          background: #000;
        }
      `}</style>
      
      <main 
        ref={posterRef}
        className="w-[210mm] h-[297mm] relative overflow-hidden bg-black text-white mx-auto shadow-2xl flex flex-col justify-end"
      >
        
        {/* Background Image */}
        <img 
          src={event.cover_photo_url || "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=800&auto=format&fit=crop"} 
          alt={event.title} 
          className="absolute inset-0 w-full h-full object-cover opacity-80"
          style={{ objectPosition: 'center 20%' }}
        />
        
        {/* Dark Gradient Overlay for Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />

        {/* Content */}
        <div className="relative z-10 w-full p-[15mm] flex flex-col items-center text-center pb-[20mm]">
          
          <h1 className="font-serif text-6xl md:text-7xl mb-4 text-white drop-shadow-lg tracking-tight leading-tight max-w-[90%]">
            {event.title}
          </h1>
          
          <p className="font-mono text-lg uppercase tracking-[0.3em] opacity-80 mb-12 text-white drop-shadow-md">
            {new Date(event.reveal_at).toLocaleDateString()}
          </p>

          {/* QR Code Block */}
          <div className="bg-white/95 backdrop-blur-xl p-8 rounded-[3rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] mb-12 flex flex-col items-center">
            <QRCodeSVG value={eventUrl} size={250} />
            <div className="mt-6 font-mono text-xs uppercase tracking-widest text-black/40">
              Scan to join Film Roll
            </div>
          </div>

          {event.invite_details && (
            <p className="font-serif text-2xl italic opacity-90 max-w-[80%] leading-relaxed drop-shadow-md">
              "{event.invite_details}"
            </p>
          )}

        </div>
      </main>

      {/* Helper UI */}
      <div className="fixed top-6 right-6 z-50">
         <button 
           onClick={handleDownload}
           disabled={isGenerating}
           className="bg-white text-black px-6 py-3 rounded-full font-mono text-sm uppercase tracking-widest font-bold shadow-2xl hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
         >
           {isGenerating ? "Generating HD Image..." : "Save HD Poster"}
         </button>
      </div>
    </>
  );
}
