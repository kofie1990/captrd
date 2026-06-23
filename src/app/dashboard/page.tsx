"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import FilterSelector from "@/components/FilterSelector";
import { QRCodeSVG } from "qrcode.react";

type Event = {
  id: string;
  title: string;
  reveal_at: string;
  aesthetic_filter: string;
  short_code: string;
  max_photos_per_user: number;
  cover_photo_url?: string;
};

export default function Dashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [joinedEvents, setJoinedEvents] = useState<Event[]>([]);
  const [activeTab, setActiveTab] = useState<"created" | "joined">("created");
  const [totalPhotos, setTotalPhotos] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [sharingEvent, setSharingEvent] = useState<Event | null>(null);
  const [copied, setCopied] = useState(false);

  const supabase = createClient();
  const generateShortCode = () => Math.random().toString(36).substring(2, 8).toLowerCase();

  useEffect(() => {
    const fetchUserAndEvents = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = "/login";
        return;
      }
      setUserId(session.user.id);
      setUserName(session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || "Photographer");

      const { data } = await supabase
        .from("events")
        .select("*")
        .eq("admin_id", session.user.id)
        .order("created_at", { ascending: false });
      if (data) {
        setEvents(data);

        const eventIds = data.map(e => e.id);
        if (eventIds.length > 0) {
          const { count } = await supabase
            .from("photos")
            .select("*", { count: 'exact', head: true })
            .in("event_id", eventIds);
          if (count) setTotalPhotos(count);
        }
      }

      const { data: joinedData } = await supabase
        .from("event_participants")
        .select("events(*)")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (joinedData) {
        const mappedJoined = joinedData.map((d: any) => d.events).filter(Boolean);
        setJoinedEvents(mappedJoined);
      }

      setLoading(false);
    };

    fetchUserAndEvents();
  }, [supabase]);

  const handleEventCreated = (newEvent: Event) => {
    setEvents([newEvent, ...events]);
  };

  const getEventUrl = (code: string) => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/e/${code}`;
    }
    return "";
  };

  const handleCopyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link");
    }
  };

  if (loading) return null;

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col relative pt-8 md:pt-12 px-6 md:px-16 pb-20">
      {/* Welcome Section */}
      <div className="w-full max-w-[1600px] mx-auto mt-8 md:mt-12 mb-6 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl tracking-tight">
            Welcome back, <span className="italic">{userName || "Photographer"}</span>
          </h1>
          <p className="text-foreground/60 mt-2 max-w-lg text-sm md:text-base">
            Manage your rolls, order prints, and grow your studio.
          </p>
        </div>

        {/* Primary Action */}
        <div className="w-full lg:w-auto mt-6 lg:mt-0">
          <a href="/dashboard/order" className="p-6 md:p-8 border border-foreground/20 bg-foreground/5 backdrop-blur-md rounded-[2rem] hover:bg-foreground/10 transition-colors group relative overflow-hidden flex flex-col justify-center min-w-[280px]">
            <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:scale-110 transition-transform duration-500">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect width="12" height="8" x="6" y="14" /></svg>
            </div>
            <p className="font-serif text-2xl md:text-3xl mb-2 group-hover:translate-x-2 transition-transform duration-300">Order Prints</p>
            <p className="font-mono text-[9px] md:text-[10px] uppercase tracking-widest opacity-60">Physical Film Delivery &rarr;</p>
          </a>
        </div>
      </div>

      {/* Studio Overview Metrics */}
      <div className="w-full max-w-[1600px] mx-auto mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12">
        <div className="p-6 md:p-8 glass rounded-[2rem] flex flex-col justify-center shadow-lg border border-foreground/5 bg-foreground/5 backdrop-blur-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /><circle cx="12" cy="13" r="3" /></svg>
          </div>
          <p className="font-mono text-[9px] md:text-[10px] uppercase tracking-widest opacity-60 mb-2 relative z-10">Total Rolls</p>
          <p className="font-serif text-4xl md:text-5xl relative z-10 group-hover:scale-105 transition-transform duration-300 origin-left">{events.length}</p>
        </div>
        <div className="p-6 md:p-8 glass rounded-[2rem] flex flex-col justify-center shadow-lg border border-foreground/5 bg-foreground/5 backdrop-blur-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
          </div>
          <p className="font-mono text-[9px] md:text-[10px] uppercase tracking-widest opacity-60 mb-2 relative z-10">Moments Captrd</p>
          <p className="font-serif text-4xl md:text-5xl relative z-10 group-hover:scale-105 transition-transform duration-300 origin-left">{totalPhotos}</p>
        </div>
        <div className="col-span-2 p-6 md:p-8 rounded-[2rem] border border-foreground/10 bg-gradient-to-br from-foreground/5 to-transparent flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-foreground/10 rounded-full blur-3xl group-hover:bg-foreground/20 transition-colors duration-500"></div>
          <h3 className="font-serif text-xl md:text-2xl mb-1 relative z-10">Captr every memory</h3>
          <p className="text-sm opacity-60 max-w-sm relative z-10">Create a new roll to start collecting photos from your guests.</p>
        </div>
      </div>

      <div className="w-full max-w-[1600px] mx-auto">
        <div className="w-full">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-6">
              <button 
                onClick={() => setActiveTab("created")}
                className={`font-serif text-2xl md:text-3xl transition-opacity ${activeTab === "created" ? "opacity-100" : "opacity-40 hover:opacity-70"}`}
              >
                Your Rolls
              </button>
              <button 
                onClick={() => setActiveTab("joined")}
                className={`font-serif text-2xl md:text-3xl transition-opacity ${activeTab === "joined" ? "opacity-100" : "opacity-40 hover:opacity-70"}`}
              >
                Joined
              </button>
            </div>
            <a href="/dashboard/create" className="bg-foreground/5 border border-foreground/10 text-foreground px-6 py-2.5 rounded-full font-mono font-bold uppercase tracking-widest text-[10px] md:text-xs hover:bg-foreground/10 active:scale-[0.98] transition-all flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
              <span className="hidden md:inline">Create Roll</span>
              <span className="md:hidden">Create</span>
            </a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {(activeTab === "created" ? events : joinedEvents).map((ev) => (
              <div key={ev.id} className="relative aspect-[4/5] rounded-[3rem] overflow-hidden group shadow-2xl border border-foreground/10 bg-black">
                {/* Background Cover Photo */}
                <img
                  src={ev.cover_photo_url || "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=800&auto=format&fit=crop"}
                  alt={ev.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20" />

                {/* Content */}
                <div className="absolute inset-0 p-8 flex flex-col items-center justify-between text-[#fcfcfc]">
                  <div className="text-center w-full mt-4">
                    <h3 className="font-serif text-3xl md:text-4xl mb-2 drop-shadow-lg tracking-tight leading-tight">{ev.title}</h3>
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-80 drop-shadow-md">
                      Reveals: {new Date(ev.reveal_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="w-full flex flex-col gap-3">
                    <button
                      onClick={() => setSharingEvent(ev)}
                      className="w-full text-center text-xs font-mono font-bold tracking-widest uppercase hover:scale-[1.02] active:scale-95 transition-all bg-white text-black py-4 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                    >
                      Share Invite
                    </button>
                    <div className="flex gap-3 justify-center">
                      <a href={`/e/${ev.short_code || ev.id}`} target="_blank" className="flex-1 text-center text-[10px] font-mono tracking-widest uppercase hover:bg-white/10 active:scale-95 transition-all border border-white/30 backdrop-blur-md py-3 rounded-full">
                        Preview
                      </a>
                      <a href={`/dashboard/event/${ev.id}`} className="flex-1 text-center text-[10px] font-mono tracking-widest uppercase hover:bg-white/10 active:scale-95 transition-all border border-white/30 backdrop-blur-md py-3 rounded-full">
                        Manage
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {(activeTab === "created" ? events : joinedEvents).length === 0 && (
              <div className="col-span-full py-24 text-center border border-dashed border-foreground/20 rounded-[3rem]">
                <p className="opacity-50 italic font-serif text-2xl">
                  {activeTab === "created" ? "No film rolls created yet." : "You haven't joined any rolls yet."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SHARE MODAL */}
      {sharingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSharingEvent(null)} />
          <div className="relative w-full max-w-sm bg-[#111] border border-white/10 rounded-[2rem] p-8 shadow-2xl flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setSharingEvent(null)}
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
            </button>

            <h3 className="font-serif text-2xl mb-2 text-white">Share Roll</h3>
            <p className="font-mono text-[10px] uppercase tracking-widest opacity-50 mb-8 text-center text-white">{sharingEvent.title}</p>

            <div className="bg-white p-3 rounded-2xl mb-8 shadow-lg">
              <QRCodeSVG value={getEventUrl(sharingEvent.short_code || sharingEvent.id)} size={140} />
            </div>

            <div className="w-full flex flex-col gap-3">
              <button
                onClick={() => handleCopyLink(getEventUrl(sharingEvent.short_code || sharingEvent.id))}
                className="w-full py-3 rounded-xl border border-white/20 hover:bg-white/5 transition-colors font-mono text-[10px] uppercase tracking-widest text-white flex items-center justify-center gap-2"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
                {copied ? "Copied!" : "Copy Link"}
              </button>

              <a
                href={`/print/${sharingEvent.id}`}
                target="_blank"
                className="w-full py-3 rounded-xl bg-white text-black hover:opacity-90 transition-opacity font-mono text-[10px] uppercase tracking-widest font-bold flex items-center justify-center gap-2"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect width="12" height="8" x="6" y="14" /></svg>
                Print PDF Poster
              </a>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
