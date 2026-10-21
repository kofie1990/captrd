import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { reference, tier: reqTier } = body;
    const authHeader = req.headers.get('Authorization');

    if (!authHeader) {
      return NextResponse.json({ error: 'Missing authorization' }, { status: 401 });
    }

    if (!reference) {
      return NextResponse.json({ error: 'Missing payment reference' }, { status: 400 });
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

    // Verify payment with Paystack
    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    });

    const verifyData = await verifyRes.json();

    if (!verifyData.status || verifyData.data.status !== 'success') {
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
    }

    const paystackMetadata = verifyData.data?.metadata || {};
    const rawTier = paystackMetadata.tier || reqTier || 'starter';
    const tier = String(rawTier).toLowerCase() === 'pro' ? 'pro' : 'starter';

    // Safely update profile using the admin client (bypasses RLS)
    const { error } = await supabaseAdmin
      .from('profiles')
      .upsert({ 
        id: user.id, 
        is_studio_subscriber: true, 
        studio_tier: tier,
        studio_subscription_status: 'active',
        paystack_subscription_code: reference 
      });

    if (error) {
      console.error("Supabase Error:", error);
      return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error("API Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
