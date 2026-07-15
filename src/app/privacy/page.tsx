import Navigation from "@/components/Navigation";

export default function PrivacyPolicy() {
  const lastUpdated = "July 14, 2026";

  return (
    <main className="min-h-screen bg-black text-white flex flex-col relative selection:bg-white selection:text-black">
      <Navigation />
      
      <div className="flex-1 w-full max-w-4xl mx-auto px-6 py-32">
        <h1 className="font-serif text-5xl md:text-6xl tracking-tighter mb-4">Privacy Policy</h1>
        <p className="text-white/50 mb-16 font-mono text-sm uppercase tracking-widest">Last Updated: {lastUpdated}</p>

        <div className="space-y-8 text-lg">
          <p className="text-white/80 leading-loose">
            This Privacy Policy explains how captrd collects, uses, and protects your personal information when you use our digital gallery and printing services.
          </p>

          <h3 className="font-serif text-3xl text-white mt-16 mb-6">1. Information We Collect</h3>
          <ul className="list-disc pl-6 space-y-2 text-white/80 leading-loose mb-6">
            <li><strong className="text-white">Account Information:</strong> Name, email address, and account credentials when you register as a host.</li>
            <li><strong className="text-white">Event Data:</strong> Event titles, dates, and the digital media (photos) uploaded by hosts and guests.</li>
            <li><strong className="text-white">Transaction Data:</strong> Billing address, shipping address, and order details when you purchase premium features or physical prints. (Note: captrd does not store raw credit card numbers; these are handled securely by our payment processor).</li>
            <li><strong className="text-white">Usage Data:</strong> Device information, app interactions, and crash reports to improve platform stability.</li>
          </ul>

          <h3 className="font-serif text-3xl text-white mt-16 mb-6">2. How We Use Your Information</h3>
          <ul className="list-disc pl-6 space-y-2 text-white/80 leading-loose mb-6">
            <li>To create and manage your event galleries.</li>
            <li>To process transactions and deliver physical photobooks or prints.</li>
            <li>To send essential service communications, such as order confirmations and gallery access links.</li>
            <li>To maintain the security and integrity of the platform.</li>
          </ul>

          <h3 className="font-serif text-3xl text-white mt-16 mb-6">3. How We Share Your Information</h3>
          <p className="text-white/80 leading-loose mb-4">
            We do not sell your personal data. We only share information with trusted third parties necessary to operate the Service:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-white/80 leading-loose mb-6">
            <li><strong className="text-white">Payment Processors:</strong> To securely handle your transactions.</li>
            <li><strong className="text-white">Printing Partners:</strong> We share specific high-resolution photos and shipping addresses with our printing houses solely to fulfill your physical orders.</li>
            <li><strong className="text-white">Delivery Services:</strong> We provide your name, phone number, and address to dispatch riders to deliver your physical goods.</li>
          </ul>

          <h3 className="font-serif text-3xl text-white mt-16 mb-6">4. Data Retention</h3>
          <p className="text-white/80 leading-loose">
            We store event galleries and photos for as long as your account is active or as dictated by the specific tier of service purchased by the event host. You may request account deletion and the removal of your photos at any time by contacting our support team.
          </p>
        </div>
      </div>
    </main>
  );
}
