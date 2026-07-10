import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Navigation from "@/components/Navigation";
import GalleryClient from "@/components/studio/GalleryClient";

// Use Next.js 15+ promise based params
export default async function PublicGalleryPage({ 
  params 
}: { 
  params: Promise<{ businessSlug: string; eventSlug: string }> 
}) {
  const unwrappedParams = await params;
  const supabase = await createClient();

  // 1. Fetch Studio by Slug
  const { data: studio, error: studioError } = await supabase
    .from("studios")
    .select("id, business_name")
    .eq("slug", unwrappedParams.businessSlug)
    .single();

  if (studioError || !studio) {
    notFound();
  }

  // 2. Fetch Event by Slug and Studio ID
  const { data: event, error: eventError } = await supabase
    .from("studio_events")
    .select("id, name, created_at, cover_image_url")
    .eq("studio_id", studio.id)
    .eq("slug", unwrappedParams.eventSlug)
    .single();

  if (eventError || !event) {
    notFound();
  }

  // 3. Fetch Photos
  const { data: photos, error: photosError } = await supabase
    .from("studio_photos")
    .select("id, public_url")
    .eq("event_id", event.id)
    .order("created_at", { ascending: false });

  if (photosError) {
    console.error("Error fetching photos:", photosError);
  }

  const validPhotos = photos || [];

  return <GalleryClient studio={studio} event={event} photos={validPhotos} />;
}
