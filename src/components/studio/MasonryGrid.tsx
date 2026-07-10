"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

type Photo = {
  id: string;
  public_url: string;
};

export default function MasonryGrid({ photos }: { photos: Photo[] }) {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  const handleDownload = async (url: string, index: number) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `captrd_studio_${index + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Download failed:", error);
      // Fallback for direct download if fetch fails due to CORS
      window.open(url, '_blank');
    }
  };

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedPhotoIndex !== null && selectedPhotoIndex < photos.length - 1) {
      setSelectedPhotoIndex(selectedPhotoIndex + 1);
    }
  };

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedPhotoIndex !== null && selectedPhotoIndex > 0) {
      setSelectedPhotoIndex(selectedPhotoIndex - 1);
    }
  };

  if (photos.length === 0) {
    return (
      <div className="w-full py-32 flex flex-col items-center justify-center border border-dashed border-foreground/20 rounded-[3rem]">
        <h3 className="font-serif text-3xl mb-4">No Photos Yet</h3>
        <p className="opacity-50">The photographer hasn't uploaded any photos to this gallery.</p>
      </div>
    );
  }

  return (
    <>
      <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-1 md:gap-2 space-y-1 md:space-y-2">
        {photos.map((photo, index) => (
          <motion.div 
            key={photo.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(index * 0.05, 1) }}
            className="break-inside-avoid relative group overflow-hidden cursor-pointer bg-foreground/5"
            onClick={() => setSelectedPhotoIndex(index)}
          >
            <img 
              src={photo.public_url} 
              alt={`Gallery photo ${index + 1}`}
              className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              loading="lazy"
            />
            
            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white transform scale-90 group-hover:scale-100 transition-transform">
                <ZoomIn className="w-5 h-5" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedPhotoIndex !== null && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl"
            onClick={() => setSelectedPhotoIndex(null)}
          >
            {/* Close Button */}
            <button 
              className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-50 backdrop-blur-md"
              onClick={() => setSelectedPhotoIndex(null)}
            >
              <X className="w-5 h-5" />
            </button>

            {/* Download Button */}
            <button 
              className="absolute top-6 right-24 bg-white text-black px-6 py-3 rounded-full font-mono text-[10px] uppercase tracking-widest font-bold hover:scale-105 active:scale-95 transition-all z-50 flex items-center gap-2"
              onClick={(e) => {
                e.stopPropagation();
                handleDownload(photos[selectedPhotoIndex].public_url, selectedPhotoIndex);
              }}
            >
              <Download className="w-4 h-4" /> Download
            </button>

            {/* Main Image */}
            <motion.div 
              key={selectedPhotoIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-[90vw] max-h-[85vh] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={photos[selectedPhotoIndex].public_url} 
                alt={`Photo ${selectedPhotoIndex + 1}`}
                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
              />
            </motion.div>

            {/* Navigation Buttons */}
            {selectedPhotoIndex > 0 && (
              <button 
                className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-50 backdrop-blur-md"
                onClick={prevPhoto}
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
            )}
            
            {selectedPhotoIndex < photos.length - 1 && (
              <button 
                className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-50 backdrop-blur-md"
                onClick={nextPhoto}
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            )}

            {/* Photo Counter */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 font-mono text-xs tracking-widest text-white/50 bg-black/50 px-4 py-2 rounded-full backdrop-blur-md">
              {selectedPhotoIndex + 1} / {photos.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
