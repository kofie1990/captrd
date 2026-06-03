export type BloomConfig = {
  radius: number;
  opacity: number;
  blendMode: GlobalCompositeOperation;
};

export type FilterConfig = {
  id: string;
  name: string;
  /** Tailwind utility classes for CSS preview on <img>/<video> elements */
  className: string;
  /** Native CSS filter string for canvas baking via ctx.filter */
  cssFilter: string;
  /** Optional bloom/mist configuration for the canvas processing pass */
  bloom?: BloomConfig;
};

export const AESTHETIC_FILTERS: FilterConfig[] = [
  { id: "none", name: "Clean", className: "", cssFilter: "" },
  { 
    id: "promist", 
    name: "Pro Mist 1/4", 
    className: "contrast-[0.95] brightness-[1.05]", 
    cssFilter: "contrast(0.95) brightness(1.05)",
    bloom: { radius: 30, opacity: 0.3, blendMode: "screen" }
  },
  { 
    id: "whitemist", 
    name: "White Mist", 
    className: "contrast-[0.9] brightness-110", 
    cssFilter: "contrast(0.9) brightness(1.1)",
    bloom: { radius: 40, opacity: 0.4, blendMode: "screen" }
  },
  { 
    id: "roseglow", 
    name: "Rose Glow", 
    className: "sepia-[0.2] contrast-[0.95] hue-rotate-[-5deg]", 
    cssFilter: "sepia(0.2) contrast(0.95) hue-rotate(-5deg)",
    bloom: { radius: 50, opacity: 0.35, blendMode: "lighter" }
  },
  { 
    id: "retrosoft", 
    name: "Retro Soft", 
    className: "contrast-[0.85] sepia-[0.15] saturate-[0.8]", 
    cssFilter: "contrast(0.85) sepia(0.15) saturate(0.8)",
    bloom: { radius: 20, opacity: 0.45, blendMode: "screen" }
  },
  { 
    id: "vintage", 
    name: "Disposable", 
    // Refined disposable: punchy contrast, slightly cooler shadows, overexposed, subtle bloom
    className: "contrast-125 saturate-110 brightness-110 sepia-[0.1] hue-rotate-[10deg]", 
    cssFilter: "contrast(1.25) saturate(1.1) brightness(1.1) sepia(0.1) hue-rotate(10deg)",
    bloom: { radius: 15, opacity: 0.2, blendMode: "screen" }
  },
  { 
    id: "bw", 
    name: "B&W Film", 
    className: "grayscale contrast-125 brightness-110", 
    cssFilter: "grayscale(1) contrast(1.25) brightness(1.1)" 
  }
];

export const getFilterClass = (filterId?: string) => {
  const filter = AESTHETIC_FILTERS.find(f => f.id === filterId);
  return filter ? filter.className : "";
};

export const getCssFilter = (filterId?: string) => {
  const filter = AESTHETIC_FILTERS.find(f => f.id === filterId);
  return filter ? filter.cssFilter : "";
};

export const getFilterBloom = (filterId?: string) => {
  const filter = AESTHETIC_FILTERS.find(f => f.id === filterId);
  return filter ? filter.bloom : undefined;
};
