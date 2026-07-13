import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-paystack-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // Verify the request actually came from Paystack
    const hash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
      .update(rawBody)
      .digest('hex');

    if (hash !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);

    if (payload.event === 'charge.success') {
      const data = payload.data;
      const metadata = data.metadata;
      
      if (!metadata) {
        return NextResponse.json({ success: true, message: 'No metadata, ignoring' });
      }

      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      // Handle Event Creation Fallback
      if (metadata.action === 'create_event') {
        const eventData = metadata.eventData;
        eventData.payment_reference = data.reference;

        // Idempotency: Check if the frontend already created this event
        const { data: existingEvent } = await supabaseAdmin
          .from('events')
          .select('id')
          .eq('payment_reference', data.reference)
          .maybeSingle();

        if (existingEvent) {
          return NextResponse.json({ success: true, message: 'Event already processed' });
        }

        const { error } = await supabaseAdmin
          .from('events')
          .insert([eventData]);

        if (error) {
          console.error("Supabase Error (Webhook - Event):", error);
          return NextResponse.json({ error: 'Database insert failed' }, { status: 500 });
        }
      } 
      // Handle Studio Subscription Fallback
      else if (metadata.action === 'studio_subscription') {
        const userId = metadata.userId;

        if (!userId) {
          return NextResponse.json({ error: 'Missing userId in metadata' }, { status: 400 });
        }

        const { error } = await supabaseAdmin
          .from('profiles')
          .upsert({ 
            id: userId, 
            is_studio_subscriber: true, 
            paystack_subscription_code: data.reference 
          });

        if (error) {
          console.error("Supabase Error (Webhook - Studio):", error);
          return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
        }
      }
    }

    // Always return a 200 to acknowledge receipt so Paystack stops retrying
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Webhook Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
