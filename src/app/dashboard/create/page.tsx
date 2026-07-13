"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Navigation from "@/components/Navigation";
import dynamic from "next/dynamic";

const CreateEventWizard = dynamic(() => import("@/components/CreateEventWizard"), { ssr: false });

export default function CreateEventPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = "/login";
        return;
      }
      setUserId(session.user.id);
      setUserEmail(session.user.email || null);
      setLoading(false);
    };

    fetchUser();
  }, [supabase]);

  const handleEventCreated = (newEvent: any) => {
    // Navigate back to the dashboard when event is successfully created
    router.push("/dashboard");
  };

  if (loading) return null;

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col relative pt-24 px-6 md:px-16 pb-20">
      <Navigation />

      <div className="w-full max-w-[800px] mx-auto mt-12">
        <a 
          href="/dashboard"
          className="inline-block mb-8 font-mono text-xs uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity"
        >
          &larr; Back to Dashboard
        </a>
        
        <CreateEventWizard userId={userId || ""} userEmail={userEmail || ""} onEventCreated={handleEventCreated} />
      </div>
    </main>
  );
}
