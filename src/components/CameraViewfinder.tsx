"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { RefreshCcw, Check, X, Image as ImageIcon, Video as VideoIcon, Zap, ZapOff, Grid3x3, ZoomIn, ZoomOut, Loader2 } from "lucide-react";
import { getFilterClass, getCssFilter, getFilterBloom } from "@/lib/filters";
import { enhanceImage } from "@/lib/enhanceImage";

type Props = {
  eventId: string;
  guestName: string;
  filter: string;
  isRevealed?: boolean;
  onViewGallery?: () => void;
  latestPhotoUrl?: string;
  onPhotoTaken?: (url: string) => void;
  maxPhotos?: number;
  isEmbedded?: boolean;
};

export default function CameraViewfinder({ eventId, guestName, filter, isRevealed, onViewGallery, latestPhotoUrl, onPhotoTaken, maxPhotos = 15, isEmbedded = false }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Media state
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  
  const [uploading, setUploading] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  
  // Camera Controls State
  const [flash, setFlash] = useState(false);
  const [flashSupported, setFlashSupported] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [focusPoint, setFocusPoint] = useState<{x: number, y: number} | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [shutterFlash, setShutterFlash] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  
  // Zoom State
  const [zoom, setZoom] = useState(1);
  const [zoomRange, setZoomRange] = useState<{min: number, max: number}>({min: 1, max: 1});
  const [hwZoomSupported, setHwZoomSupported] = useState(false);
  const lastPinchDistance = useRef<number | null>(null);
  const viewfinderRef = useRef<HTMLDivElement>(null);
  
  const supabase = createClient();

  // Photo limits
  const [photosTaken, setPhotosTaken] = useState(0);

  // Recording State
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunks = useRef<Blob[]>([]);
  
  const [captureMode, setCaptureMode] = useState<"photo" | "video">("photo");
  const [recordingTime, setRecordingTime] = useState(10);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const count = parseInt(sessionStorage.getItem(`captr_count_${eventId}`) || "0");
    setPhotosTaken(count);
  }, [eventId]);

  // ─── Start / stop the camera stream ───────────────────────────────────
  const startCamera = useCallback(async () => {
    // Stop any existing stream first
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraReady(false);

    try {
      // Request the highest resolution the camera supports.
      // "ideal" tells the browser to pick the best match without failing.
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode,
          width: { ideal: facingMode === "environment" ? 4032 : 2560 },
          height: { ideal: facingMode === "environment" ? 3024 : 1920 },
          frameRate: { ideal: 30 },
        },
        audio: true,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // ─── Detect capabilities (flash, zoom) ──────────────────────────
      const track = stream.getVideoTracks()[0];
      if (track) {
        const caps = track.getCapabilities ? (track.getCapabilities() as any) : {};

        // Flash / torch
        if (caps.torch !== undefined) {
          setFlashSupported(true);
        } else {
          setFlashSupported(false);
        }

        // Zoom
        if (caps.zoom) {
          setHwZoomSupported(true);
          setZoomRange({ min: caps.zoom.min, max: Math.min(caps.zoom.max, 10) });
        } else {
          setHwZoomSupported(false);
          setZoomRange({ min: 1, max: 5 });
        }

        // Log actual resolution obtained
        const settings = track.getSettings();
        console.log(`[Captrd] Camera started: ${settings.width}×${settings.height} (${facingMode})`);
      }

      setCameraReady(true);
    } catch (e) {
      console.error("[Captrd] Camera start error:", e);
    }
  }, [facingMode]);

  // Start camera on mount & when facingMode changes
  useEffect(() => {
    // Only start camera if we're not previewing captured media
    if (!previewUrl && !videoSrc) {
      startCamera();
    }

    return () => {
      // Cleanup on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode]);

  // ─── Apply flash/torch constraint ─────────────────────────────────────
  useEffect(() => {
    if (!flashSupported || !streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (!track) return;

    track.applyConstraints({
      advanced: [{ torch: flash } as any]
    }).catch(e => console.error("[Captrd] Torch error:", e));
  }, [flash, flashSupported]);

  // ─── Apply hardware zoom ──────────────────────────────────────────────
  useEffect(() => {
    if (!hwZoomSupported || !streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (!track) return;

    track.applyConstraints({
      advanced: [{ zoom } as any]
    }).catch(e => console.error("[Captrd] Zoom error:", e));
  }, [zoom, hwZoomSupported]);

  // Reset zoom when switching cameras
  useEffect(() => {
    setZoom(1);
  }, [facingMode]);

  // ─── Tap-to-focus ─────────────────────────────────────────────────────
  const handleFocus = useCallback(async (e: React.PointerEvent<HTMLDivElement>) => {
    if (previewUrl || videoSrc) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    setFocusPoint({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setTimeout(() => setFocusPoint(null), 2000);

    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (!track || !track.getCapabilities) return;
    
    const capabilities = track.getCapabilities() as any;
    if (capabilities.focusMode && capabilities.pointsOfInterest) {
      try {
        const advancedConstraint: any = { focusMode: "continuous", pointsOfInterest: [{ x, y }] };
        // If device supports exposure targeting, adjust lighting automatically
        if (capabilities.exposureMode) {
          advancedConstraint.exposureMode = "continuous";
        }
        await track.applyConstraints({
          advanced: [advancedConstraint]
        });
      } catch (err) {
        console.error("[Captrd] Tap to focus not supported.", err);
      }
    }
  }, [previewUrl, videoSrc]);

  // ─── Pinch-to-zoom ────────────────────────────────────────────────────
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastPinchDistance.current = Math.hypot(dx, dy);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && lastPinchDistance.current !== null) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const distance = Math.hypot(dx, dy);
      const scale = distance / lastPinchDistance.current;
      
      setZoom(prev => {
        const next = prev * scale;
        return Math.min(Math.max(next, zoomRange.min), zoomRange.max);
      });
      lastPinchDistance.current = distance;
    }
  }, [zoomRange]);

  const handleTouchEnd = useCallback(() => {
    lastPinchDistance.current = null;
  }, []);

  // Canvas-based fallback capture at the video track's actual resolution
  const captureFromCanvas = useCallback(async (track: MediaStreamTrack): Promise<Blob> => {
    const video = videoRef.current;
    if (!video) throw new Error("Video element not available");

    // Use the track's real resolution, not the displayed size
    const settings = track.getSettings();
    let width = settings.width || video.videoWidth;
    let height = settings.height || video.videoHeight;

    // Limit resolution to prevent out-of-memory crashes on iOS Safari
    // which causes enhanceImage to fail and drop the CSS filter.
    const MAX_DIMENSION = 1920;
    if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
      const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d")!;

    ctx.drawImage(video, 0, 0, width, height);

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            console.log(`[Captrd] Canvas fallback: ${width}×${height}, ${(blob.size / 1024 / 1024).toFixed(2)} MB`);
            resolve(blob);
          } else {
            reject(new Error("Canvas toBlob returned null"));
          }
        },
        "image/jpeg",
        1.0
      );
    });
  }, []);

  // ─── Full-resolution photo capture ────────────────────────────────────
  const capturePhoto = useCallback(async () => {
    if (photosTaken >= maxPhotos) return;
    if (!streamRef.current) return;

    const track = streamRef.current.getVideoTracks()[0];
    if (!track) return;

    // Trigger shutter flash animation only if flash is enabled
    if (flash) {
      setShutterFlash(true);
      setTimeout(() => setShutterFlash(false), 150);
    }

    const isSelfie = facingMode === "user";

    try {
      // ALWAYS use canvas capture!
      // This prevents the native OS "shutter" flash and auto-exposure dimming
      // that ImageCapture.takePhoto() forces on iOS/Android, preserving exact lighting.
      let rawBlob = await captureFromCanvas(track);

      // Show instant raw preview (before processing)
      const rawUrl = URL.createObjectURL(rawBlob);
      setPreviewUrl(rawUrl);
      setCapturedBlob(rawBlob);

      // Single-pass: mirror (if selfie) + enhance — one canvas, minimal memory
      setEnhancing(true);
      try {
        const processed = await enhanceImage(rawBlob, { mirror: isSelfie, bloom: getFilterBloom(filter) });
        const processedUrl = URL.createObjectURL(processed);
        setPreviewUrl(prev => {
          if (prev) URL.revokeObjectURL(prev);
          return processedUrl;
        });
        setCapturedBlob(processed);
      } catch (enhErr) {
        console.warn("[Captrd] Processing failed, using raw capture:", enhErr);
      } finally {
        setEnhancing(false);
      }

    } catch (e) {
      console.error("[Captrd] Photo capture error:", e);
      // Last-resort fallback: try canvas capture
      try {
        const fallbackBlob = await captureFromCanvas(track);
        const processed = await enhanceImage(fallbackBlob, { mirror: isSelfie, cssFilter: getCssFilter(filter), bloom: getFilterBloom(filter) });
        const url = URL.createObjectURL(processed);
        setPreviewUrl(url);
        setCapturedBlob(processed);
      } catch (fallbackErr) {
        console.error("[Captrd] Fallback capture also failed:", fallbackErr);
      }
    }
  }, [photosTaken, maxPhotos, facingMode, filter, captureFromCanvas]);

  // ─── Video recording ──────────────────────────────────────────────────
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
      setRecording(false);
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    }
  }, []);

  const startRecording = useCallback(() => {
    if (photosTaken >= maxPhotos) return;
    if (!streamRef.current) return;
    
    setRecording(true);
    setRecordingTime(10);
    recordedChunks.current = [];
    
    // Use mp4 if supported, else webm
    const options = { mimeType: MediaRecorder.isTypeSupported('video/webm') ? 'video/webm' : 'video/mp4' };
    const mediaRecorder = new MediaRecorder(streamRef.current, options);
    
    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) recordedChunks.current.push(e.data);
    };
    
    mediaRecorder.onstop = () => {
      const type = options.mimeType;
      const blob = new Blob(recordedChunks.current, { type });
      setVideoBlob(blob);
      setVideoSrc(URL.createObjectURL(blob));
    };
    
    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start(); // collect as one chunk to prevent glitches
    
    let timeLeft = 10;
    recordingIntervalRef.current = setInterval(() => {
      timeLeft -= 1;
      setRecordingTime(timeLeft);
      if (timeLeft <= 0) {
        stopRecording();
      }
    }, 1000);
  }, [photosTaken, maxPhotos, stopRecording]);

  const handleCaptureClick = () => {
    if (captureMode === "photo") {
      capturePhoto();
    } else {
      if (recording) stopRecording();
      else startRecording();
    }
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === "user" ? "environment" : "user");
  };

  const retake = useCallback(() => {
    // Revoke preview URL to free memory
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (videoSrc) URL.revokeObjectURL(videoSrc);

    setPreviewUrl(null);
    setCapturedBlob(null);
    setVideoBlob(null);
    setVideoSrc(null);

    // Restart camera stream
    startCamera();
  }, [previewUrl, videoSrc, startCamera]);

  const upload = async () => {
    if (!capturedBlob && !videoBlob) return;
    setUploading(true);
    try {
      let fileToUpload: Blob;
      let ext: string;
      let mediaType = 'image';

      if (videoBlob) {
        fileToUpload = videoBlob;
        ext = 'mp4';
        mediaType = 'video';
      } else {
        // Upload the enhanced full-resolution blob directly — no re-encoding
        fileToUpload = capturedBlob!;
        ext = 'jpg';
      }
      
      const fileName = `${eventId}/${Date.now()}-${guestName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${ext}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("event-photos")
        .upload(fileName, fileToUpload, { contentType: videoBlob ? "video/mp4" : "image/jpeg" });
        
      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from("event-photos").getPublicUrl(fileName);
      
      const { error: dbError } = await supabase.from("photos").insert([{
        event_id: eventId,
        guest_name: guestName,
        storage_path: publicUrlData.publicUrl,
        media_type: mediaType
      }]);

      if (dbError) throw dbError;

      // Update limits
      const newCount = photosTaken + 1;
      setPhotosTaken(newCount);
      sessionStorage.setItem(`captr_count_${eventId}`, newCount.toString());

      if (onPhotoTaken) {
        onPhotoTaken(publicUrlData.publicUrl);
      }

      retake();
    } catch (e) {
      console.error(e);
      alert("Failed to upload media. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const isMediaCaptured = previewUrl || videoSrc;
  const isLimitReached = photosTaken >= maxPhotos;

  return (
    <div className={`${isEmbedded ? 'absolute' : 'fixed'} inset-0 bg-black z-[100] flex flex-col justify-between overflow-hidden select-none`}>
      {/* Top Bar */}
      <div className="absolute top-0 inset-x-0 p-6 flex justify-between items-center z-20 bg-gradient-to-b from-black/60 to-transparent pb-16">
        <div className="flex flex-col">
          <span className="font-mono text-xs uppercase tracking-widest text-white/70">{guestName}&apos;s Roll</span>
          <span className="font-mono text-[9px] uppercase tracking-widest text-white/40">{photosTaken} / {maxPhotos} EXPOSURES</span>
        </div>
        <div className="flex gap-2">
          {flashSupported && !isMediaCaptured && (
            <button onClick={() => setFlash(!flash)} className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-colors">
              {flash ? <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400" /> : <ZapOff className="w-5 h-5" />}
            </button>
          )}
          {!isMediaCaptured && (
            <button onClick={() => setShowGrid(!showGrid)} className={`p-3 backdrop-blur-md rounded-full text-white transition-colors ${showGrid ? 'bg-white/30' : 'bg-white/10 hover:bg-white/20'}`}>
              <Grid3x3 className="w-5 h-5" />
            </button>
          )}
          <button onClick={toggleCamera} className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-colors">
            <RefreshCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Viewfinder */}
      <div 
        ref={viewfinderRef}
        className="flex-1 relative flex items-center justify-center bg-[#111] overflow-hidden cursor-crosshair"
        onPointerDown={handleFocus}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Shutter flash overlay */}
        {shutterFlash && (
          <div className="absolute inset-0 bg-white z-50 animate-[fadeOut_150ms_ease-out_forwards]" />
        )}

        {!isMediaCaptured ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              ...((!hwZoomSupported && zoom > 1) ? { transform: `scale(${zoom})`, transformOrigin: 'center center' } : {}),
              willChange: 'transform',
            }}
            className={`w-full h-full object-cover ${facingMode === "user" ? "scale-x-[-1]" : ""} ${getFilterClass(filter)}`}
          />
        ) : (
          <>
            {previewUrl && (
              <div className="relative w-full h-full">
                <img src={previewUrl} className={`w-full h-full object-cover ${getFilterClass(filter)}`} alt="Preview" />
                {enhancing && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/60 backdrop-blur-md text-white font-mono text-[10px] uppercase tracking-widest px-4 py-2 rounded-full z-30">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Enhancing</span>
                  </div>
                )}
              </div>
            )}
            {videoSrc && <video src={videoSrc} className={`w-full h-full object-cover ${getFilterClass(filter)}`} loop autoPlay playsInline muted />}
          </>
        )}

        {/* Viewfinder UI Overlay */}
        <div className="absolute inset-0 pointer-events-none flex flex-col">
          {showGrid && !isMediaCaptured && (
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-30">
              <div className="border-b border-r border-white" />
              <div className="border-b border-r border-white" />
              <div className="border-b border-white" />
              
              <div className="border-b border-r border-white" />
              <div className="border-b border-r border-white" />
              <div className="border-b border-white" />
              
              <div className="border-r border-white" />
              <div className="border-r border-white" />
              <div />
            </div>
          )}
          
          <div className="absolute inset-0 border-[1px] border-white/20 m-4 sm:m-8 rounded-[2rem]">
            <div className="absolute top-8 left-8 w-8 h-8 border-t-2 border-l-2 border-white/50 rounded-tl-lg" />
            <div className="absolute top-8 right-8 w-8 h-8 border-t-2 border-r-2 border-white/50 rounded-tr-lg" />
            <div className="absolute bottom-8 left-8 w-8 h-8 border-b-2 border-l-2 border-white/50 rounded-bl-lg" />
            <div className="absolute bottom-8 right-8 w-8 h-8 border-b-2 border-r-2 border-white/50 rounded-br-lg" />
            
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center opacity-30">
              <div className={`w-16 h-16 border border-white rounded-full transition-all duration-300 ${recording ? 'scale-125 border-red-500' : ''}`} />
              <div className={`w-1 h-1 bg-white rounded-full absolute ${recording ? 'bg-red-500' : ''}`} />
            </div>
          </div>
          
          {focusPoint && (
            <div 
              className="absolute w-16 h-16 border-[1.5px] border-yellow-400 opacity-80 pointer-events-none transition-all duration-300 animate-pulse flex items-center justify-center"
              style={{ left: focusPoint.x - 32, top: focusPoint.y - 32 }}
            >
              <div className="w-1 h-1 bg-yellow-400 rounded-full" />
            </div>
          )}
        </div>

        {recording && (
          <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-red-500 text-white font-mono text-xs px-4 py-2 rounded-full flex items-center gap-2 shadow-lg z-30">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" /> 
            <span>00:{recordingTime.toString().padStart(2, '0')}</span>
          </div>
        )}
        
        {isLimitReached && !isMediaCaptured && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/80 backdrop-blur-md text-white font-serif text-2xl px-8 py-6 rounded-[2rem] text-center border border-white/10 z-30">
            Roll Complete <br/>
            <span className="font-mono text-[10px] uppercase tracking-widest opacity-60">You&apos;ve reached your limit</span>
          </div>
        )}

        {/* Zoom Slider */}
        {!isMediaCaptured && zoomRange.max > 1 && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 z-30">
            <ZoomIn className="w-4 h-4 text-white/60" />
            <input
              type="range"
              min={zoomRange.min}
              max={zoomRange.max}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="h-32 appearance-none bg-transparent cursor-pointer [writing-mode:vertical-lr] [direction:rtl] [&::-webkit-slider-runnable-track]:w-1 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-white/20 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg"
            />
            <ZoomOut className="w-4 h-4 text-white/60" />
            {zoom > 1 && (
              <span className="font-mono text-[9px] text-white/60 mt-1">{zoom.toFixed(1)}x</span>
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="h-40 bg-black flex items-center justify-between px-8 md:px-12 z-20 pb-8 relative">
        {/* Left: Gallery Thumbnail */}
        <div className="w-14 h-14 md:w-16 md:h-16 relative">
          {onViewGallery && (
            <button 
              onClick={() => isRevealed ? onViewGallery() : null}
              className={`w-full h-full rounded-xl overflow-hidden border-2 border-white/20 transition-transform group relative bg-[#222] ${isRevealed ? 'active:scale-95 cursor-pointer' : 'cursor-default'}`}
            >
               {latestPhotoUrl ? (
                 <img src={latestPhotoUrl} alt="Gallery Preview" className={`w-full h-full object-cover ${getFilterClass(filter)} ${isRevealed ? 'group-hover:scale-110' : ''} transition-transform`} />
               ) : (
                 <div className="w-full h-full flex items-center justify-center group-hover:bg-[#333] transition-colors">
                    <ImageIcon className="w-6 h-6 opacity-40" />
                 </div>
               )}
            </button>
          )}
        </div>

        {/* Center: Capture Button & Mode Toggle */}
        {!isMediaCaptured ? (
          <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
            {/* Mode Switcher */}
            {!recording && (
              <div className="absolute -top-14 flex bg-white/10 backdrop-blur-md rounded-full p-1 whitespace-nowrap shadow-xl border border-white/10">
                <button 
                  onClick={() => setCaptureMode("photo")}
                  className={`px-5 py-1.5 rounded-full font-mono text-[10px] uppercase tracking-widest transition-all duration-300 ${captureMode === "photo" ? "bg-white text-black shadow-md" : "text-white/60 hover:text-white"}`}
                >
                  Photo
                </button>
                <button 
                  onClick={() => setCaptureMode("video")}
                  className={`px-5 py-1.5 rounded-full font-mono text-[10px] uppercase tracking-widest transition-all duration-300 ${captureMode === "video" ? "bg-white text-black shadow-md" : "text-white/60 hover:text-white"}`}
                >
                  Video
                </button>
              </div>
            )}
            
            <button 
              onClick={handleCaptureClick}
              disabled={isLimitReached}
              className="w-20 h-20 md:w-24 md:h-24 rounded-full border-[4px] border-white/30 flex items-center justify-center p-1 md:p-1.5 active:scale-95 transition-all disabled:opacity-30 disabled:active:scale-100 touch-none group shadow-2xl"
            >
              <div className={`w-full h-full rounded-full transition-all duration-300 ${captureMode === 'video' ? 'bg-red-500' : 'bg-white'} ${recording ? 'scale-50 rounded-lg' : 'group-active:scale-90'}`} />
            </button>
          </div>
        ) : (
          <div className="absolute left-1/2 -translate-x-1/2 flex gap-6 md:gap-8">
            <button onClick={retake} disabled={uploading} className="p-4 md:p-5 bg-white/10 backdrop-blur-md rounded-full text-white disabled:opacity-50 hover:bg-red-500/80 transition-colors shadow-lg">
              <X className="w-6 h-6 md:w-8 md:h-8" />
            </button>
            <button onClick={upload} disabled={uploading} className="p-4 md:p-5 bg-white text-black rounded-full disabled:opacity-50 flex items-center justify-center hover:bg-gray-200 transition-colors shadow-xl">
              {uploading ? <span className="font-mono text-[10px] md:text-xs tracking-widest px-2 font-bold">SAVING</span> : <Check className="w-6 h-6 md:w-8 md:h-8" />}
            </button>
          </div>
        )}

        {/* Right: Empty space for balance */}
        <div className="w-14 h-14 md:w-16 md:h-16" />
      </div>
    </div>
  );
}
