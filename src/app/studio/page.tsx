import Navigation from "@/components/Navigation";
import { Upload, Download, Sparkles } from "lucide-react";

export default function StudioPage() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col relative selection:bg-foreground selection:text-background pb-24">
      <Navigation />
      
      <div className="flex-1 flex flex-col items-center justify-center pt-32 px-6 md:px-16 text-center max-w-5xl mx-auto z-10 w-full">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-foreground/20 bg-foreground/5 mb-8">
          <Sparkles className="w-4 h-4" />
          <span className="font-mono text-[10px] uppercase tracking-widest font-bold">For Photographers</span>
        </div>
        
        <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl tracking-tighter mb-8">
          The <span className="italic font-light opacity-80">Studio</span>
        </h1>
        
        <p className="text-lg md:text-xl text-foreground/60 leading-relaxed font-light mb-16 max-w-2xl mx-auto">
          A dedicated subscription platform for professional photographers to upload their high-resolution event galleries, making it effortless for guests to view and download their memories.
        </p>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-10 text-left w-full mt-8 max-w-4xl mx-auto">
          
          <div className="glass p-10 rounded-[2.5rem] flex flex-col group hover:bg-foreground/5 transition-colors duration-500">
            <div className="w-16 h-16 rounded-full border border-foreground/20 flex items-center justify-center mb-8 group-hover:bg-foreground group-hover:text-background transition-colors duration-500">
              <Upload className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-3xl mb-4">Upload High-Res</h3>
            <p className="text-sm opacity-60 leading-relaxed">
              Say goodbye to compressed images. Upload your pristine, high-resolution edits directly to Captrd Studio. We preserve the quality of your work so it looks exactly as you intended.
            </p>
          </div>
          
          <div className="glass p-10 rounded-[2.5rem] flex flex-col group hover:bg-foreground/5 transition-colors duration-500 md:translate-y-8">
            <div className="w-16 h-16 rounded-full border border-foreground/20 flex items-center justify-center mb-8 group-hover:bg-foreground group-hover:text-background transition-colors duration-500">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-3xl mb-4">Easy Downloads</h3>
            <p className="text-sm opacity-60 leading-relaxed">
              Users and event guests can easily access the gallery and download the high-resolution pictures straight to their devices without jumping through hoops or creating complex accounts.
            </p>
          </div>
          
        </div>

        <div className="mt-32 max-w-xl mx-auto flex flex-col items-center">
          <h3 className="font-serif text-3xl mb-4">Start your Studio</h3>
          <p className="text-sm opacity-60 mb-8 text-center">
            Join Captrd Studio for $29/month to get unlimited high-resolution uploads and easy client delivery.
          </p>
          <button className="px-10 py-5 bg-foreground text-background rounded-full font-medium tracking-widest text-sm uppercase hover:opacity-90 transition-opacity duration-300">
            Subscribe Now
          </button>
        </div>
      </div>
    </main>
  );
}
