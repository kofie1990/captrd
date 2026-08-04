"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, CheckCircle, Image as ImageIcon, Book, LayoutGrid, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { getFilterClass } from "@/lib/filters";

type Event = {
  id: string;
  title: string;
  cover_photo_url?: string;
  aesthetic_filter: string;
};

type Photo = {
  id: string;
  storage_path: string;
  guest_name: string;
  created_at: string;
};

export default function OrderPrintsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [fetchingPhotos, setFetchingPhotos] = useState(false);

  // Customization state
  const [format, setFormat] = useState<"photobook" | "polaroids">("photobook");
  const [finish, setFinish] = useState<"matte" | "glossy">("matte");
  const [title, setTitle] = useState("");
  const [showAnnotations, setShowAnnotations] = useState(true);

  // Preview state
  const [currentBookPage, setCurrentBookPage] = useState(0);

  // Shipping state
  const [shippingName, setShippingName] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingZip, setShippingZip] = useState("");

  // Checkout state
  const [showShippingStep, setShowShippingStep] = useState(false);
  const [simulatingCheckout, setSimulatingCheckout] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchEvents = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = "/login";
        return;
      }
      const { data } = await supabase
        .from("events")
        .select("id, title, cover_photo_url, aesthetic_filter")
        .eq("admin_id", session.user.id)
        .order("created_at", { ascending: false });

      if (data) setEvents(data);
      setLoading(false);
    };
    fetchEvents();
  }, [supabase]);

  const handleSelectEvent = async (event: Event) => {
    setSelectedEvent(event);
    setTitle(event.title);
    setCurrentBookPage(0);
    setFetchingPhotos(true);
    const { data } = await supabase
      .from("photos")
      .select("id, storage_path, guest_name, created_at")
      .eq("event_id", event.id)
      .limit(10); // fetch a few for preview

    if (data) setPhotos(data);
    setFetchingPhotos(false);
  };

  const handlePlaceOrder = async () => {
    if (!selectedEvent) return;
    setSimulatingCheckout(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = "/login";
        return;
      }

      const { error } = await supabase.from('orders').insert({
        user_id: session.user.id,
        event_id: selectedEvent.id,
        format,
        finish,
        shipping_name: shippingName,
        shipping_address: shippingAddress,
        shipping_city: shippingCity,
        shipping_zip: shippingZip,
        status: 'pending'
      });

      if (error) {
        console.error("Error placing order:", error);
        alert("Failed to place order. Please try again.");
      } else {
        setOrderComplete(true);
      }
    } catch (err) {
      console.error(err);
      alert("An unexpected error occurred.");
    } finally {
      setSimulatingCheckout(false);
    }
  };

  if (loading) return null;

  if (orderComplete) {
    return (
      <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6">
        <div className="glass p-12 rounded-[3rem] shadow-2xl border border-foreground/10 flex flex-col items-center max-w-md w-full text-center animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="font-serif text-4xl mb-4">Order Placed!</h1>
          <p className="text-foreground/60 mb-8 font-mono text-xs leading-relaxed">
            Your {format === "photobook" ? "photobook" : "print set"} for "{title}" is being prepared. You will receive an email confirmation shortly.
          </p>
          <button onClick={() => router.push("/dashboard")} className="bg-foreground text-background px-8 py-3.5 rounded-full font-mono font-bold uppercase tracking-widest text-xs hover:opacity-90 active:scale-[0.98] transition-all w-full shadow-lg shadow-foreground/10">
            Back to Dashboard
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col relative pt-8 md:pt-12 px-6 md:px-16 pb-20">
      <div className="w-full max-w-[1600px] mx-auto">
        <button onClick={() => {
          if (showShippingStep) setShowShippingStep(false);
          else if (selectedEvent) setSelectedEvent(null);
          else router.push('/dashboard');
        }} className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest opacity-60 hover:opacity-100 mb-8 transition-opacity">
          <ArrowLeft className="w-4 h-4" /> {showShippingStep ? "Back to Customization" : selectedEvent ? "Change Roll" : "Back to Dashboard"}
        </button>

        {!selectedEvent ? (
          // Step 1: Select Roll
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl tracking-tight mb-2">Order Prints</h1>
            <p className="text-foreground/60 max-w-xl text-sm md:text-base mb-12">Select a film roll to begin creating your custom physical prints or photobook.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
              {events.map(ev => (
                <button
                  key={ev.id}
                  onClick={() => handleSelectEvent(ev)}
                  className="group relative aspect-[4/5] rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl border border-foreground/10 bg-black text-left flex flex-col justify-end p-6 md:p-8 hover:scale-[1.02] transition-transform duration-300"
                >
                  <img src={ev.cover_photo_url || "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=800&auto=format&fit=crop"} alt={ev.title} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20" />
                  <div className="relative z-10 flex flex-col h-full justify-between w-full">
                    <div className="self-end bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                      <span className="font-mono text-[9px] uppercase tracking-widest text-white">Select</span>
                    </div>
                    <div>
                      <h3 className="font-serif text-2xl md:text-3xl text-white tracking-tight leading-tight">{ev.title}</h3>
                    </div>
                  </div>
                </button>
              ))}
              {events.length === 0 && (
                <div className="col-span-full py-24 text-center border border-dashed border-foreground/20 rounded-[3rem]">
                  <p className="opacity-50 italic font-serif text-2xl">No film rolls created yet.</p>
                </div>
              )}
            </div>
          </div>
        ) : showShippingStep ? (
          // Step 3: Shipping Details
          <div className="flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-8 duration-500 py-4 md:py-12">
            <div className="w-full max-w-md glass p-8 md:p-12 rounded-[3rem] border border-foreground/10 shadow-2xl flex flex-col gap-6 bg-foreground/5 dark:bg-[#0a0a0a]">
              <div className="text-center mb-4">
                <h2 className="font-serif text-3xl mb-2">Shipping Details</h2>
                <p className="text-foreground/60 text-sm">Where should we send your {format === "photobook" ? "photobook" : "prints"}?</p>
              </div>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={shippingName}
                  onChange={e => setShippingName(e.target.value)}
                  className="w-full bg-background border border-foreground/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-foreground transition-colors"
                />
                <input
                  type="text"
                  placeholder="Address"
                  value={shippingAddress}
                  onChange={e => setShippingAddress(e.target.value)}
                  className="w-full bg-background border border-foreground/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-foreground transition-colors"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="City"
                    value={shippingCity}
                    onChange={e => setShippingCity(e.target.value)}
                    className="w-full bg-background border border-foreground/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-foreground transition-colors"
                  />
                  <input
                    type="text"
                    placeholder="ZIP Code"
                    value={shippingZip}
                    onChange={e => setShippingZip(e.target.value)}
                    className="w-full bg-background border border-foreground/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-foreground transition-colors"
                  />
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-foreground/10">
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-60 mb-1">Total</p>
                    <p className="font-serif text-3xl">$34.99</p>
                  </div>
                  <p className="text-sm opacity-60">Free shipping</p>
                </div>
                <button
                  onClick={handlePlaceOrder}
                  disabled={simulatingCheckout || !shippingName || !shippingAddress || !shippingCity || !shippingZip}
                  className="w-full bg-foreground text-background py-4 rounded-full font-mono font-bold uppercase tracking-widest text-xs hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-foreground/10"
                >
                  {simulatingCheckout ? "Processing..." : "Place Order"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Step 2: Customize & Preview
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 animate-in fade-in slide-in-from-right-8 duration-500">
            {/* Controls (Left) */}
            <div className="w-full lg:w-1/3 flex flex-col gap-8">
              <div>
                <h1 className="font-serif text-4xl mb-2">Customize</h1>
                <p className="text-foreground/60 text-sm">Configure your print options for "{selectedEvent.title}"</p>
              </div>

              {/* Format Selection */}
              <div className="space-y-4">
                <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-60">Format</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setFormat("photobook")}
                    className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-3 transition-all ${format === "photobook" ? "bg-foreground text-background border-foreground shadow-lg shadow-foreground/10" : "bg-foreground/5 border-foreground/10 hover:bg-foreground/10 text-foreground"}`}
                  >
                    <Book className="w-6 h-6" />
                    <span className="font-medium text-xs">Photobook</span>
                  </button>
                  <button
                    onClick={() => setFormat("polaroids")}
                    className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-3 transition-all ${format === "polaroids" ? "bg-foreground text-background border-foreground shadow-lg shadow-foreground/10" : "bg-foreground/5 border-foreground/10 hover:bg-foreground/10 text-foreground"}`}
                  >
                    <LayoutGrid className="w-6 h-6" />
                    <span className="font-medium text-xs">Classic Prints</span>
                  </button>
                </div>
              </div>

              {/* Paper Finish */}
              <div className="space-y-4">
                <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-60">Paper Finish</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setFinish("matte")}
                    className={`px-4 py-3 rounded-xl border font-medium text-xs transition-all ${finish === "matte" ? "bg-foreground text-background border-foreground shadow-lg shadow-foreground/10" : "bg-foreground/5 border-foreground/10 hover:bg-foreground/10 text-foreground"}`}
                  >
                    Matte
                  </button>
                  <button
                    onClick={() => setFinish("glossy")}
                    className={`px-4 py-3 rounded-xl border font-medium text-xs transition-all ${finish === "glossy" ? "bg-foreground text-background border-foreground shadow-lg shadow-foreground/10" : "bg-foreground/5 border-foreground/10 hover:bg-foreground/10 text-foreground"}`}
                  >
                    Glossy
                  </button>
                </div>
              </div>

              {/* Title Input */}
              {format === "photobook" && (
                <div className="space-y-4">
                  <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-60">Cover Title</h3>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white transition-colors"
                  />
                </div>
              )}

              {/* Annotations Toggle */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-60">Photo Details</h3>
                    <p className="text-xs opacity-60 mt-1">Print guest name and time on photos</p>
                  </div>
                  <button
                    onClick={() => setShowAnnotations(!showAnnotations)}
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${showAnnotations ? 'bg-foreground' : 'bg-foreground/20'}`}
                  >
                    <div className={`w-4 h-4 rounded-full transition-transform duration-300 ${showAnnotations ? 'translate-x-6 bg-background' : 'translate-x-0 bg-background'}`} />
                  </button>
                </div>
              </div>

              {/* Action CTA */}
              <div className="mt-auto pt-8 border-t border-foreground/10">
                <button
                  onClick={() => setShowShippingStep(true)}
                  className="w-full bg-foreground text-background py-4 rounded-full font-mono font-bold uppercase tracking-widest text-xs hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-foreground/10"
                >
                  Continue to Shipping
                </button>
              </div>
            </div>

            {/* Preview (Right) */}
            <div className="w-full lg:w-2/3 h-[500px] lg:h-[700px] glass rounded-[3rem] border border-foreground/10 relative overflow-hidden flex items-center justify-center p-4 sm:p-8 lg:p-16 shadow-2xl bg-foreground/5 dark:bg-[#0a0a0a]">
              {/* Subtle background glow */}
              <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                <div className="w-[500px] h-[500px] bg-foreground/20 rounded-full blur-[120px]"></div>
              </div>

              {fetchingPhotos ? (
                <div className="font-mono text-xs uppercase tracking-widest opacity-60 animate-pulse">Loading preview...</div>
              ) : (
                <div className="w-full h-full relative flex items-center justify-center">
                  {format === "photobook" ? (
                    // Photobook Preview
                    <div className="flex flex-col items-center gap-6">
                      <div
                        className="relative w-full max-w-[320px] aspect-[3/4] bg-[#f8f8f8] rounded-r-2xl rounded-l-md shadow-[30px_30px_60px_rgba(0,0,0,0.8),inset_3px_0_10px_rgba(255,255,255,0.7)] flex flex-col transition-all duration-700 hover:scale-105"
                        style={{ transform: "perspective(1200px) rotateY(-12deg) rotateX(4deg)" }}
                      >
                        {/* Spine shadow */}
                        <div className="absolute left-0 inset-y-0 w-6 bg-gradient-to-r from-black/30 via-black/5 to-transparent z-10 rounded-l-md pointer-events-none" />
                        <div className="absolute left-0 inset-y-0 w-[1px] bg-white/50 z-20 pointer-events-none" />

                        <div className="flex-1 p-6 flex flex-col z-0 overflow-hidden">
                          {currentBookPage === 0 ? (
                            <>
                              {/* Cover */}
                              <div className="flex-1 rounded-sm border border-black/10 overflow-hidden relative bg-[#e0e0e0] shadow-inner">
                                <img
                                  src={selectedEvent.cover_photo_url || "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=800&auto=format&fit=crop"}
                                  className={`w-full h-full object-cover ${getFilterClass(selectedEvent.aesthetic_filter)}`}
                                  alt="Cover"
                                />
                                {finish === "glossy" && <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/30 to-white/0 pointer-events-none mix-blend-overlay" />}
                              </div>
                              <div className="mt-8 md:mt-10 text-center">
                                <h2 className="font-serif text-2xl md:text-3xl text-[#111] tracking-tight">{title || "Untitled Roll"}</h2>
                                <p className="font-mono text-[8px] md:text-[9px] uppercase tracking-widest text-[#777] mt-3">Captrd Print Studio</p>
                              </div>
                            </>
                          ) : (
                            <>
                              {/* Inner Page */}
                              <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-hidden w-full h-full">
                                <div className="flex flex-col max-w-full max-h-full items-center">
                                  <div className="relative shrink min-h-0 shadow-sm rounded-[6px] overflow-hidden bg-[#111] inline-flex">
                                    <img
                                      src={photos[currentBookPage - 1]?.storage_path}
                                      className={`max-w-full max-h-full object-contain ${getFilterClass(selectedEvent.aesthetic_filter)}`}
                                      style={{ maxHeight: '400px' }}
                                      alt="Inner photo"
                                    />
                                    {finish === "glossy" && <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/30 to-white/0 pointer-events-none mix-blend-overlay" />}
                                  </div>
                                  {showAnnotations && photos[currentBookPage - 1] && (
                                    <div className="mt-3 flex justify-between items-end w-full shrink-0 px-1">
                                      <p className="font-serif italic text-xs md:text-sm text-[#333] truncate pr-2">{photos[currentBookPage - 1].guest_name}</p>
                                      <p className="font-mono text-[6px] md:text-[8px] uppercase tracking-widest text-[#999] whitespace-nowrap">
                                        {new Date(photos[currentBookPage - 1].created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Interactive Page Controls */}
                      {photos.length > 0 && (
                        <div className="flex items-center gap-6 bg-background/80 backdrop-blur-md rounded-full px-6 py-3 border border-foreground/10 relative z-30 shadow-lg text-foreground">
                          <button
                            onClick={() => setCurrentBookPage(Math.max(0, currentBookPage - 1))}
                            disabled={currentBookPage === 0}
                            className="hover:opacity-70 disabled:opacity-30 transition-opacity"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <span className="font-mono text-[10px] uppercase tracking-widest opacity-60 w-24 text-center">
                            Page {currentBookPage} / {photos.length}
                          </span>
                          <button
                            onClick={() => setCurrentBookPage(Math.min(photos.length, currentBookPage + 1))}
                            disabled={currentBookPage === photos.length}
                            className="hover:opacity-70 disabled:opacity-30 transition-opacity"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    // Polaroids / Classic Prints Preview
                    <div className="relative w-full h-full flex items-center justify-center transition-all duration-700">
                      {photos.slice(0, 4).map((photo, i) => (
                        <div
                          key={photo.id}
                          className={`absolute w-40 md:w-52 lg:w-60 aspect-[3/4] bg-[#fcfcfc] p-3 md:p-4 ${showAnnotations ? 'pb-5' : 'pb-10'} shadow-[0_20px_40px_rgba(0,0,0,0.5)] transition-all duration-500 border border-black/5 hover:scale-105 hover:z-50 flex flex-col`}
                          style={{
                            transform: `rotate(${i === 0 ? -12 : i === 1 ? 8 : i === 2 ? -4 : 15}deg) translate(${i * 20 - 25}px, ${i * 12 - 12}px)`,
                            zIndex: 10 - i,
                          }}
                        >
                          <div className="flex-1 w-full bg-[#111] overflow-hidden relative shadow-inner">
                            <img src={photo.storage_path} className={`w-full h-full object-cover ${getFilterClass(selectedEvent.aesthetic_filter)}`} alt="Print" />
                            {finish === "glossy" && <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent pointer-events-none mix-blend-overlay" />}
                          </div>
                          {showAnnotations && (
                            <div className="mt-1 md:mt-2 flex flex-col items-center overflow-hidden w-full">
                              <p className="font-serif italic text-[10px] md:text-xs text-[#222] truncate w-full text-center">{photo.guest_name}</p>
                              <p className="font-mono text-[5px] md:text-[6px] uppercase tracking-widest text-[#777] whitespace-nowrap mt-[2px]">
                                {new Date(photo.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                      {photos.length === 0 && (
                        <div className="w-32 md:w-40 lg:w-48 aspect-[3/4] bg-[#fcfcfc] p-3 pb-12 shadow-2xl border border-black/5 flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-black/20" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
