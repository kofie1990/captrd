"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Settings, Image as ImageIcon, ExternalLink, MoreVertical, X, LogOut, Edit2, Trash2, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navigation from "@/components/Navigation";
import Link from "next/link";

type Studio = {
  id: string;
  business_name: string;
  slug: string;
};

type StudioEvent = {
  id: string;
  name: string;
  slug: string;
  cover_image_url: string | null;
  created_at: string;
  photo_count?: number;
};

export default function StudioDashboard() {
  const [studio, setStudio] = useState<Studio | null>(null);
  const [events, setEvents] = useState<StudioEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingStudio, setCreatingStudio] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [eventName, setEventName] = useState("");
  const [creatingEvent, setCreatingEvent] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState<number | null>(null);
  
  const [activeMenuEventId, setActiveMenuEventId] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<StudioEvent | null>(null);
  const [renameName, setRenameName] = useState("");
  const [renaming, setRenaming] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    fetchData();
    if (typeof window !== "undefined" && window.location.search.includes("onboarding=true")) {
      setOnboardingStep(1);
    }
  }, []);

  useEffect(() => {
    const handleGlobalClick = () => {
      setActiveMenuEventId(null);
    };
    window.addEventListener("click", handleGlobalClick);
    return () => window.removeEventListener("click", handleGlobalClick);
  }, []);

  const fetchData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = "/login";
        return;
      }

      // Verify subscription
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_studio_subscriber")
        .eq("id", session.user.id)
        .single();

      if (!profile?.is_studio_subscriber) {
        window.location.href = "/studio";
        return;
      }

      // Fetch Studio
      const { data: studioData, error: studioError } = await supabase
        .from("studios")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      if (studioError || !studioData) {
        setLoading(false);
        return; // No studio found, show setup UI
      }

      setStudio(studioData);

      // Fetch Events
      const { data: eventsData, error: eventsError } = await supabase
        .from("studio_events")
        .select("*, studio_photos(count)")
        .eq("studio_id", studioData.id)
        .order("created_at", { ascending: false });

      if (eventsData) {
        const mappedEvents = eventsData.map((e: any) => ({
          ...e,
          photo_count: e.studio_photos[0]?.count || 0
        }));
        setEvents(mappedEvents);
      }
    } catch (error) {
      console.error("Error fetching studio data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStudio = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCreatingStudio(true);
    const formData = new FormData(e.currentTarget);
    const businessName = formData.get("business_name") as string;
    const slug = formData.get("slug") as string;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from("studios")
        .insert({
          user_id: session.user.id,
          business_name: businessName,
          slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        })
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setStudio(data);
        fetchData();
      }
    } catch (error) {
      console.error("Error creating studio:", error);
      alert("Failed to create studio. The slug might be taken.");
    } finally {
      setCreatingStudio(false);
    }
  };

  const submitCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studio || !eventName.trim()) return;
    setCreatingEvent(true);
    
    const slug = eventName.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-') + '-' + Math.random().toString(36).substring(2, 6);

    const { data, error } = await supabase
      .from("studio_events")
      .insert({
        studio_id: studio.id,
        name: eventName.trim(),
        slug
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating event:", error);
      alert("Failed to create event");
      setCreatingEvent(false);
    } else if (data) {
      window.location.href = `/studio/dashboard/${data.id}`;
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this gallery and all of its photos? This action cannot be undone.")) return;
    
    try {
      const { error } = await supabase
        .from("studio_events")
        .delete()
        .eq("id", eventId);

      if (error) throw error;
      
      setEvents(events.filter(e => e.id !== eventId));
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Failed to delete gallery");
    }
  };

  const submitRenameEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent || !renameName.trim()) return;
    setRenaming(true);

    try {
      const { data, error } = await supabase
        .from("studio_events")
        .update({ name: renameName.trim() })
        .eq("id", editingEvent.id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setEvents(events.map(e => e.id === editingEvent.id ? { ...e, name: data.name } : e));
        setEditingEvent(null);
      }
    } catch (error) {
      console.error("Error renaming event:", error);
      alert("Failed to rename gallery");
    } finally {
      setRenaming(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-background text-foreground flex items-center justify-center">Loading...</div>;
  }

  if (!studio) {
    return (
      <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6">
        <Navigation />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-foreground/5 border border-foreground/10 p-8 rounded-[2rem] backdrop-blur-md"
        >
          <h1 className="font-serif text-4xl mb-2 text-center">Setup Studio</h1>
          <p className="text-foreground/60 text-center mb-8 text-sm">Create your photographer profile to start uploading high-resolution galleries.</p>
          
          <form onSubmit={handleCreateStudio} className="flex flex-col gap-4">
            <div>
              <label className="text-xs uppercase tracking-widest font-mono opacity-50 ml-2">Business Name</label>
              <input 
                name="business_name"
                required
                placeholder="e.g. John Doe Photography"
                className="w-full mt-2 bg-background/50 border border-foreground/20 rounded-xl px-4 py-3 outline-none focus:border-foreground/50 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest font-mono opacity-50 ml-2">Custom URL Slug</label>
              <div className="flex items-center mt-2 bg-background/50 border border-foreground/20 rounded-xl overflow-hidden focus-within:border-foreground/50 transition-colors">
                <span className="pl-4 pr-1 text-foreground/40 font-mono text-sm">captrd.live/g/</span>
                <input 
                  name="slug"
                  required
                  placeholder="johndoe"
                  className="w-full bg-transparent px-2 py-3 outline-none"
                />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={creatingStudio}
              className="mt-4 w-full bg-foreground text-background py-4 rounded-full font-mono text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {creatingStudio ? "Creating..." : "Create Studio"}
            </button>
          </form>
        </motion.div>
      </main>
    );
  }

  const ONBOARDING_STEPS = [
    {
      title: "Welcome to Captrd Studio! 📸",
      description: "We are thrilled to have you here! Let's get you set up to share pristine, high-resolution galleries with your clients in just a few steps.",
      actionText: "Let's Go"
    },
    {
      title: "Step 1: Setup Studio Profile 🏢",
      description: "If you haven't yet, specify your business name and slug. Your slug creates your custom gallery hub URL (e.g. captrd.live/g/your-slug). All public galleries will live here.",
      actionText: "Next Step"
    },
    {
      title: "Step 2: Create a Gallery 📂",
      description: "Click the 'New Gallery' button on the dashboard to create a new client project (e.g., 'John & Sarah Wedding'). You can upload hundreds of high-res photos.",
      actionText: "Next Step"
    },
    {
      title: "Step 3: Easy Client Downloads 🚀",
      description: "Clients can view and download high-resolution versions of your work instantly without compressed qualities or having to create a Captrd account.",
      actionText: "Got it, Finish!"
    }
  ];

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col relative pt-24 px-6 md:px-16 pb-20">
      <Navigation />
      
      <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] opacity-50 mb-2">Studio Dashboard</p>
          <h1 className="font-serif text-4xl md:text-6xl tracking-tight">
            {studio.business_name}
          </h1>
          <div className="flex items-center gap-2 mt-3">
            <span className="px-3 py-1 bg-foreground/10 rounded-full text-xs font-mono opacity-70">
              captrd.live/g/{studio.slug}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-red-500/30 text-red-400 bg-red-500/5 hover:bg-red-500/15 hover:border-red-500/50 transition-all font-mono text-[10px] md:text-xs uppercase tracking-widest"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5 md:w-4 md:h-4" /> 
            <span className="hidden md:inline">Sign Out</span>
          </button>
          <button className="w-12 h-12 rounded-full border border-foreground/20 flex items-center justify-center hover:bg-foreground/5 transition-colors">
            <Settings className="w-5 h-5 opacity-70" />
          </button>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-foreground text-background px-6 py-3 rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all font-onboarding-btn"
          >
            <Plus className="w-4 h-4" />
            <span className="font-mono text-xs uppercase tracking-widest font-bold">New Gallery</span>
          </button>
        </div>
      </div>

      <div className="w-full max-w-6xl mx-auto">
        {events.length === 0 ? (
          <div className="w-full py-32 border border-dashed border-foreground/20 rounded-[2rem] flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-foreground/5 flex items-center justify-center mb-6">
              <ImageIcon className="w-6 h-6 opacity-40" />
            </div>
            <h3 className="font-serif text-2xl mb-2">No galleries yet</h3>
            <p className="opacity-50 max-w-md mb-8">Create your first event gallery and start uploading high-resolution photos for your clients.</p>
            <button 
              onClick={() => setShowModal(true)}
              className="px-8 py-3 border border-foreground/20 rounded-full hover:bg-foreground/5 transition-colors font-mono text-xs uppercase tracking-widest"
            >
              Create Gallery
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <motion.div 
                key={event.id}
                whileHover={{ y: -5 }}
                className="group relative bg-foreground/5 border border-foreground/10 rounded-[2rem] flex flex-col"
              >
                <Link href={`/studio/dashboard/${event.id}`} className="absolute inset-0 z-10" />
                
                <div className="aspect-[4/3] bg-foreground/10 relative overflow-hidden rounded-t-[2rem]">
                  {event.cover_image_url ? (
                    <img src={event.cover_image_url} alt={event.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 opacity-20" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                
                <div className="p-6 flex flex-col flex-1 justify-between relative z-20">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-serif text-2xl mb-1 pr-4">{event.name}</h3>
                      <p className="font-mono text-[10px] uppercase tracking-widest opacity-50">
                        {new Date(event.created_at).toLocaleDateString()} • {event.photo_count} Photos
                      </p>
                    </div>
                    <div className="relative z-30">
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setActiveMenuEventId(activeMenuEventId === event.id ? null : event.id);
                        }}
                        className="p-2 -mr-2 opacity-50 hover:opacity-100 hover:bg-foreground/10 rounded-full transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      
                      {activeMenuEventId === event.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-background border border-foreground/10 rounded-2xl shadow-xl backdrop-blur-md py-2 z-40 overflow-hidden">
                          <Link 
                            href={`/studio/dashboard/${event.id}`}
                            className="flex items-center gap-3 px-4 py-3 text-xs font-mono uppercase tracking-wider hover:bg-foreground/10 transition-colors w-full text-left"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Eye className="w-3.5 h-3.5 opacity-60" />
                            <span>View Gallery</span>
                          </Link>
                          
                          <a 
                            href={`/g/${studio.slug}/${event.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-3 px-4 py-3 text-xs font-mono uppercase tracking-wider hover:bg-foreground/10 transition-colors w-full text-left border-b border-foreground/10"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                            <span>Open Live</span>
                          </a>
                          
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setEditingEvent(event);
                              setRenameName(event.name);
                              setActiveMenuEventId(null);
                            }}
                            className="flex items-center gap-3 px-4 py-3 text-xs font-mono uppercase tracking-wider hover:bg-foreground/10 transition-colors w-full text-left"
                          >
                            <Edit2 className="w-3.5 h-3.5 opacity-60" />
                            <span>Rename</span>
                          </button>
                          
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDeleteEvent(event.id);
                              setActiveMenuEventId(null);
                            }}
                            className="flex items-center gap-3 px-4 py-3 text-xs font-mono uppercase tracking-wider text-red-500 hover:bg-red-500/10 transition-colors w-full text-left"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-foreground/10">
                    <span className="font-mono text-[10px] opacity-40 truncate">
                      /{event.slug}
                    </span>
                    <a 
                      href={`/g/${studio.slug}/${event.slug}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="p-2 bg-foreground/10 rounded-full hover:bg-foreground/20 transition-colors relative z-30"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-background border border-foreground/10 p-8 rounded-[2rem] relative shadow-2xl"
            >
              <button 
                onClick={() => setShowModal(false)}
                className="absolute top-6 right-6 opacity-50 hover:opacity-100 transition-opacity"
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="font-serif text-3xl mb-2">New Gallery</h2>
              <p className="opacity-60 text-sm mb-6">Enter a name for the event gallery.</p>
              
              <form onSubmit={submitCreateEvent} className="flex flex-col gap-4">
                <input
                  autoFocus
                  required
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  placeholder="e.g., Smith Wedding 2026"
                  className="w-full bg-foreground/5 border border-foreground/20 rounded-xl px-4 py-3 outline-none focus:border-foreground/50 transition-colors"
                />
                <button 
                  type="submit"
                  disabled={creatingEvent}
                  className="mt-2 w-full bg-foreground text-background py-4 rounded-full font-mono text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {creatingEvent ? "Creating..." : "Create Gallery"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editingEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-background border border-foreground/10 p-8 rounded-[2rem] relative shadow-2xl"
            >
              <button 
                onClick={() => setEditingEvent(null)}
                className="absolute top-6 right-6 opacity-50 hover:opacity-100 transition-opacity"
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="font-serif text-3xl mb-2">Rename Gallery</h2>
              <p className="opacity-60 text-sm mb-6">Enter a new name for the event gallery.</p>
              
              <form onSubmit={submitRenameEvent} className="flex flex-col gap-4">
                <input
                  autoFocus
                  required
                  value={renameName}
                  onChange={(e) => setRenameName(e.target.value)}
                  placeholder="e.g., Smith Wedding 2026"
                  className="w-full bg-foreground/5 border border-foreground/20 rounded-xl px-4 py-3 outline-none focus:border-foreground/50 transition-colors"
                />
                <button 
                  type="submit"
                  disabled={renaming}
                  className="mt-2 w-full bg-foreground text-background py-4 rounded-full font-mono text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {renaming ? "Saving..." : "Save Changes"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Onboarding Wizard Overlay */}
      <AnimatePresence>
        {onboardingStep !== null && (
          <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full p-[1px] rounded-[2rem] bg-gradient-to-r from-foreground/10 to-foreground/5 shadow-2xl backdrop-blur-xl border border-foreground/10">
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="bg-background/95 rounded-[2rem] p-6 text-foreground border border-foreground/5"
            >
              <div className="flex justify-between items-center mb-4">
                <span className="font-mono text-[10px] uppercase tracking-widest opacity-50">
                  Step {onboardingStep} of {ONBOARDING_STEPS.length}
                </span>
                <button 
                  onClick={() => setOnboardingStep(null)}
                  className="p-1 rounded-full hover:bg-foreground/10 opacity-50 hover:opacity-100 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <h4 className="font-serif text-xl mb-2">
                {ONBOARDING_STEPS[onboardingStep - 1].title}
              </h4>
              <p className="text-xs opacity-70 leading-relaxed mb-6 font-sans">
                {ONBOARDING_STEPS[onboardingStep - 1].description}
              </p>

              <div className="flex justify-between items-center gap-4">
                {onboardingStep > 1 ? (
                  <button 
                    onClick={() => setOnboardingStep(prev => prev ? prev - 1 : null)}
                    className="font-mono text-[10px] uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity"
                  >
                    Back
                  </button>
                ) : (
                  <button 
                    onClick={() => setOnboardingStep(null)}
                    className="font-mono text-[10px] uppercase tracking-widest opacity-30 hover:opacity-65 transition-opacity"
                  >
                    Skip Tour
                  </button>
                )}

                <button 
                  onClick={() => {
                    if (onboardingStep === ONBOARDING_STEPS.length) {
                      setOnboardingStep(null);
                      // Clear query param so it doesn't reopen on refresh
                      const url = new URL(window.location.href);
                      url.searchParams.delete('onboarding');
                      window.history.replaceState({}, '', url.toString());
                    } else {
                      setOnboardingStep(prev => prev ? prev + 1 : null);
                    }
                  }}
                  className="px-6 py-2.5 bg-foreground text-background font-medium tracking-widest text-[10px] uppercase rounded-full hover:scale-105 active:scale-[0.98] transition-all"
                >
                  {ONBOARDING_STEPS[onboardingStep - 1].actionText}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
