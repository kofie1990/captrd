import Navigation from "@/components/Navigation";

export default function TermsOfService() {
  const lastUpdated = "July 14, 2026"; // using current date or placeholder

  return (
    <main className="min-h-screen bg-black text-white flex flex-col relative selection:bg-white selection:text-black">
      <Navigation />
      
      <div className="flex-1 w-full max-w-4xl mx-auto px-6 py-32">
        <h1 className="font-serif text-5xl md:text-6xl tracking-tighter mb-4">Terms of Service</h1>
        <p className="text-white/50 mb-16 font-mono text-sm uppercase tracking-widest">Last Updated: {lastUpdated}</p>

        <div className="space-y-8 text-lg">
          <p className="text-white/80 leading-loose">
            Welcome to captrd. These Terms of Service govern your use of the captrd mobile application, website, and related services (collectively, the "Service"). By accessing or using the Service, you agree to be bound by these terms.
          </p>

          <h3 className="font-serif text-3xl text-white mt-16 mb-6">1. Description of Service</h3>
          <p className="text-white/80 leading-loose">
            captrd provides a platform for hosting shared digital camera rolls for small get-togethers, parties, and high-end events. The Service allows event hosts to create digital galleries and allows guests to collaboratively upload, view, and share photos. captrd also offers physical printing services, allowing users to purchase photobooks and classic prints of their digital galleries.
          </p>

          <h3 className="font-serif text-3xl text-white mt-16 mb-6">2. User Accounts and Responsibilities</h3>
          <p className="text-white/80 leading-loose">
            To create an event or purchase goods, you must register for an account. You are responsible for maintaining the confidentiality of your account credentials. Event hosts are responsible for managing their galleries and have the authority to moderate or remove content uploaded by their guests.
          </p>

          <h3 className="font-serif text-3xl text-white mt-16 mb-6">3. User-Generated Content</h3>
          <p className="text-white/80 leading-loose">
            You retain all ownership rights to the photos you upload to captrd. By uploading content, you grant captrd a worldwide, non-exclusive, royalty-free license to host, store, display, and reproduce your photos strictly for the purpose of providing the Service (including displaying them in the digital gallery and printing them for physical photobook orders).
          </p>

          <h3 className="font-serif text-3xl text-white mt-16 mb-6">4. Prohibited Conduct</h3>
          <p className="text-white/80 leading-loose mb-4">
            You agree not to upload content that is:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-white/80 leading-loose mb-6">
            <li>Illegal, non-consensual, or violates the privacy rights of others.</li>
            <li>Harassing, abusive, or explicitly offensive.</li>
          </ul>
          <p className="text-white/80 leading-loose">
            captrd reserves the right to terminate accounts or delete galleries that violate these terms without prior notice.
          </p>

          <h3 className="font-serif text-3xl text-white mt-16 mb-6">5. Payments and Billing</h3>
          <p className="text-white/80 leading-loose">
            All payments for digital premium passes and physical goods are processed securely through our third-party payment provider. Prices for digital services and physical prints are subject to change. By providing payment information, you authorize our payment processor to charge the applicable fees.
          </p>

          <h3 className="font-serif text-3xl text-white mt-16 mb-6">6. Physical Goods and Delivery</h3>
          <p className="text-white/80 leading-loose">
            When ordering physical photobooks or prints, delivery times are estimates and not guaranteed. captrd relies on third-party printing partners and dispatch riders for fulfillment and delivery. Title and risk of loss for physical items pass to you upon delivery to the carrier.
          </p>

          <h3 className="font-serif text-3xl text-white mt-16 mb-6">7. Limitation of Liability</h3>
          <p className="text-white/80 leading-loose">
            captrd is provided "as is." We are not liable for lost data, deleted photos, or service interruptions. It is the user's responsibility to download and back up their final galleries.
          </p>
        </div>
      </div>
    </main>
  );
}
