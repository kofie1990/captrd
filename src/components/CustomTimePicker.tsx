"use client";

import { useState, useEffect, useRef } from "react";
import { format, setHours, setMinutes } from "date-fns";
import { Clock, ChevronUp, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  selectedTime: Date | null;
  onSelect: (time: Date) => void;
  label?: string;
};

export default function CustomTimePicker({ selectedTime, onSelect, label = "Time" }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date>(selectedTime || new Date());
  
  // Update internal state if external selectedTime changes
  useEffect(() => {
    if (selectedTime) {
      setCurrentTime(selectedTime);
    }
  }, [selectedTime]);

  const currentHour12 = parseInt(format(currentTime, "h"), 10);
  const currentMinute = parseInt(format(currentTime, "m"), 10);
  const currentPeriod = format(currentTime, "a"); // "AM" or "PM"

  const handleHourChange = (delta: number) => {
    let newHour12 = currentHour12 + delta;
    let newPeriod = currentPeriod;

    if (newHour12 > 12) {
      newHour12 = 1;
      newPeriod = newPeriod === "AM" ? "PM" : "AM";
    } else if (newHour12 < 1) {
      newHour12 = 12;
      newPeriod = newPeriod === "AM" ? "PM" : "AM";
    }

    let newHour24 = newHour12;
    if (newPeriod === "PM" && newHour12 !== 12) newHour24 += 12;
    if (newPeriod === "AM" && newHour12 === 12) newHour24 = 0;

    const updated = setHours(currentTime, newHour24);
    setCurrentTime(updated);
    onSelect(updated);
  };

  const handleMinuteChange = (delta: number) => {
    let newMinute = currentMinute + delta;
    let carryHour = 0;

    if (newMinute > 59) {
      newMinute = 0;
      carryHour = 1;
    } else if (newMinute < 0) {
      newMinute = 59;
      carryHour = -1;
    }

    let updated = setMinutes(currentTime, newMinute);
    if (carryHour !== 0) {
       // We can just use date-fns to handle the hour addition smoothly
       updated = new Date(updated.getTime() + carryHour * 60 * 60 * 1000);
    }
    
    setCurrentTime(updated);
    onSelect(updated);
  };

  const togglePeriod = () => {
    let newHour24 = parseInt(format(currentTime, "H"), 10);
    if (currentPeriod === "AM") {
      newHour24 = (newHour24 + 12) % 24;
    } else {
      newHour24 = (newHour24 - 12 + 24) % 24;
    }
    const updated = setHours(currentTime, newHour24);
    setCurrentTime(updated);
    onSelect(updated);
  };

  // Scroll handler for natural scrolling
  const handleScroll = (e: React.WheelEvent, type: 'hour' | 'minute') => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -1 : 1;
    if (type === 'hour') handleHourChange(delta);
    else handleMinuteChange(delta);
  };

  return (
    <div className="relative">
      <label className="block text-xs font-mono uppercase tracking-widest opacity-60 mb-3">{label}</label>
      
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-transparent border-b border-foreground/20 py-3 focus:outline-none focus:border-foreground transition-colors text-left flex items-center justify-between text-lg group"
      >
        <span className={selectedTime ? "text-foreground" : "text-foreground/40"}>
          {selectedTime ? format(selectedTime, "h:mm a") : "Select a time"}
        </span>
        <Clock className="w-5 h-5 opacity-40 group-hover:opacity-100 transition-opacity" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] sm:w-[280px] bg-[#111] border border-white/10 rounded-[2rem] p-6 shadow-2xl z-50 overflow-hidden text-white"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
              
              <div className="relative z-10 flex items-center justify-center gap-4">
                
                {/* Hours */}
                <div 
                  className="flex flex-col items-center group cursor-ns-resize"
                  onWheel={(e) => handleScroll(e, 'hour')}
                >
                  <button type="button" onClick={() => handleHourChange(1)} className="p-2 opacity-50 hover:opacity-100 hover:bg-white/10 rounded-full transition-all">
                    <ChevronUp className="w-5 h-5" />
                  </button>
                  <div className="w-16 h-16 flex items-center justify-center font-serif text-4xl bg-white/5 rounded-2xl border border-white/10 select-none">
                    {currentHour12.toString().padStart(2, '0')}
                  </div>
                  <button type="button" onClick={() => handleHourChange(-1)} className="p-2 opacity-50 hover:opacity-100 hover:bg-white/10 rounded-full transition-all">
                    <ChevronDown className="w-5 h-5" />
                  </button>
                </div>

                <div className="font-serif text-3xl opacity-50 pb-4 select-none">:</div>

                {/* Minutes */}
                <div 
                  className="flex flex-col items-center group cursor-ns-resize"
                  onWheel={(e) => handleScroll(e, 'minute')}
                >
                  <button type="button" onClick={() => handleMinuteChange(1)} className="p-2 opacity-50 hover:opacity-100 hover:bg-white/10 rounded-full transition-all">
                    <ChevronUp className="w-5 h-5" />
                  </button>
                  <div className="w-16 h-16 flex items-center justify-center font-serif text-4xl bg-white/5 rounded-2xl border border-white/10 select-none">
                    {currentMinute.toString().padStart(2, '0')}
                  </div>
                  <button type="button" onClick={() => handleMinuteChange(-1)} className="p-2 opacity-50 hover:opacity-100 hover:bg-white/10 rounded-full transition-all">
                    <ChevronDown className="w-5 h-5" />
                  </button>
                </div>

                {/* AM/PM */}
                <div className="flex flex-col items-center justify-center h-full pt-2">
                  <button 
                    type="button" 
                    onClick={togglePeriod}
                    className="flex flex-col overflow-hidden bg-white/5 rounded-2xl border border-white/10 select-none h-[4.5rem] w-12 text-sm font-mono tracking-widest uppercase font-medium hover:border-white/30 transition-colors"
                  >
                    <div className={`flex-1 flex items-center justify-center w-full transition-colors ${currentPeriod === 'AM' ? 'bg-white text-black' : 'text-white/40 hover:bg-white/5'}`}>
                      AM
                    </div>
                    <div className={`flex-1 flex items-center justify-center w-full transition-colors ${currentPeriod === 'PM' ? 'bg-white text-black' : 'text-white/40 hover:bg-white/5'}`}>
                      PM
                    </div>
                  </button>
                </div>

              </div>
              
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
