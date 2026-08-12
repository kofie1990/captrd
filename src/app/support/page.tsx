import Navigation from "@/components/Navigation";

export default function Support() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col relative selection:bg-white selection:text-black">
      <Navigation />
      
      <div className="flex-1 w-full max-w-4xl mx-auto px-6 py-32">
        <h1 className="font-serif text-5xl md:text-6xl tracking-tighter mb-4">Support</h1>
        <p className="text-white/50 mb-16 font-mono text-sm uppercase tracking-widest">How can we help?</p>

        <div className="space-y-8 text-lg">
          <p className="text-white/80 leading-loose">
            If you need help with captrd, have questions about your account, or want to report an issue, we're here to assist you.
          </p>

          <h3 className="font-serif text-3xl text-white mt-16 mb-6">Contact Us</h3>
          <p className="text-white/80 leading-loose">
            The best way to reach us is via email. Please send your inquiries to:
          </p>
          <p className="text-white/80 leading-loose font-mono mt-4">
            kuofien@gmail.com
          </p>
          
          <h3 className="font-serif text-3xl text-white mt-16 mb-6">Frequently Asked Questions</h3>
          
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-white/90 mb-2">How do I delete my account?</h4>
              <p className="text-white/80 leading-loose">
                You can delete your account directly inside the app by navigating to the Profile tab. Alternatively, you can request account deletion by emailing us from the address associated with your account.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white/90 mb-2">Where is my physical print order?</h4>
              <p className="text-white/80 leading-loose">
                Print orders typically take a few days to process and ship. If you haven't received tracking information within a week, please reach out to support.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white/90 mb-2">How do I report inappropriate content?</h4>
              <p className="text-white/80 leading-loose">
                You can report inappropriate content directly in the app by tapping the yellow report icon located on every image. Alternatively, if you encounter content that violates our Terms of Service, you can email us immediately with a link to the gallery and a description of the issue.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
