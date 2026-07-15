import Navigation from "@/components/Navigation";

export default function RefundPolicy() {
  const lastUpdated = "July 14, 2026";

  return (
    <main className="min-h-screen bg-black text-white flex flex-col relative selection:bg-white selection:text-black">
      <Navigation />
      
      <div className="flex-1 w-full max-w-4xl mx-auto px-6 py-32">
        <h1 className="font-serif text-5xl md:text-6xl tracking-tighter mb-4">Return & Refund Policy</h1>
        <p className="text-white/50 mb-16 font-mono text-sm uppercase tracking-widest">Last Updated: {lastUpdated}</p>

        <div className="space-y-8 text-lg">

          <h3 className="font-serif text-3xl text-white mt-16 mb-6">1. Digital Services</h3>
          <p className="text-white/80 leading-loose">
            Payments for premium gallery hosting, storage upgrades, or digital event passes are final and non-refundable once the event gallery has been activated or the event date has passed. If you experience technical issues preventing the use of your gallery, please contact support prior to the event.
          </p>

          <h3 className="font-serif text-3xl text-white mt-16 mb-6">2. Physical Goods (Photobooks and Prints)</h3>
          <p className="text-white/80 leading-loose">
            Because all physical photobooks and classic prints are custom-made using your specific photos, we cannot accept returns or offer refunds for "buyer's remorse" or user errors (e.g., uploading blurry photos, selecting the wrong images, or providing an incorrect shipping address).
          </p>

          <h3 className="font-serif text-3xl text-white mt-16 mb-6">3. Damaged or Defective Items</h3>
          <p className="text-white/80 leading-loose mb-4">
            We take pride in the craftsmanship of our physical products. If your photobook or prints arrive physically damaged, or if there is a clear manufacturing defect (e.g., binding failure, incorrect pages printed), you must contact us at support@captrd.com within 7 days of delivery.
          </p>
          <p className="text-white/80 leading-loose">
            Please include photographic evidence of the damage. Upon verification, captrd will, at our sole discretion, issue a replacement order at no additional cost to you.
          </p>
        </div>
      </div>
    </main>
  );
}
