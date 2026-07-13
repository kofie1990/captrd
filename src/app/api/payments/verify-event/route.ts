import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const { reference, eventData, isFreeTier } = await req.json();
    const authHeader = req.headers.get('Authorization');

    if (!authHeader) {
      return NextResponse.json({ error: 'Missing authorization' }, { status: 401 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Verify user securely from token
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''));

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid user' }, { status: 401 });
    }

    // Ensure the event data sets admin_id to this authenticated user
    if (eventData.admin_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized event owner' }, { status: 403 });
    }

    // If it's a paid tier, verify with Paystack
    if (!isFreeTier) {
      if (!reference) {
        return NextResponse.json({ error: 'Missing payment reference' }, { status: 400 });
      }

      const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      });

      const verifyData = await verifyRes.json();

      if (!verifyData.status || verifyData.data.status !== 'success') {
        return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
      }

      // Idempotency: Ensure we don't insert a duplicate if the webhook already fired
      const { data: existingEvent } = await supabaseAdmin
        .from('events')
        .select('id')
        .eq('payment_reference', reference)
        .maybeSingle();

      if (existingEvent) {
        return NextResponse.json({ success: true, data: existingEvent });
      }

      eventData.payment_reference = reference;
    }

    // Insert the event into Supabase using the admin client (bypasses RLS)
    const { data, error } = await supabaseAdmin
      .from('events')
      .insert([eventData])
      .select()
      .single();

    if (error) {
      console.error("Supabase Error:", error);
      return NextResponse.json({ error: 'Database insert failed' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });

  } catch (err: any) {
    console.error("API Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
