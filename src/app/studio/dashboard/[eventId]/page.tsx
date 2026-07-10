"use client";

import { useEffect, useState, use } from "react";
import { createClient } from "@/lib/supabase/client";
import Navigation from "@/components/Navigation";
import { ArrowLeft, Copy, ExternalLink, Trash2, Image as ImageIcon, Star } from "lucide-react";
import Link from "next/link";
import ImageUploader from "@/components/studio/ImageUploader";

type StudioEvent = {
  id: string;
  name: string;
  slug: string;
  cover_image_url: string | null;
  studio_id: string;
};

type Studio = {
  slug: string;
  business_name: string;
};

type Photo = {
  id: string;
  public_url: string;
  created_at: string;
};

export default function EventDashboard({ params }: { params: Promise<{ eventId: string }> }) {
  const unwrappedParams = use(params);
  const [event, setEvent] = useState<StudioEvent | null>(null);
  const [studio, setStudio] = useState<Studio | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const supabase = createClient();

  const fetchEventData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = "/login";
        return;
      }

      // Fetch Event
      const { data: eventData, error: eventError } = await supabase
        .from("studio_events")
        .select("*")
        .eq("id", unwrappedParams.eventId)
        .single();

      if (eventError || !eventData) {
        window.location.href = "/studio/dashboard";
        return;
      }

      setEvent(eventData);

      // Fetch Studio
      const { data: studioData } = await supabase
        .from("studios")
        .select("slug, business_name")
        .eq("id", eventData.studio_id)
        .single();
        
      if (studioData) setStudio(studioData);

      // Fetch Photos
      const { data: photosData } = await supabase
        .from("studio_photos")
        .select("*")
        .eq("event_id", unwrappedParams.eventId)
        .order("created_at", { ascending: false });

      if (photosData) setPhotos(photosData);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventData();
  }, [unwrappedParams.eventId]);

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm("Are you sure you want to delete this photo?")) return;
    
    // Optimistic UI update
    setPhotos(photos.filter(p => p.id !== photoId));
    
    await supabase
      .from("studio_events")
      .delete()
      .eq("id", photoId); // Just a note, this had a bug, it should be studio_photos
  }; // Wait, I will fix the bug above in this chunk as well!

  // Fixed the delete photo bug and added set cover
  const handleDeletePhotoFix = async (photoId: string) => {
    if (!confirm("Are you sure you want to delete this photo?")) return;
    setPhotos(photos.filter(p => p.id !== photoId));
    await supabase.from("studio_photos").delete().eq("id", photoId);
  };

  const handleSetCover = async (photoUrl: string) => {
    if (!event) return;
    
    // Optimistic UI update
    setEvent({ ...event, cover_image_url: photoUrl });
    
    const { error } = await supabase
      .from("studio_events")
      .update({ cover_image_url: photoUrl })
      .eq("id", event.id);
      
    if (error) {
      console.error("Error updating cover:", error);
      alert("Failed to set cover image.");
    }
  };
  
  const getShareUrl = () => {
    if (typeof window !== "undefined" && studio && event) {
      return `${window.location.origin}/g/${studio.slug}/${event.slug}`;
    }
    return "";
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!event || !studio) return <div className="min-h-screen flex items-center justify-center">Event not found</div>;

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col relative pt-24 px-6 md:px-16 pb-20">
      <Navigation />
      
      <div className="w-full max-w-6xl mx-auto mb-10">
        <Link href="/studio/dashboard" className="inline-flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity font-mono text-xs uppercase tracking-widest mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 bg-foreground/5 p-8 md:p-12 rounded-[3rem] border border-foreground/10 relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-foreground/5 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="relative z-10">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] opacity-50 mb-3">Event Gallery</p>
            <h1 className="font-serif text-5xl md:text-7xl tracking-tight mb-2">
              {event.name}
            </h1>
            <p className="opacity-60">{photos.length} photos uploaded</p>
          </div>
          
          <div className="flex flex-col gap-3 w-full lg:w-auto relative z-10">
            <div className="bg-background/50 border border-foreground/20 rounded-2xl flex items-center p-2 backdrop-blur-md">
              <input 
                type="text" 
                readOnly 
                value={getShareUrl()} 
                className="bg-transparent text-sm opacity-70 px-4 py-2 outline-none w-full lg:w-64"
              />
              <button 
                onClick={handleCopyLink}
                className="bg-foreground text-background p-3 rounded-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
              >
                {copied ? <span className="font-mono text-[10px] font-bold uppercase tracking-widest px-2">Copied</span> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            
            <a 
              href={getShareUrl()} 
              target="_blank" 
              className="flex items-center justify-center gap-2 border border-foreground/20 py-4 rounded-2xl hover:bg-foreground/5 transition-colors font-mono text-xs uppercase tracking-widest"
            >
              <ExternalLink className="w-4 h-4" /> View Public Gallery
            </a>
          </div>
        </div>
      </div>

      <div className="w-full max-w-6xl mx-auto mb-16">
        <h3 className="font-serif text-3xl mb-6">Upload New Photos</h3>
        <ImageUploader eventId={event.id} onUploadComplete={fetchEventData} />
      </div>
      
      <div className="w-full max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6 border-b border-foreground/10 pb-4">
          <h3 className="font-serif text-3xl">Gallery ({photos.length})</h3>
        </div>
        
        {photos.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-foreground/10 rounded-[2rem]">
            <ImageIcon className="w-8 h-8 opacity-20 mx-auto mb-4" />
            <p className="opacity-50">No photos uploaded yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map(photo => (
              <div key={photo.id} className="group relative aspect-square rounded-2xl overflow-hidden bg-foreground/5 border border-foreground/10">
                <img 
                  src={photo.public_url} 
                  alt="Gallery image" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  loading="lazy"
                />
                
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <button
                    onClick={() => handleSetCover(photo.public_url)}
                    className={`p-3 rounded-full backdrop-blur-md transition-colors ${
                      event.cover_image_url === photo.public_url 
                        ? 'bg-foreground text-background' 
                        : 'bg-white/20 hover:bg-white/40 text-white'
                    }`}
                    title={event.cover_image_url === photo.public_url ? "Current Cover" : "Set as Cover"}
                  >
                    <Star className={`w-4 h-4 ${event.cover_image_url === photo.public_url ? 'fill-current' : ''}`} />
                  </button>
                  <a href={photo.public_url} target="_blank" className="p-3 bg-white/20 hover:bg-white/40 text-white rounded-full backdrop-blur-md transition-colors">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button 
                    onClick={() => handleDeletePhotoFix(photo.id)}
                    className="p-3 bg-red-500/80 hover:bg-red-500 text-white rounded-full backdrop-blur-md transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
