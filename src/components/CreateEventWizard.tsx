"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { ArrowRight, ArrowLeft, CheckCircle2, Upload, Sparkles, Image as ImageIcon, Edit3, X } from "lucide-react";
import CustomDatePicker from "./CustomDatePicker";
import CustomTimePicker from "./CustomTimePicker";
import CustomDropdown from "./CustomDropdown";
import FilterSelector from "./FilterSelector";

type Props = {
  userId: string;
  onEventCreated: (event: any) => void;
};

const GUEST_TIERS = [
  { guests: 3, price: 0, maxPhotos: 5 },
  { guests: 5, price: 10, maxPhotos: 15 },
  { guests: 10, price: 20, maxPhotos: 20 },
  { guests: 15, price: 30, maxPhotos: 25 },
  { guests: 20, price: 40, maxPhotos: 30 },
  { guests: 30, price: 60, maxPhotos: 35 },
  { guests: 50, price: 100, maxPhotos: 40 },
  { guests: 100, price: 150, maxPhotos: 50 },
];

const PRESET_COVERS = [
  "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=90&w=1200&auto=format&fit=crop", // Wedding
  "https://images.unsplash.com/photo-1513151233558-d860c5398176?q=90&w=1200&auto=format&fit=crop", // Party
  "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=90&w=1200&auto=format&fit=crop", // Concert/Lights
  "https://images.unsplash.com/photo-1533105079780-92b9be482077?q=90&w=1200&auto=format&fit=crop", // Event/Social
];

