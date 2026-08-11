"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import CameraViewfinder from "@/components/CameraViewfinder";
import { ArrowLeft, X as CloseIcon, Download, ChevronLeft, ChevronRight, MoreHorizontal, AlertTriangle, Share } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getFilterClass, getPixelFilter } from "@/lib/filters";
import { enhanceImage } from "@/lib/enhanceImage";

export default function EventPortal() {
  const params = useParams();
  const eventId = params?.id as string;
  const supabase = createClient();

  const [eventData, setEventData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [guestName, setGuestName] = useState("");
  const [hasEnteredName, setHasEnteredName] = useState(false);

  // Gallery state
  const [showGallery, setShowGallery] = useState(false);
  const [latestPhoto, setLatestPhoto] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      let query = supabase.from("events").select("*");
      if (eventId && eventId.length === 36) {
        query = query.eq("id", eventId);
      } else if (eventId) {
        query = query.eq("short_code", eventId.toLowerCase());
      }

      const { data } = await query.maybeSingle();
      if (data) {
        setEventData(data);

        // Fetch latest photo for thumbnail using the actual UUID
        const { data: latestPhotoData } = await supabase.from("photos").select("storage_path").eq("event_id", data.id).order("created_at", { ascending: false }).limit(1);
        if (latestPhotoData && latestPhotoData.length > 0) {
          setLatestPhoto(latestPhotoData[0].storage_path);
        }
      }

      setLoading(false);

      const storedName = sessionStorage.getItem(`captr_guest_${eventId}`);
      if (storedName) {
        setGuestName(storedName);
        setHasEnteredName(true);
      }
    };
    if (eventId) fetchEvent();
  }, [eventId, supabase]);

  if (loading) return <div className="min-h-screen bg-background text-foreground flex items-center justify-center font-mono text-xs uppercase tracking-widest">Loading Roll...</div>;
  if (!eventData) return <div className="min-h-screen bg-background flex items-center justify-center font-serif text-2xl text-red-500">Event not found</div>;

  const isRevealed = new Date() >= new Date(eventData.reveal_at);
  const isEnded = eventData.end_at ? new Date() >= new Date(eventData.end_at) : false;

  if (showGallery && isRevealed) {
    return (
      <main className="min-h-screen bg-[#09090b] text-[#fcfcfc] selection:bg-white selection:text-black pb-32">
        {/* Cover Photo Header */}
        <div className="w-full h-[40vh] relative flex items-end justify-center bg-[#111]">
          {eventData.cover_photo_url ? (
            <img src={eventData.cover_photo_url} alt="Cover" className="absolute inset-0 w-full h-full object-cover opacity-80" />
          ) : (
            <div className="absolute inset-0 w-full h-full bg-[#111]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] to-transparent" />
        </div>

        <div className="w-full max-w-[1600px] mx-auto -mt-32 relative z-10 px-2 md:px-4">
          <FilmRollGallery eventData={eventData} onViewCamera={() => setShowGallery(false)} />
        </div>
      </main>
    );
  }

  if (isEnded && !showGallery) {
    return (
      <main className="fixed inset-0 bg-black text-white flex flex-col justify-end">
        {/* Background Image (Cover Photo) */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center opacity-80"
          style={{ backgroundImage: `url(${eventData.cover_photo_url || "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=800&auto=format&fit=crop"})` }}
        />

        {/* Dark Gradients for Text Readability */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/40 via-transparent to-black/95 pointer-events-none" />

        {/* Content Area */}
        <div className="relative z-10 w-full p-6 md:p-12 flex flex-col items-center text-center pb-12 animate-in slide-in-from-bottom-8 duration-1000 fade-in">
          <h1 className="font-serif text-5xl md:text-7xl mb-4 drop-shadow-lg tracking-tight leading-tight max-w-[90%]">
            {eventData.title}
          </h1>

          <p className="font-serif text-xl md:text-2xl italic opacity-90 max-w-[85%] leading-relaxed drop-shadow-md mb-8">
            Event has ended. Thank you for contributing to the experience.
          </p>

          <button
            onClick={() => setShowGallery(true)}
            className="w-full max-w-sm bg-white text-black py-5 rounded-[2rem] font-mono font-bold uppercase tracking-widest text-xs shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Click here to see the event photos
          </button>
        </div>
      </main>
    );
  }

  // Camera Mode (or Guestbook if no name)
  if (!hasEnteredName) {
    const handleNameSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (guestName.trim()) {
        sessionStorage.setItem(`captrd_guest_${eventId}`, guestName);
        setHasEnteredName(true);

        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await supabase.from("event_participants").upsert({
            user_id: session.user.id,
            event_id: eventData.id
          }, { onConflict: "user_id, event_id" });
        }
      }
    };

    return (
      <main className="fixed inset-0 bg-black text-white flex flex-col justify-end">
        {/* Background Image (Cover Photo) */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center opacity-80"
          style={{ backgroundImage: `url(${eventData.cover_photo_url || "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=800&auto=format&fit=crop"})` }}
        />

        {/* Dark Gradients for Text Readability */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/40 via-transparent to-black/95 pointer-events-none" />

        {/* Content Area */}
        <div className="relative z-10 w-full p-6 md:p-12 flex flex-col items-center text-center pb-12 animate-in slide-in-from-bottom-8 duration-1000 fade-in">

          {/* Event Title */}
          <h1 className="font-serif text-5xl md:text-7xl mb-4 drop-shadow-lg tracking-tight leading-tight max-w-[90%]">
            {eventData.title}
          </h1>

          {/* Event Date */}
          <p className="font-mono text-xs md:text-sm uppercase tracking-[0.3em] opacity-80 mb-8 drop-shadow-md">
            {new Date(eventData.reveal_at).toLocaleDateString()}
          </p>

          {/* Custom Invite Details */}
          {eventData.invite_details && (
            <p className="font-serif text-xl md:text-2xl italic opacity-90 max-w-[85%] leading-relaxed drop-shadow-md mb-12">
              "{eventData.invite_details}"
            </p>
          )}

          {/* Form */}
          <form onSubmit={handleNameSubmit} className="w-full max-w-sm flex flex-col gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Enter your name to join"
                required
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full bg-black/40 backdrop-blur-xl border border-white/20 rounded-[2rem] py-5 px-6 text-center focus:outline-none focus:border-white text-lg font-serif transition-colors shadow-2xl placeholder:text-white/40"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-white text-black py-5 rounded-[2rem] font-mono font-bold uppercase tracking-widest text-xs shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Join Film Roll
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <CameraViewfinder
      eventId={eventData.id}
      guestName={guestName}
      filter={eventData.aesthetic_filter}
      isRevealed={isRevealed}
      latestPhotoUrl={latestPhoto || undefined}
      onViewGallery={() => setShowGallery(true)}
      onPhotoTaken={(url) => setLatestPhoto(url)}
      maxPhotos={eventData.max_photos_per_user || 15}
    />
  );
}

function FilmRollGallery({ eventData, onViewCamera }: { eventData: any; onViewCamera: () => void }) {
  const [photos, setPhotos] = useState<any[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<any | null>(null);
  const [selectedGuest, setSelectedGuest] = useState<string | null>(null);
  const [isRosterOpen, setIsRosterOpen] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    const fetchPhotos = async () => {
      const { data } = await supabase.from("photos").select("*").eq("event_id", eventData.id).order("created_at", { ascending: false });
      if (data) setPhotos(data);
    };
    fetchPhotos();
  }, [eventData.id, supabase]);

  const guestStats = photos.reduce((acc: { [key: string]: number }, photo) => {
    acc[photo.guest_name] = (acc[photo.guest_name] || 0) + 1;
    return acc;
  }, {});

  const uniqueGuests = Object.keys(guestStats).sort((a, b) => a.localeCompare(b));
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

  const handleShare = async (mediaUrl: string, type: string) => {
    try {
      let blob: Blob;
      
      if (type !== 'video' && eventData.aesthetic_filter) {
        try {
          // Pass mediaUrl directly to prevent Safari blob: URL canvas tainting bug
          blob = await enhanceImage(mediaUrl, { pixelFilter: getPixelFilter(eventData.aesthetic_filter) });
        } catch (e) { 
          console.error("Filter bake failed", e);
          const response = await fetch(mediaUrl);
          blob = await response.blob();
        }
      } else {
        const response = await fetch(mediaUrl);
        blob = await response.blob();
      }

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
      let blob: Blob;
      
      if (type !== 'video' && eventData.aesthetic_filter) {
        try {
          // Pass mediaUrl directly to prevent Safari blob: URL canvas tainting bug
          blob = await enhanceImage(mediaUrl, { pixelFilter: getPixelFilter(eventData.aesthetic_filter) });
        } catch (e) { 
          console.error("Filter bake failed", e);
          const response = await fetch(mediaUrl);
          blob = await response.blob();
        }
      } else {
        const response = await fetch(mediaUrl);
        blob = await response.blob();
      }
      
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

  const isEnded = eventData.end_at ? new Date() >= new Date(eventData.end_at) : false;

  return (
    <>
      <button
        onClick={onViewCamera}
        className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest opacity-60 hover:opacity-100 mb-8 transition-opacity text-white"
      >
        <ArrowLeft className="w-4 h-4" /> {isEnded ? "Back" : "Camera"}
      </button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 border-b border-white/10 pb-8">
        <div>
          <h1 className="font-serif text-5xl md:text-7xl mb-4 tracking-tighter text-[#fcfcfc]">{eventData.title}</h1>
          <p className="font-mono text-[10px] md:text-xs uppercase tracking-[0.3em] opacity-80 text-[#fcfcfc]">The Film Roll is Developed</p>
        </div>

        {/* Metrics Buttons */}
        {photos.length > 0 && (
          <div className="flex items-center gap-6 mt-4 md:mt-0 flex-shrink-0">
            <button
              onClick={() => setSelectedGuest(null)}
              className={`flex flex-col items-start cursor-pointer text-left transition-opacity ${!selectedGuest ? 'opacity-100' : 'opacity-55 hover:opacity-80'}`}
            >
              <span className="font-serif text-3xl md:text-4xl font-light text-white">{photos.length}</span>
              <span className="font-mono text-[9px] uppercase tracking-widest text-white/50 mt-1">Total Pictures</span>
            </button>
            <div className="h-8 w-px bg-white/20" />
            <button
              onClick={() => setIsRosterOpen(true)}
              className="flex flex-col items-start cursor-pointer text-left opacity-55 hover:opacity-80 transition-opacity"
            >
              <span className="font-serif text-3xl md:text-4xl font-light text-white">{uniqueGuests.length}</span>
              <span className="font-mono text-[9px] uppercase tracking-widest text-white/50 mt-1">People Joined</span>
            </button>
          </div>
        )}
      </div>

      {photos.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-white/20 rounded-[3rem]">
          <p className="opacity-50 italic font-serif text-2xl">The roll is empty.</p>
          <p className="opacity-30 font-mono text-xs uppercase tracking-widest mt-4">No media was captrd at this event.</p>
        </div>
      ) : (
        <>
          {/* Active Filter Banner */}
          {selectedGuest && (
            <div className="mb-8 flex items-center justify-between bg-white/5 border border-white/10 px-6 py-4 rounded-none">
              <span className="font-mono text-xs uppercase tracking-widest text-white/80">
                Viewing <span className="font-serif italic text-sm text-white normal-case">{selectedGuest}</span>'s roll — {guestStats[selectedGuest]} pictures
              </span>
              <button
                onClick={() => setSelectedGuest(null)}
                className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-white hover:text-red-400 transition-colors"
              >
                Show Everyone <CloseIcon className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="columns-2 md:columns-3 xl:columns-4 gap-2 md:gap-4 space-y-2 md:space-y-4">
            {visiblePhotos.map(photo => (
              <button
                key={photo.id}
                onClick={() => setSelectedMedia(photo)}
                className="relative group break-inside-avoid overflow-hidden rounded-none bg-[#111] shadow-2xl w-full text-left cursor-zoom-in"
              >
                {photo.media_type === 'video' ? (
                  <video src={photo.storage_path} className={`w-full h-auto object-cover ${getFilterClass(eventData.aesthetic_filter)} lg:group-hover:scale-[1.02] transition-transform duration-700 ease-out`} muted loop autoPlay playsInline />
                ) : (
                  <img src={photo.storage_path} alt="Captrd moment" className={`w-full h-auto object-cover ${getFilterClass(eventData.aesthetic_filter)} lg:group-hover:scale-[1.02] transition-transform duration-700 ease-out`} />
                )}

                {/* Clean Overlay without background box, always visible on mobile, hover on desktop */}
                <div className="absolute inset-x-0 bottom-0 pt-20 pb-4 md:pb-6 px-4 md:px-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-500 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-1 md:gap-2 translate-y-0 lg:translate-y-2 lg:group-hover:translate-y-0 pointer-events-none">
                  <p className="font-serif italic text-sm md:text-xxl text-white drop-shadow-md opacity-60">{photo.guest_name}</p>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Lightbox Modal */}
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
              <button onClick={(e) => { e.stopPropagation(); handlePrev(); }} className="hidden md:flex absolute left-4 p-3 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-colors border border-white/20 z-10">
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); handleNext(); }} className="hidden md:flex absolute right-4 p-3 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-colors border border-white/20 z-10">
                <ChevronRight className="w-8 h-8" />
              </button>
            </motion.div>

            {/* Controls Area */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="h-[170px] bg-black flex flex-col items-center justify-center px-6 z-20 pb-6 relative w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col items-center mb-4">
                <button
                  onClick={() => handleShare(selectedMedia.storage_path, selectedMedia.media_type)}
                  className="flex items-center gap-2 mb-1 cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <p className="font-serif italic text-2xl md:text-3xl text-white">{selectedMedia.guest_name}</p>
                  <MoreHorizontal className="w-5 h-5 text-white/50" />
                </button>
                <p className="font-mono text-[10px] md:text-xs uppercase tracking-[0.3em] text-white/40">
                  {new Date(selectedMedia.created_at).toLocaleTimeString()}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between w-full mt-2 max-w-xl mx-auto">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleShare(selectedMedia.storage_path, selectedMedia.media_type)}
                    className="flex items-center justify-center h-11 px-4 bg-white text-black rounded-full hover:bg-gray-200 transition-colors shadow-lg active:scale-95 gap-2"
                    title="Share to Story"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
                    <span className="font-semibold text-sm">Story</span>
                  </button>

                  <button
                    onClick={() => handleShare(selectedMedia.storage_path, selectedMedia.media_type)}
                    className="flex items-center justify-center w-11 h-11 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors shadow-lg active:scale-95"
                    title="Share to Snapchat"
                  >
                    <svg fill="currentColor" viewBox="0 0 32 32" className="w-5 h-5"><path d="M27.9774,9.6279a7.33,7.33,0,0,0-.1186-1.2888,5.2458,5.2458,0,0,0-.4872-1.4948,5.1869,5.1869,0,0,0-.9988-1.3324,4.9557,4.9557,0,0,0-2.1805-1.2433,8.8444,8.8444,0,0,0-2.3059-.2458l-.0044-.0119H10.1143l-.0007.0119a12.578,12.578,0,0,0-1.3221.0591A6.2955,6.2955,0,0,0,7.3792,4.4,5.1155,5.1155,0,0,0,4.2538,7.8152a8.8,8.8,0,0,0-.2459,2.2855L4,21.9065a14.9206,14.9206,0,0,0,.1088,1.5992A5.53,5.53,0,0,0,4.6,25.1205a5.17,5.17,0,0,0,1.443,1.744,4.6907,4.6907,0,0,0,1.4442.7822,7.83,7.83,0,0,0,2.3741.3484c.5034.0032,1.0069.0158,1.5106.0137,3.659-.0154,7.3178.0264,10.9767-.0226a8.6316,8.6316,0,0,0,1.44-.1528A4.8765,4.8765,0,0,0,26.2,26.6613a4.9915,4.9915,0,0,0,1.5931-2.6546,9.6646,9.6646,0,0,0,.2074-2.1v-.1407C28,21.7112,27.9793,9.7855,27.9774,9.6279ZM24.7635,20.7326c-.1536.36-.93.6577-2.2433.8606-.1232.019-.1751.2183-.2463.5445-.0293.1348-.0592.2669-.1.4057a.2451.2451,0,0,1-.26.1943h-.0205a2.1011,2.1011,0,0,1-.3738-.0472,4.921,4.921,0,0,0-.9852-.1044,4.37,4.37,0,0,0-.7106.06,3.4048,3.4048,0,0,0-1.3483.6888,3.912,3.912,0,0,1-2.3668.9328c-.05,0-.0973-.0018-.1335-.0035-.0287.0024-.0584.0035-.0881.0035a3.9062,3.9062,0,0,1-2.3651-.9322,3.4118,3.4118,0,0,0-1.35-.69,4.3612,4.3612,0,0,0-.71-.06,4.858,4.858,0,0,0-.9852.1115,2.1872,2.1872,0,0,1-.3737.0536.2574.2574,0,0,1-.2807-.2012c-.0414-.1407-.0711-.277-.1-.4082-.0716-.328-.1237-.5282-.2465-.5472-1.3133-.2026-2.0893-.5011-2.2439-.8626a.3349.3349,0,0,1-.0272-.114.2109.2109,0,0,1,.1764-.22,4.5854,4.5854,0,0,0,2.7564-1.6391,6.1681,6.1681,0,0,0,.94-1.4616l.0048-.01a.943.943,0,0,0,.09-.79c-.1693-.3991-.73-.5769-1.1007-.6946-.0921-.0291-.1794-.0567-.2488-.0844-.3288-.13-.8693-.4041-.7973-.7828a.7333.7333,0,0,1,.7127-.4683.5052.5052,0,0,1,.2158.043,2.1572,2.1572,0,0,0,.8916.2355.7465.7465,0,0,0,.5134-.1569q-.0145-.2629-.0318-.5256a8.8742,8.8742,0,0,1,.2122-3.5447A4.6074,4.6074,0,0,1,15.8173,7.76q.177-.0015.3539-.0033a4.6152,4.6152,0,0,1,4.2853,2.7606,8.884,8.884,0,0,1,.2118,3.5478l-.0036.0574c-.01.1629-.02.317-.0278.4665a.7215.7215,0,0,0,.4656.1558,2.2321,2.2321,0,0,0,.84-.234.6628.6628,0,0,1,.2751-.0545.832.832,0,0,1,.3133.06l.005.0019a.5825.5825,0,0,1,.4409.4781c.0034.1835-.133.4578-.8039.7226-.0687.0272-.1564.0551-.2489.0844-.3712.1178-.9312.2956-1.1005.6944a.9422.9422,0,0,0,.09.7893l.0048.01a5.4311,5.4311,0,0,0,3.6967,3.1005.211.211,0,0,1,.1764.22A.3408.3408,0,0,1,24.7635,20.7326Z" /></svg>
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleShare(selectedMedia.storage_path, selectedMedia.media_type)}
                    className="flex items-center justify-center w-11 h-11 bg-white/10 text-[#eab308] rounded-full hover:bg-white/20 transition-colors shadow-lg active:scale-95"
                    title="Report"
                  >
                    <AlertTriangle className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleShare(selectedMedia.storage_path, selectedMedia.media_type)}
                    className="flex items-center justify-center w-11 h-11 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors shadow-lg active:scale-95"
                    title="Share"
                  >
                    <Share className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDownload(selectedMedia.storage_path, selectedMedia.media_type)}
                    className="flex items-center justify-center w-11 h-11 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors shadow-lg active:scale-95"
                    title="Save to Camera Roll"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Roster Modal */}
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
                  {uniqueGuests.map(guest => (
                    <button
                      key={guest}
                      onClick={() => {
                        setSelectedGuest(guest);
                        setIsRosterOpen(false);
                      }}
                      className="text-left p-6 border border-white/10 hover:border-white/30 hover:bg-white/5 transition-all rounded-none flex justify-between items-center group cursor-pointer"
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
    </>
  );
}
