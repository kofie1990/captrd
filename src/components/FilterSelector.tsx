"use client";

import { AESTHETIC_FILTERS } from "@/lib/filters";
import { Check } from "lucide-react";

interface FilterSelectorProps {
  selectedFilter: string;
  onSelect: (filterId: string) => void;
}

const STOCK_IMAGE = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80";

export default function FilterSelector({ selectedFilter, onSelect }: FilterSelectorProps) {
  return (
    <div className="w-full">
      <label className="block font-mono text-xs uppercase tracking-widest opacity-60 mb-4">Aesthetic Filter</label>
      <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide">
        {AESTHETIC_FILTERS.map((filter) => {
          const isSelected = selectedFilter === filter.id;
          return (
            <button
              key={filter.id}
              onClick={() => onSelect(filter.id)}
              className="relative flex-shrink-0 w-24 md:w-28 text-left group focus:outline-none"
              type="button"
            >
              <div className={`relative w-full aspect-[3/4] rounded-xl overflow-hidden mb-3 border-2 transition-all duration-300 ${isSelected ? 'border-foreground shadow-xl scale-105' : 'border-transparent shadow-md'}`}>
                <img 
                  src={STOCK_IMAGE} 
                  alt={filter.name} 
                  className={`w-full h-full object-cover ${filter.className} group-hover:scale-110 transition-transform duration-700 ease-out`} 
                />
                {isSelected && (
                  <div className="absolute top-2 right-2 bg-foreground text-background p-1 rounded-full shadow-lg">
                    <Check className="w-3 h-3" />
                  </div>
                )}
              </div>
              <p className={`font-mono text-[9px] md:text-[10px] uppercase tracking-widest text-center transition-opacity ${isSelected ? 'opacity-100 font-bold' : 'opacity-50'}`}>
                {filter.name}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
