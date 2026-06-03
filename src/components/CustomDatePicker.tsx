"use client";

import { useState } from "react";
import { 
  format, addMonths, subMonths, startOfMonth, endOfMonth, 
  startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay,
  isToday
} from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  selectedDate: Date | null;
  onSelect: (date: Date) => void;
  label?: string;
};

export default function CustomDatePicker({ selectedDate, onSelect, label = "Date" }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());

  const daysInMonth = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth)),
    end: endOfWeek(endOfMonth(currentMonth))
  });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const handleSelect = (date: Date) => {
    onSelect(date);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <label className="block text-xs font-mono uppercase tracking-widest opacity-60 mb-3">{label}</label>
      
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-transparent border-b border-foreground/20 py-3 focus:outline-none focus:border-foreground transition-colors text-left flex items-center justify-between text-lg group"
      >
        <span className={selectedDate ? "text-foreground" : "text-foreground/40"}>
          {selectedDate ? format(selectedDate, "MMMM do, yyyy") : "Select a date"}
        </span>
        <CalendarIcon className="w-5 h-5 opacity-40 group-hover:opacity-100 transition-opacity" />
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
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] sm:w-[320px] bg-[#111] border border-white/10 rounded-[2rem] p-6 shadow-2xl z-50 overflow-hidden text-white"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
              
              <div className="flex justify-between items-center mb-6 relative z-10">
                <button type="button" onClick={prevMonth} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h3 className="font-serif text-xl tracking-wide">{format(currentMonth, "MMMM yyyy")}</h3>
                <button type="button" onClick={nextMonth} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-y-4 gap-x-1 mb-2 relative z-10 text-center">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                  <div key={day} className="text-[10px] font-mono uppercase tracking-widest opacity-40">
                    {day}
                  </div>
                ))}
                
                {daysInMonth.map((date, i) => {
                  const isSelected = selectedDate && isSameDay(date, selectedDate);
                  const isCurrentMonth = isSameMonth(date, currentMonth);
                  const isCurrentDay = isToday(date);

                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSelect(date)}
                      className={`
                        h-10 w-full rounded-full flex items-center justify-center text-sm transition-all
                        ${!isCurrentMonth ? "opacity-20 hover:opacity-50" : "hover:bg-white/10"}
                        ${isSelected ? "bg-white text-black font-medium hover:bg-white hover:opacity-90 scale-110 shadow-lg" : ""}
                        ${isCurrentDay && !isSelected ? "border border-white/20" : ""}
                      `}
                    >
                      {format(date, "d")}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
