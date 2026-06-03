"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Trash2, Unlock, AlertTriangle, ArrowLeft, UploadCloud, Users, Image as ImageIcon, X as CloseIcon, Download, ChevronLeft, ChevronRight } from "lucide-react";
import FilterSelector from "@/components/FilterSelector";
import { getFilterClass } from "@/lib/filters";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminEventPortal() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;
  const supabase = createClient();

  const [eventData, setEventData] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<string | null>(null);
  const [updatingFilter, setUpdatingFilter] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<any | null>(null);
  const [isRosterOpen, setIsRosterOpen] = useState(false);

  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        router.push("/login");
        return;
      }

      const { data: event } = await supabase.from("events").select("*").eq("id", eventId).single();
      if (event && event.admin_id !== sessionData.session.user.id) {
        router.push("/dashboard");
        return;
      }
      setEventData(event);

      const { data: fetchedPhotos } = await supabase.from("photos").select("*").eq("event_id", eventId).order("created_at", { ascending: false });
      if (fetchedPhotos) setPhotos(fetchedPhotos);

      setLoading(false);
    };
    fetchData();
  }, [eventId, supabase, router]);

  const forceReveal = async () => {
    if (!confirm("Are you sure you want to force reveal this roll to all guests immediately?")) return;

    const now = new Date().toISOString();
    const { error } = await supabase.from("events").update({ reveal_at: now }).eq("id", eventId);
    if (!error) {
      setEventData({ ...eventData, reveal_at: now });
      alert("Event has been revealed!");
    }
  };

  const deletePhoto = async (photoId: string, storageUrl: string) => {
    if (!confirm("Delete this photo? This cannot be undone.")) return;

    const urlParts = storageUrl.split("/event-photos/");
    if (urlParts.length === 2) {
      const path = urlParts[1];
      await supabase.storage.from("event-photos").remove([path]);
    }

    const { error } = await supabase.from("photos").delete().eq("id", photoId);
    if (!error) {
      setPhotos(photos.filter(p => p.id !== photoId));
    }
  };

  const deleteEvent = async () => {
    if (!confirm("DANGER: Delete this entire event and all photos? This CANNOT be undone.")) return;

    if (photos.length > 0) {
      const paths = photos.map(p => p.storage_path.split("/event-photos/")[1]).filter(Boolean);
      if (paths.length > 0) await supabase.storage.from("event-photos").remove(paths);
    }

    const { error } = await supabase.from("events").delete().eq("id", eventId);
    if (!error) {
      router.push("/dashboard");
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    try {
      const fileName = `${eventId}-${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage.from("covers").upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from("covers").getPublicUrl(fileName);

      const { error: dbError } = await supabase.from("events").update({ cover_photo_url: publicUrl }).eq("id", eventId);
      if (dbError) throw dbError;

      setEventData({ ...eventData, cover_photo_url: publicUrl });
    } catch (err) {
      console.error(err);
      alert("Failed to upload cover photo.");
    } finally {
      setUploadingCover(false);
    }
  };

  const handleFilterChange = async (filterId: string) => {
    if (filterId === eventData.aesthetic_filter) return;
    setUpdatingFilter(true);
    const { error } = await supabase.from("events").update({ aesthetic_filter: filterId }).eq("id", eventId);
    if (!error) {
      setEventData({ ...eventData, aesthetic_filter: filterId });
    } else {
      alert("Failed to update filter.");
    }
    setUpdatingFilter(false);
  };

  const handleShare = async (mediaUrl: string, type: string) => {
    try {
      const response = await fetch(mediaUrl);
      const blob = await response.blob();
      const ext = type === 'video' ? 'mp4' : 'jpg';
      const file = new File([blob], `captrd-moment.${ext}`, { type: blob.type });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'My Captrd Moment',
          files: [file]
        });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `captrd-moment.${ext}`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      console.error(e);
      alert("Sharing is not supported on this browser. Try saving it instead.");
    }
  };

  const handleDownload = async (mediaUrl: string, type: string) => {
    try {
      const response = await fetch(mediaUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const ext = type === 'video' ? 'mp4' : 'jpg';
      const a = document.createElement('a');
      a.href = url;
      a.download = `captrd-moment.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    }
  };

  const isRevealed = eventData ? new Date() >= new Date(eventData.reveal_at) : false;
  const guestStats = photos.reduce((acc: { [key: string]: number }, photo) => {
    acc[photo.guest_name] = (acc[photo.guest_name] || 0) + 1;
    return acc;
  }, {});

  const uniqueGuestsList = Object.keys(guestStats).sort((a, b) => a.localeCompare(b));
  const uniqueGuests = uniqueGuestsList.length;
  const shortUrl = eventData ? `${window.location.origin}/e/${eventData.short_code || eventData.id}` : '';

  const visiblePhotos = selectedGuest ? photos.filter(p => p.guest_name === selectedGuest) : photos;

  const handleNext = () => {
    if (!selectedMedia) return;
    const currentIndex = visiblePhotos.findIndex(p => p.id === selectedMedia.id);
    if (currentIndex < visiblePhotos.length - 1) setSelectedMedia(visiblePhotos[currentIndex + 1]);
    else setSelectedMedia(visiblePhotos[0]);
  };

  const handlePrev = () => {
    if (!selectedMedia) return;
    const currentIndex = visiblePhotos.findIndex(p => p.id === selectedMedia.id);
    if (currentIndex > 0) setSelectedMedia(visiblePhotos[currentIndex - 1]);
    else setSelectedMedia(visiblePhotos[visiblePhotos.length - 1]);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedMedia) return;
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedMedia, visiblePhotos]);

  const handleTouchStart = (e: React.TouchEvent) => setTouchStartX(e.targetTouches[0].clientX);
  const handleTouchMove = (e: React.TouchEvent) => setTouchEndX(e.targetTouches[0].clientX);
  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    const distance = touchStartX - touchEndX;
    if (distance > 50) handleNext();
    if (distance < -50) handlePrev();
    setTouchStartX(0);
    setTouchEndX(0);
  };

  if (loading) return null;
  if (!eventData) return <div className="min-h-screen flex items-center justify-center font-mono">Event not found</div>;

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col relative pb-20">
      {/* Hero Cover Photo Section */}
      <div className="w-full h-[50vh] min-h-[400px] relative group overflow-hidden">
        {eventData.cover_photo_url ? (
          <img src={eventData.cover_photo_url} alt="Cover" className="w-full h-full object-cover opacity-80" />
        ) : (
          <div className="w-full h-full bg-[#111] flex flex-col items-center justify-center">
            <ImageIcon className="w-12 h-12 opacity-20 mb-4" />
            <p className="font-serif italic opacity-40">No Cover Photo</p>
          </div>
        )}

        {/* Dark gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

        {/* Change Cover Button (Appears on hover) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleCoverUpload} />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingCover}
            className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-3 rounded-full font-medium uppercase tracking-widest text-xs hover:bg-white/20 transition-colors"
          >
            {uploadingCover ? "Uploading..." : <><UploadCloud className="w-4 h-4" /> Change Cover</>}
          </button>
        </div>
      </div>

      <div className="w-full max-w-[1600px] mx-auto -mt-32 relative z-10 px-2 md:px-4">
        <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest opacity-60 hover:opacity-100 mb-8 transition-opacity">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12">
          <div>
            <h1 className="font-serif text-6xl md:text-7xl mb-4 tracking-tighter">{eventData.title}</h1>
            <div className="flex flex-wrap items-center gap-4 font-mono text-[10px] md:text-xs uppercase tracking-widest opacity-80">
              <span className="bg-foreground/10 px-4 py-2 rounded-full">
                {isRevealed ? "Status: Revealed" : `Reveals: ${new Date(eventData.reveal_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}`}
              </span>
              <span className="bg-foreground/10 px-4 py-2 rounded-full flex items-center gap-2">
                <Users className="w-3 h-3" /> {uniqueGuests} Joined
              </span>
              <a href={shortUrl} target="_blank" className="hover:underline text-blue-400">
                {shortUrl}
              </a>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mt-4 lg:mt-0">
            {!isRevealed && (
              <button onClick={forceReveal} className="flex items-center gap-2 bg-foreground text-background px-6 py-4 rounded-full font-medium uppercase tracking-widest text-xs hover:opacity-90 active:scale-95 transition-all">
                <Unlock className="w-4 h-4" /> Force Reveal
              </button>
            )}
            <button onClick={deleteEvent} className="flex items-center gap-2 border border-red-500/30 text-red-500 px-6 py-4 rounded-full font-medium uppercase tracking-widest text-xs hover:bg-red-500/10 active:scale-95 transition-all">
              <AlertTriangle className="w-4 h-4" /> Delete Event
            </button>
          </div>
        </div>

        <div className="glass p-6 md:p-12 rounded-[3rem] shadow-2xl border border-foreground/5 mb-8">
          <h2 className="font-serif text-3xl mb-8 flex items-center gap-4">
            Event Aesthetic <span className="opacity-40 text-lg">{updatingFilter ? "(Saving...)" : ""}</span>
          </h2>
          <FilterSelector selectedFilter={eventData.aesthetic_filter} onSelect={handleFilterChange} />
        </div>

        {/* Captured Media Title & Metrics Summary */}
        <div className="flex justify-between items-end border-b border-foreground/10 pb-6 mb-8 mt-12">
          <h2 className="font-serif text-3xl">Captrd Media</h2>

          {photos.length > 0 && (
            <div className="flex items-center gap-6">
              <button
                onClick={() => setSelectedGuest(null)}
                className={`flex flex-col items-start cursor-pointer text-left transition-opacity ${!selectedGuest ? 'opacity-100' : 'opacity-50 hover:opacity-80'}`}
              >
                <span className="font-serif text-2xl md:text-3xl font-light">{photos.length}</span>
                <span className="font-mono text-[9px] uppercase tracking-widest opacity-60 mt-1">Total Pictures</span>
              </button>
              <div className="h-6 w-px bg-foreground/20" />
              <button
                onClick={() => setIsRosterOpen(true)}
                className="flex flex-col items-start cursor-pointer text-left opacity-50 hover:opacity-80 transition-opacity"
              >
                <span className="font-serif text-2xl md:text-3xl font-light">{uniqueGuestsList.length}</span>
                <span className="font-mono text-[9px] uppercase tracking-widest opacity-60 mt-1">People Joined</span>
              </button>
            </div>
          )}
        </div>

        {/* Active Filter Banner */}
        {selectedGuest && (
          <div className="mb-8 flex items-center justify-between bg-foreground/5 border border-foreground/10 px-6 py-4 rounded-none">
            <span className="font-mono text-xs uppercase tracking-widest text-foreground/80">
              Viewing <span className="font-serif italic text-sm text-foreground normal-case">{selectedGuest}</span>'s roll — {guestStats[selectedGuest]} pictures
            </span>
            <button
              onClick={() => setSelectedGuest(null)}
              className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-foreground hover:text-red-500 transition-colors"
            >
              Show Everyone <CloseIcon className="w-4 h-4" />
            </button>
          </div>
        )}

        {photos.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-foreground/20 rounded-[2rem] mt-12">
            <p className="opacity-50 italic font-serif text-xl">No media captrd yet.</p>
          </div>
        ) : (
          <div className="columns-2 md:columns-3 xl:columns-4 gap-2 md:gap-4 space-y-2 md:space-y-4 mt-6">
            {visiblePhotos.map(photo => (
              <div
                key={photo.id}
                onClick={() => setSelectedMedia(photo)}
                className="relative group break-inside-avoid overflow-hidden rounded-none bg-[#111] shadow-xl w-full cursor-zoom-in"
              >
                {photo.media_type === 'video' ? (
                  <video src={photo.storage_path} className={`w-full h-auto object-cover ${getFilterClass(eventData.aesthetic_filter)}`} muted loop playsInline autoPlay />
                ) : (
                  <img src={photo.storage_path} className={`w-full h-auto object-cover ${getFilterClass(eventData.aesthetic_filter)}`} alt="Captured" />
                )}

                {/* Overlay for admin controls: always visible on mobile, hover on desktop */}
                <div className="absolute inset-0 bg-black/60 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4 md:p-6">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePhoto(photo.id, photo.storage_path);
                    }}
                    className="self-end p-3 md:p-4 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full hover:bg-red-500 hover:border-red-500 transition-colors shadow-lg active:scale-95"
                    title="Delete Media"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>

                  <div>
                    <p className="text-white font-serif italic text-xl md:text-2xl">{photo.guest_name}</p>
                    <p className="text-white/80 font-mono text-[9px] uppercase tracking-[0.2em] mt-1">
                      {new Date(photo.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal for Admin */}
      <AnimatePresence>
        {selectedMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black flex flex-col overflow-hidden"
            onClick={() => setSelectedMedia(null)}
          >
            {/* Top Bar for Close */}
            <div className="absolute top-0 inset-x-0 p-6 flex justify-end z-30 pointer-events-none">
              <button
                onClick={() => setSelectedMedia(null)}
                className="p-3 bg-black/40 backdrop-blur-md hover:bg-white/20 transition-colors rounded-full text-white border border-white/20 pointer-events-auto"
              >
                <CloseIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Image Area */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="flex-1 relative flex items-center justify-center bg-[#111]"
              onClick={(e) => e.stopPropagation()}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {selectedMedia.media_type === 'video' ? (
                <video src={selectedMedia.storage_path} className={`w-full h-full object-cover ${getFilterClass(eventData.aesthetic_filter)}`} controls autoPlay playsInline />
              ) : (
                <img src={selectedMedia.storage_path} className={`w-full h-full object-cover ${getFilterClass(eventData.aesthetic_filter)}`} alt="Enlarged moment" />
              )}

              {/* Desktop Nav Arrows */}
              <button onClick={(e) => { e.stopPropagation(); handlePrev(); }} className="hidden md:flex absolute left-4 p-3 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-colors border border-white/20">
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); handleNext(); }} className="hidden md:flex absolute right-4 p-3 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-colors border border-white/20">
                <ChevronRight className="w-8 h-8" />
              </button>
            </motion.div>

            {/* Controls Area */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="h-44 bg-black flex flex-col items-center justify-center px-6 z-20 pb-4 relative w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-4">
                <p className="font-serif italic text-2xl md:text-3xl text-white mb-1">{selectedMedia.guest_name}</p>
                <p className="font-mono text-[10px] md:text-xs uppercase tracking-[0.3em] text-white/50">
                  {new Date(selectedMedia.created_at).toLocaleTimeString()}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-6">
                {/* Delete Button (Red) */}
                <button
                  onClick={() => {
                    deletePhoto(selectedMedia.id, selectedMedia.storage_path);
                    setSelectedMedia(null);
                  }}
                  className="flex items-center justify-center w-12 h-12 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-lg active:scale-95"
                  title="Delete Media"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDownload(selectedMedia.storage_path, selectedMedia.media_type)}
                  className="flex items-center justify-center w-12 h-12 bg-white text-black rounded-full hover:bg-gray-200 transition-colors shadow-lg active:scale-95"
                  title="Save to Camera Roll"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleShare(selectedMedia.storage_path, selectedMedia.media_type)}
                  className="flex items-center justify-center w-12 h-12 bg-white text-black rounded-full hover:bg-gray-200 transition-colors shadow-lg active:scale-95"
                  title="Share to Instagram"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
                </button>
                <button
                  onClick={() => handleShare(selectedMedia.storage_path, selectedMedia.media_type)}
                  className="flex items-center justify-center w-12 h-12 bg-white text-black rounded-full hover:bg-gray-200 transition-colors shadow-lg active:scale-95"
                  title="Share to Snapchat"
                >
                  <svg fill="currentColor" viewBox="0 0 32 32" className="w-5 h-5"><path d="M27.9774,9.6279a7.33,7.33,0,0,0-.1186-1.2888,5.2458,5.2458,0,0,0-.4872-1.4948,5.1869,5.1869,0,0,0-.9988-1.3324,4.9557,4.9557,0,0,0-2.1805-1.2433,8.8444,8.8444,0,0,0-2.3059-.2458l-.0044-.0119H10.1143l-.0007.0119a12.578,12.578,0,0,0-1.3221.0591A6.2955,6.2955,0,0,0,7.3792,4.4,5.1155,5.1155,0,0,0,4.2538,7.8152a8.8,8.8,0,0,0-.2459,2.2855L4,21.9065a14.9206,14.9206,0,0,0,.1088,1.5992A5.53,5.53,0,0,0,4.6,25.1205a5.17,5.17,0,0,0,1.443,1.744,4.6907,4.6907,0,0,0,1.4442.7822,7.83,7.83,0,0,0,2.3741.3484c.5034.0032,1.0069.0158,1.5106.0137,3.659-.0154,7.3178.0264,10.9767-.0226a8.6316,8.6316,0,0,0,1.44-.1528A4.8765,4.8765,0,0,0,26.2,26.6613a4.9915,4.9915,0,0,0,1.5931-2.6546,9.6646,9.6646,0,0,0,.2074-2.1v-.1407C28,21.7112,27.9793,9.7855,27.9774,9.6279ZM24.7635,20.7326c-.1536.36-.93.6577-2.2433.8606-.1232.019-.1751.2183-.2463.5445-.0293.1348-.0592.2669-.1.4057a.2451.2451,0,0,1-.26.1943h-.0205a2.1011,2.1011,0,0,1-.3738-.0472,4.921,4.921,0,0,0-.9852-.1044,4.37,4.37,0,0,0-.7106.06,3.4048,3.4048,0,0,0-1.3483.6888,3.912,3.912,0,0,1-2.3668.9328c-.05,0-.0973-.0018-.1335-.0035-.0287.0024-.0584.0035-.0881.0035a3.9062,3.9062,0,0,1-2.3651-.9322,3.4118,3.4118,0,0,0-1.35-.69,4.3612,4.3612,0,0,0-.71-.06,4.858,4.858,0,0,0-.9852.1115,2.1872,2.1872,0,0,1-.3737.0536.2574.2574,0,0,1-.2807-.2012c-.0414-.1407-.0711-.277-.1-.4082-.0716-.328-.1237-.5282-.2465-.5472-1.3133-.2026-2.0893-.5011-2.2439-.8626a.3349.3349,0,0,1-.0272-.114.2109.2109,0,0,1,.1764-.22,4.5854,4.5854,0,0,0,2.7564-1.6391,6.1681,6.1681,0,0,0,.94-1.4616l.0048-.01a.943.943,0,0,0,.09-.79c-.1693-.3991-.73-.5769-1.1007-.6946-.0921-.0291-.1794-.0567-.2488-.0844-.3288-.13-.8693-.4041-.7973-.7828a.7333.7333,0,0,1,.7127-.4683.5052.5052,0,0,1,.2158.043,2.1572,2.1572,0,0,0,.8916.2355.7465.7465,0,0,0,.5134-.1569q-.0145-.2629-.0318-.5256a8.8742,8.8742,0,0,1,.2122-3.5447A4.6074,4.6074,0,0,1,15.8173,7.76q.177-.0015.3539-.0033a4.6152,4.6152,0,0,1,4.2853,2.7606,8.884,8.884,0,0,1,.2118,3.5478l-.0036.0574c-.01.1629-.02.317-.0278.4665a.7215.7215,0,0,0,.4656.1558,2.2321,2.2321,0,0,0,.84-.234.6628.6628,0,0,1,.2751-.0545.832.832,0,0,1,.3133.06l.005.0019a.5825.5825,0,0,1,.4409.4781c.0034.1835-.133.4578-.8039.7226-.0687.0272-.1564.0551-.2489.0844-.3712.1178-.9312.2956-1.1005.6944a.9422.9422,0,0,0,.09.7893l.0048.01a5.4311,5.4311,0,0,0,3.6967,3.1005.211.211,0,0,1,.1764.22A.3408.3408,0,0,1,24.7635,20.7326Z" /></svg>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Roster Modal for Admin */}
      <AnimatePresence>
        {isRosterOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[250] bg-black/95 backdrop-blur-md flex flex-col p-6 overflow-y-auto"
            onClick={() => setIsRosterOpen(false)}
          >
            <div
              className="max-w-[1200px] w-full mx-auto flex-grow flex flex-col justify-between py-12"
              onClick={(e) => e.stopPropagation()}
            >
              <div>
                <div className="flex justify-between items-start mb-12">
                  <div>
                    <h2 className="font-serif text-4xl md:text-5xl text-white tracking-tight">Film Directory</h2>
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50 mt-2">Select a contributor to browse their roll</p>
                  </div>
                  <button
                    onClick={() => setIsRosterOpen(false)}
                    className="p-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors border border-white/20"
                  >
                    <CloseIcon className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
                  {uniqueGuestsList.map(guest => (
                    <button
                      key={guest}
                      onClick={() => {
                        setSelectedGuest(guest);
                        setIsRosterOpen(false);
                      }}
                      className="text-left p-6 border border-white/10 hover:border-white/30 hover:bg-white/5 transition-all rounded-none flex justify-between items-center group cursor-pointer text-white"
                    >
                      <span className="font-serif italic text-lg text-white group-hover:translate-x-1 transition-transform duration-300">{guest}</span>
                      <span className="font-mono text-[9px] uppercase tracking-widest text-white/40 group-hover:text-white/80 transition-colors">
                        {guestStats[guest]} exp
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-white/10 pt-12 mt-12 text-center">
                <button
                  onClick={() => {
                    setSelectedGuest(null);
                    setIsRosterOpen(false);
                  }}
                  className="font-mono text-xs uppercase tracking-widest text-white/60 hover:text-white underline transition-colors"
                >
                  Clear filter and show all pictures
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