export default function CreateEventWizard({ userId, onEventCreated }: Props) {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [eventDate, setEventDate] = useState<Date | null>(new Date());

  const [revealOption, setRevealOption] = useState("next_day");
  const [customRevealDate, setCustomRevealDate] = useState<Date | null>(new Date());
  const [customRevealTime, setCustomRevealTime] = useState<Date | null>(new Date());

  const [guestTierIdx, setGuestTierIdx] = useState(0);
  const selectedTier = GUEST_TIERS[guestTierIdx];
  const [customMaxPhotos, setCustomMaxPhotos] = useState(selectedTier.maxPhotos);

  const [filter, setFilter] = useState("normal");

  // Step 6 State
  const [coverType, setCoverType] = useState<"preset" | "upload">("preset");
  const [selectedPreset, setSelectedPreset] = useState(PRESET_COVERS[0]);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [inviteDetails, setInviteDetails] = useState("We can't wait to celebrate with you!");

  const [isEditingCover, setIsEditingCover] = useState(false);
  const [isEditingDetails, setIsEditingDetails] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const generateShortCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

  const handleNext = () => {
    if (step === 1 && !title.trim()) return;
    if (step === 2 && !eventDate) return;

    setDirection(1);
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setDirection(-1);
    setStep((prev) => prev - 1);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setUploadedImagePreview(URL.createObjectURL(file));
      setCoverType("upload");
      setIsEditingCover(false); // Auto close menu on selection
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    let finalRevealAtStr = new Date().toISOString();

    if (revealOption === "custom" && customRevealDate && customRevealTime) {
      const finalDate = new Date(customRevealDate);
      finalDate.setHours(customRevealTime.getHours(), customRevealTime.getMinutes(), 0, 0);
      finalRevealAtStr = finalDate.toISOString();
    } else if (eventDate) {
      const date = new Date(eventDate.getTime());
      if (revealOption === "instantly") {
        finalRevealAtStr = date.toISOString();
      } else if (revealOption === "next_day") {
        date.setDate(date.getDate() + 1);
        date.setHours(9, 0, 0, 0);
        finalRevealAtStr = date.toISOString();
      }
    }

    let finalCoverUrl = selectedPreset;
    if (coverType === "upload" && uploadedFile) {
      // NOTE: For a real production app, upload `uploadedFile` to Supabase Storage here.
      // e.g. await supabase.storage.from('covers').upload(...)
      // We will fallback to the local blob preview URL for now or if upload fails.
      finalCoverUrl = uploadedImagePreview || selectedPreset;
    }

    const { data, error } = await supabase
      .from("events")
      .insert([{
        title,
        reveal_at: finalRevealAtStr,
        aesthetic_filter: filter,
        admin_id: userId,
        short_code: generateShortCode(),
        max_photos_per_user: selectedTier.guests === 3 ? 5 : customMaxPhotos,
        cover_photo_url: finalCoverUrl,
        max_guests: selectedTier.guests,
        invite_details: inviteDetails
      }])
      .select()
      .single();

    if (!error && data) {
      onEventCreated(data);
    }
    setIsSubmitting(false);
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 50 : -50,
      opacity: 0
    })
  };

  const currentCoverImage = coverType === "upload" && uploadedImagePreview ? uploadedImagePreview : selectedPreset;

  return (
    <>
      <div className={`p-8 md:p-10 glass rounded-[2rem] shadow-xl border border-foreground/5 relative min-h-[600px] flex flex-col ${step === 6 ? 'hidden' : 'block'}`}>
        <div className="flex justify-between items-center mb-8">
          <h2 className="font-serif text-3xl">New Film Roll</h2>
          <div className="font-mono text-xs opacity-50 uppercase tracking-widest">
            Step {step} of 6
          </div>
        </div>

        <div className="flex-1 relative overflow-hidden">
          <AnimatePresence custom={direction} mode="wait">

            {/* STEP 1: BASICS */}
            {step === 1 && (
              <motion.div
                key="step1"
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="flex flex-col gap-8 absolute inset-0"
              >
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest opacity-60 mb-3">Event Title</label>
                  <input
                    required
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full bg-transparent border-b border-foreground/20 py-2 focus:outline-none focus:border-foreground transition-colors text-lg"
                    placeholder="e.g. Sarah's Wedding"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && title.trim()) handleNext();
                    }}
                  />
                </div>
                <p className="opacity-40 text-sm font-serif">
                  Give your film roll a name that guests will recognize when they scan the QR code to join.
                </p>
              </motion.div>
            )}

            {/* STEP 2: DATE */}
            {step === 2 && (
              <motion.div
                key="step2"
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="flex flex-col gap-6 absolute inset-0"
              >
                <CustomDatePicker
                  label="Date of Event"
                  selectedDate={eventDate}
                  onSelect={setEventDate}
                />
                <p className="opacity-40 text-sm font-serif mt-4">
                  When is this event taking place? We'll use this date to manage your photo reveal timeline.
                </p>
              </motion.div>
            )}

            {/* STEP 3: REVEAL SETTINGS */}
            {step === 3 && (
              <motion.div
                key="step3"
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="flex flex-col gap-6 absolute inset-0"
              >
                <CustomDropdown
                  label="When do photos reveal?"
                  value={revealOption}
                  onChange={setRevealOption}
                  options={[
                    { label: "Next Day at 9:00 AM", value: "next_day" },
                    { label: "Instantly", value: "instantly" },
                    { label: "Custom Time...", value: "custom" }
                  ]}
                />

                {revealOption === "custom" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="flex flex-col gap-6 pt-4 border-t border-white/10"
                  >
                    <CustomDatePicker
                      label="Reveal Date"
                      selectedDate={customRevealDate}
                      onSelect={setCustomRevealDate}
                    />
                    <CustomTimePicker
                      label="Reveal Time"
                      selectedTime={customRevealTime}
                      onSelect={setCustomTimePickerTime => setCustomRevealTime(setCustomTimePickerTime)}
                    />
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* STEP 4: GUEST LIMIT & PRICING */}
            {step === 4 && (
              <motion.div
                key="step4"
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="flex flex-col gap-5 absolute inset-0 pb-4"
              >
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest opacity-60 mb-4">Max Number of Guests</label>

                  {/* Horizontal scrollable pills that bleed to the edges of the container */}
                  <div className="flex overflow-x-auto snap-x snap-mandatory gap-3 pb-4 w-[calc(100%+4rem)] -mx-8 px-8 scrollbar-hide">
                    {GUEST_TIERS.map((tier, idx) => (
                      <button
                        key={tier.guests}
                        onClick={() => {
                          setGuestTierIdx(idx);
                          if (tier.guests === 3) setCustomMaxPhotos(5);
                          else setCustomMaxPhotos(tier.maxPhotos);
                        }}
                        className={`flex-shrink-0 snap-center px-3 py-3 rounded-xl font-mono text-sm transition-all border ${guestTierIdx === idx
                          ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.2)] scale-105'
                          : 'bg-transparent border-white/20 text-white/60 hover:border-white/50 hover:text-white'
                          }`}
                      >
                        {tier.guests}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-5 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-xl mb-1">Price</h3>
                    <p className="font-mono text-[10px] opacity-50 uppercase tracking-widest">
                      {selectedTier.guests === 3 ? "Trial Tier" : "Premium Tier"}
                    </p>
                  </div>
                  <div className="font-serif text-3xl">
                    {selectedTier.price === 0 ? "Free" : `$${selectedTier.price}`}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest opacity-60 mb-2">
                    Max Photos Per Guest
                  </label>
                  {selectedTier.guests === 3 ? (
                    <p className="font-mono text-xs p-4 bg-white/5 rounded-xl border border-white/10 text-white/50">
                      Locked to 5 photos for the free tier.
                    </p>
                  ) : (
                    <input
                      required
                      type="number"
                      min="1"
                      max="100"
                      value={customMaxPhotos}
                      onChange={e => setCustomMaxPhotos(Number(e.target.value))}
                      className="w-full bg-transparent border-b border-foreground/20 py-2 focus:outline-none focus:border-foreground transition-colors text-lg"
                    />
                  )}
                </div>
              </motion.div>
            )}

            {/* STEP 5: AESTHETIC FILTER */}
            {step === 5 && (
              <motion.div
                key="step5"
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="flex flex-col gap-8 absolute inset-0"
              >
                <div className="-mt-4">
                  <FilterSelector
                    selectedFilter={filter}
                    onSelect={(id) => setFilter(id)}
                  />
                </div>
                <p className="opacity-40 text-sm font-serif text-center mt-4">
                  This aesthetic will be applied to all photos taken by your guests on this film roll.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* BOTTOM NAV FOR STEPS 1-5 */}
        <div className="flex justify-between items-center mt-auto pt-8 border-t border-foreground/5 z-10 bg-background/50 backdrop-blur-sm -mx-8 -mb-8 px-8 pb-8 rounded-b-[2rem]">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity font-mono text-xs uppercase tracking-widest"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={handleNext}
            disabled={step === 1 && !title.trim()}
            className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-medium uppercase tracking-widest text-xs hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-30 disabled:pointer-events-none"
          >
            Next <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* STEP 6: FULL SCREEN TAP-TO-EDIT DESIGNER */}
      <AnimatePresence>
        {step === 6 && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="fixed inset-0 z-[100] bg-black text-white flex justify-center items-center lg:p-8"
          >
            {/* The Full Screen Card */}
            <div className="relative w-full h-full lg:max-w-[450px] lg:aspect-[9/16] lg:h-auto bg-black lg:rounded-[3rem] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.8)] border-0 lg:border border-white/10 group">

              {/* Background Image (Cover Photo) */}
              <div
                className="absolute inset-0 cursor-pointer group"
                onClick={() => setIsEditingCover(true)}
              >
                <img
                  src={currentCoverImage}
                  alt="Cover"
                  className="absolute inset-0 w-full h-full object-cover opacity-70 transition-opacity duration-500 group-hover:opacity-50"
                />

                {/* Permanent subtle hint for mobile */}
                <div className="absolute top-24 left-1/2 -translate-x-1/2 md:top-8 md:right-8 md:left-auto md:translate-x-0 bg-black/50 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full flex items-center gap-2 animate-pulse pointer-events-none">
                  <ImageIcon className="w-4 h-4 text-white" />
                  <span className="font-mono text-[10px] uppercase tracking-widest font-medium text-white">Tap to change cover</span>
                </div>

                {/* Hover overlay for desktop */}
                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 backdrop-blur-[2px]">
                  <div className="bg-black/50 p-4 rounded-full backdrop-blur-md mb-2 border border-white/20">
                    <ImageIcon className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>

              {/* Top Bar Navigation over the card */}
              <div className="absolute top-0 left-0 w-full p-6 lg:p-8 z-20 flex justify-between items-center pointer-events-none">
                <button
                  type="button"
                  onClick={handleBack}
                  className="w-12 h-12 flex items-center justify-center bg-black/40 backdrop-blur-md rounded-full text-white pointer-events-auto hover:bg-black/60 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-80 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full">
                  Preview Mode
                </div>
              </div>

              {/* Event Details Content */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col justify-end p-8 md:p-10 pointer-events-none">

                <h4 className="font-serif text-4xl md:text-5xl mb-2 text-white drop-shadow-lg tracking-tight leading-tight">
                  {title || "Event Title"}
                </h4>

                <p className="font-mono text-xs uppercase tracking-[0.2em] opacity-80 mb-6 text-white drop-shadow-md">
                  {eventDate ? eventDate.toLocaleDateString() : "Date"}
                </p>

                {/* Editable Details Box */}
                <div
                  className="mb-24 p-5 rounded-3xl bg-black/40 backdrop-blur-xl border border-white/10 pointer-events-auto cursor-pointer hover:bg-black/60 hover:border-white/30 transition-all group/details relative"
                  onClick={() => setIsEditingDetails(true)}
                >
                  <p className="text-sm opacity-90 leading-relaxed text-white font-serif italic pr-8">
                    "{inviteDetails}"
                  </p>
                  <div className="absolute top-4 right-4 opacity-50 group-hover/details:opacity-100 transition-opacity">
                    <Edit3 className="w-4 h-4" />
                  </div>
                </div>

              </div>

              {/* Floating Publish Button */}
              <div className="absolute bottom-8 left-0 w-full px-8 z-20 flex justify-center pointer-events-none">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full max-w-sm bg-white text-black py-4 rounded-full font-mono text-sm uppercase tracking-widest font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_10px_40px_rgba(255,255,255,0.3)] disabled:opacity-50 pointer-events-auto"
                >
                  {isSubmitting ? "Creating..." : "Publish Event"} <Sparkles className="w-4 h-4" />
                </button>
              </div>

            </div>

            {/* MODAL OVERLAYS */}

            {/* Cover Editor Menu (Bottom Sheet style) */}
            <AnimatePresence>
              {isEditingCover && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm z-30"
                    onClick={() => setIsEditingCover(false)}
                  />
                  <motion.div
                    initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="absolute bottom-0 left-0 w-full bg-[#111] lg:rounded-t-[3rem] rounded-t-3xl p-8 pb-12 z-40 border-t border-white/10 lg:w-[450px] lg:left-1/2 lg:-translate-x-1/2"
                  >
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-serif text-2xl">Select Cover Art</h3>
                      <button onClick={() => setIsEditingCover(false)} className="p-2 opacity-50 hover:opacity-100"><X className="w-6 h-6" /></button>
                    </div>

                    <div className="grid grid-cols-4 gap-3 mb-6">
                      {PRESET_COVERS.map((url, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setCoverType("preset");
                            setSelectedPreset(url);
                            setIsEditingCover(false);
                          }}
                          className={`aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer transition-all border-2 ${coverType === "preset" && selectedPreset === url ? 'border-white opacity-100 scale-105 shadow-lg' : 'border-transparent opacity-40 hover:opacity-100 hover:scale-105'
                            }`}
                        >
                          <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>

                    <input
                      type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileUpload}
                    />
                    <button
                      type="button" onClick={() => fileInputRef.current?.click()}
                      className="w-full py-4 rounded-2xl border border-dashed border-white/20 hover:border-white/50 hover:bg-white/5 flex items-center justify-center gap-3 transition-all"
                    >
                      <Upload className="w-5 h-5 opacity-60" />
                      <span className="font-mono text-xs uppercase tracking-widest opacity-60">Upload Custom Image</span>
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* Details Editor Modal */}
            <AnimatePresence>
              {isEditingDetails && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm z-30"
                    onClick={() => setIsEditingDetails(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] lg:w-[400px] bg-[#111] rounded-[2rem] p-8 z-40 border border-white/10 shadow-2xl"
                  >
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-serif text-2xl">Additional Details</h3>
                      <button onClick={() => setIsEditingDetails(false)} className="p-2 opacity-50 hover:opacity-100"><X className="w-6 h-6" /></button>
                    </div>
                    <textarea
                      rows={4}
                      value={inviteDetails}
                      onChange={e => setInviteDetails(e.target.value)}
                      placeholder="Dress code, parking instructions..."
                      className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 focus:outline-none focus:border-white/50 transition-colors text-sm resize-none font-serif leading-relaxed mb-6"
                      autoFocus
                    />
                    <button
                      onClick={() => setIsEditingDetails(false)}
                      className="w-full bg-white text-black py-4 rounded-full font-mono text-xs uppercase tracking-widest font-bold"
                    >
                      Done
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
