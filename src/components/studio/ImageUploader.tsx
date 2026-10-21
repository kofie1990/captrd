"use client";

import { useState, useCallback, useRef } from "react";
import { Upload, X, CheckCircle, AlertCircle, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { STUDIO_TIERS, StudioTier } from "@/lib/studio/tiers";
import Link from "next/link";

type FileWithPreview = File & { preview: string; id: string };

type UploadStatus = "idle" | "uploading" | "success" | "error";

interface ImageUploaderProps {
  eventId: string;
  tier?: StudioTier;
  currentPhotoCount?: number;
  onUploadComplete?: () => void;
}

export default function ImageUploader({ 
  eventId, 
  tier = 'starter',
  currentPhotoCount = 0,
  onUploadComplete 
}: ImageUploaderProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const tierConfig = STUDIO_TIERS[tier];
  const isUnlimited = tierConfig.maxPhotosPerEvent === Infinity;
  const maxPhotos = tierConfig.maxPhotosPerEvent;
  const remainingAllowance = isUnlimited ? Infinity : Math.max(0, maxPhotos - currentPhotoCount);
  const isGalleryFull = !isUnlimited && remainingAllowance <= 0;

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isGalleryFull) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, [isGalleryFull]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (newFiles: File[]) => {
    setErrorMessage(null);
    const validImageFiles = newFiles.filter(file => file.type.startsWith('image/'));
    
    if (validImageFiles.length === 0) {
      setErrorMessage("Please select valid image files.");
      return;
    }

    // 1. Check file size against tier limit
    const maxSizeBytes = tierConfig.maxFileSizeMB * 1024 * 1024;
    const oversizedFiles = validImageFiles.filter(f => f.size > maxSizeBytes);
    if (oversizedFiles.length > 0) {
      setErrorMessage(
        `${oversizedFiles.length} file(s) exceed your ${tierConfig.maxFileSizeMB}MB limit (e.g. ${oversizedFiles[0].name}). ${
          tier === 'starter' ? 'Upgrade to Pro to upload up to 100MB high-res files.' : ''
        }`
      );
    }

    const compliantFiles = validImageFiles.filter(f => f.size <= maxSizeBytes);
    
    // 2. Check remaining photo allowance
    let filesToAdd = compliantFiles;
    if (!isUnlimited) {
      const allowedCount = remainingAllowance - files.length;
      if (allowedCount <= 0) {
        setErrorMessage(`You have reached the maximum of ${maxPhotos} photos for this gallery on the Starter plan.`);
        return;
      }
      if (compliantFiles.length > allowedCount) {
        setErrorMessage(
          `Only ${allowedCount} more photo(s) can be added to stay within your ${maxPhotos} photo gallery limit.`
        );
        filesToAdd = compliantFiles.slice(0, allowedCount);
      }
    }

    const filesWithPreviews = filesToAdd.map(file => Object.assign(file, {
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substring(7)
    }));
    
    setFiles(prev => [...prev, ...filesWithPreviews]);
    setStatus("idle");
  };

  const removeFile = (idToRemove: string) => {
    setFiles(prev => prev.filter(f => f.id !== idToRemove));
    setErrorMessage(null);
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;
    
    setStatus("uploading");
    setProgress(0);
    setErrorMessage(null);
    
    let uploadedCount = 0;
    
    for (const file of files) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
        const filePath = `${eventId}/${fileName}`;
        
        // 1. Upload to Storage
        const { error: uploadError } = await supabase.storage
          .from("studio_uploads")
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });
          
        if (uploadError) throw uploadError;
        
        // 2. Get Public URL
        const { data: { publicUrl } } = supabase.storage
          .from("studio_uploads")
          .getPublicUrl(filePath);
          
        // 3. Create DB Record
        await supabase
          .from("studio_photos")
          .insert({
            event_id: eventId,
            storage_path: filePath,
            public_url: publicUrl,
          });
          
        uploadedCount++;
        setProgress(Math.round((uploadedCount / files.length) * 100));
        
      } catch (err: any) {
        console.error("Upload error:", err);
      }
    }
    
    setStatus("success");
    setFiles([]);
    if (onUploadComplete) onUploadComplete();
    
    setTimeout(() => {
      setStatus("idle");
      setProgress(0);
    }, 3000);
  };

  return (
    <div className="w-full">
      {/* Tier Quota Status Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 px-2">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs uppercase tracking-widest text-foreground/70">
            {tier === 'pro' ? (
              <span className="text-amber-400 font-bold">Pro Plan • Unlimited Photos</span>
            ) : (
              <span>
                Gallery Limit: <strong className="text-foreground">{currentPhotoCount} / {maxPhotos}</strong> photos
              </span>
            )}
          </span>
          {!isUnlimited && (
            <span className="font-mono text-[10px] uppercase opacity-50">
              ({remainingAllowance} remaining)
            </span>
          )}
        </div>

        {tier === 'starter' && (
          <Link
            href="/studio?tier=pro"
            className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-amber-400 hover:text-amber-300 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Upgrade to Pro for Unlimited
          </Link>
        )}
      </div>

      {/* Upload Dropzone */}
      {isGalleryFull ? (
        <div className="w-full border-2 border-dashed border-amber-500/30 rounded-[2rem] p-12 flex flex-col items-center justify-center text-center bg-amber-500/5 backdrop-blur-sm">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-2xl mb-2">Gallery Photo Limit Reached</h3>
          <p className="opacity-70 max-w-md text-sm mb-6">
            This gallery has reached the 150 photo limit for the Starter Plan. Upgrade to Pro to upload unlimited photos and enjoy 100MB file uploads.
          </p>
          <Link
            href="/studio?tier=pro"
            className="px-8 py-3.5 bg-foreground text-background rounded-full font-mono text-xs uppercase tracking-widest font-bold hover:scale-105 active:scale-95 transition-all shadow-lg"
          >
            Upgrade to Pro Plan
          </Link>
        </div>
      ) : (
        <div 
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="w-full border-2 border-dashed border-foreground/20 rounded-[2rem] p-12 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-foreground/5 hover:border-foreground/40 transition-all group bg-background/50 backdrop-blur-sm"
        >
          <input 
            type="file" 
            multiple 
            accept="image/*"
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileInput}
          />
          
          <div className="w-16 h-16 rounded-full bg-foreground/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
            <Upload className="w-6 h-6 opacity-60" />
          </div>
          <h3 className="font-serif text-2xl mb-2">Upload High-Res Photos</h3>
          <p className="opacity-50 max-w-sm text-sm">
            Drag and drop images here, or click to browse. Max {tierConfig.maxFileSizeMB}MB per photo.
          </p>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="mt-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
      
      {/* Selected Files Queue */}
      {files.length > 0 && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-mono text-xs uppercase tracking-widest font-bold">
              Selected Files ({files.length})
            </h4>
            
            {(status === "idle" || status === "error") && (
              <button 
                onClick={uploadFiles}
                className="bg-foreground text-background px-6 py-2.5 rounded-full font-mono text-[10px] uppercase tracking-widest font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md"
              >
                Start Upload ({files.length})
              </button>
            )}
          </div>
          
          {status === "uploading" && (
            <div className="w-full bg-foreground/10 rounded-full h-2 mb-6 overflow-hidden">
              <div 
                className="bg-foreground h-full transition-all duration-300" 
                style={{ width: `${progress}%` }} 
              />
            </div>
          )}
          
          {status === "success" && (
            <div className="bg-green-500/10 text-green-500 p-4 rounded-2xl mb-6 flex items-center gap-3">
              <CheckCircle className="w-5 h-5" />
              <span className="font-mono text-xs uppercase tracking-widest font-bold">Upload Complete</span>
            </div>
          )}
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {files.map(file => (
              <div key={file.id} className="relative aspect-square rounded-2xl overflow-hidden group border border-foreground/10 bg-foreground/5">
                <img 
                  src={file.preview} 
                  alt={file.name} 
                  className="w-full h-full object-cover" 
                />
                
                {status === "idle" && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); removeFile(file.id); }}
                    className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
