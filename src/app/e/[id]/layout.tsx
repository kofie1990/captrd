import { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const eventId = params.id;
  
  let query = supabase.from("events").select("*");
  if (eventId.length === 36) {
    query = query.eq("id", eventId);
  } else {
    query = query.eq("short_code", eventId);
  }

  const { data } = await query.single();

  if (!data) {
    return {
      title: 'Event Not Found | Captrd',
    };
  }

  const defaultImage = "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=800&auto=format&fit=crop";
  const imageUrl = data.cover_photo_url || defaultImage;
  const description = data.invite_details || 'Join my film roll to capture and share memories!';

  return {
    title: `${data.title} | Captrd`,
    description: description,
    openGraph: {
      title: data.title,
      description: description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: data.title,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: data.title,
      description: description,
      images: [imageUrl],
    },
  };
}

export default function EventLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
