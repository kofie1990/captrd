"use client";

import { useState, useCallback, useRef } from "react";
import { Upload, X, CheckCircle, AlertCircle, ImageIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type FileWithPreview = File & { preview: string; id: string };

type UploadStatus = "idle" | "uploading" | "success" | "error";

interface ImageUploaderProps {
  eventId: string;
  onUploadComplete?: () => void;
}

export default function ImageUploader({ eventId, onUploadComplete }: ImageUploaderProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(file => file.type.startsWith('image/'));
    
    const filesWithPreviews = validFiles.map(file => Object.assign(file, {
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substring(7)
    }));
    
    setFiles(prev => [...prev, ...filesWithPreviews]);
    setStatus("idle");
  };

  const removeFile = (idToRemove: string) => {
    setFiles(prev => prev.filter(f => f.id !== idToRemove));
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;
    
    setStatus("uploading");
    setProgress(0);
    
    let uploadedCount = 0;
    
    for (const file of files) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
        const filePath = `${eventId}/${fileName}`;
        
        // 1. Upload to Storage
        const { error: uploadError, data } = await supabase.storage
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
        // We'd ideally want real width/height but skipping for now to keep it simple, 
        // or we could use an Image object to read it before uploading.
        await supabase
          .from("studio_photos")
          .insert({
            event_id: eventId,
            storage_path: filePath,
            public_url: publicUrl,
          });
          
        uploadedCount++;
        setProgress(Math.round((uploadedCount / files.length) * 100));
        
      } catch (err) {
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
          Drag and drop your images here, or click to browse. We preserve your original quality.
        </p>
      </div>
      
      {files.length > 0 && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-mono text-xs uppercase tracking-widest font-bold">
              Selected Files ({files.length})
            </h4>
            
            {status === "idle" || status === "error" ? (
              <button 
                onClick={uploadFiles}
                className="bg-foreground text-background px-6 py-2 rounded-full font-mono text-[10px] uppercase tracking-widest font-bold hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Start Upload
              </button>
            ) : null}
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
