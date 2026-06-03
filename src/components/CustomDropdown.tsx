"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";

type Option = {
  label: string;
  value: string;
};

type Props = {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
};

export default function CustomDropdown({ options, value, onChange, label }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((o) => o.value === value);

  return (
    <div className="relative">
      {label && <label className="block text-xs font-mono uppercase tracking-widest opacity-60 mb-3">{label}</label>}
      
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-transparent border-b border-foreground/20 py-3 focus:outline-none focus:border-foreground transition-colors text-left flex items-center justify-between text-lg group"
      >
        <span className={selectedOption ? "text-foreground" : "text-foreground/40"}>
          {selectedOption ? selectedOption.label : "Select an option"}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 opacity-40 group-hover:opacity-100 transition-opacity" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pt-2 flex flex-col gap-1">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full text-left px-4 py-3 flex items-center justify-between rounded-xl transition-all
                    ${value === option.value ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"}
                  `}
                >
                  <span className="text-sm font-medium">{option.label}</span>
                  {value === option.value && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
