import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { createCheckoutSession } from '@/lib/stripe';

export async function GET() {
  const errors: string[] = [];
  const info: Record<string, any> = {};

  // Check env vars
  info.hasStripeKey = !!process.env.STRIPE_SECRET_KEY;
  info.stripeKeyPrefix = process.env.STRIPE_SECRET_KEY?.substring(0, 10);
  info.appUrl = process.env.NEXT_PUBLIC_APP_URL;

  // Test Supabase
  try {
    const supabase = await createServiceClient();
    const { data, error } = await supabase
      .from('listings')
      .select('id, domain_name')
      .eq('domain_name', 'stripe-test-12345.com')
      .single();
    
    if (error) {
      errors.push(`Supabase error: ${error.message}`);
    } else {
      info.listing = data;
    }
  } catch (e: any) {
    errors.push(`Supabase exception: ${e.message}`);
  }

  // Test Stripe
  try {
    const session = await createCheckoutSession({
      listingId: 'test-123',
      domainName: 'test.com',
      buyerEmail: 'test@test.com',
      successUrl: 'https://notrenewing.com/success',
      cancelUrl: 'https://notrenewing.com/cancel',
    });
    info.stripeSessionId = session.id;
    info.stripeUrl = session.url;
  } catch (e: any) {
    errors.push(`Stripe exception: ${e.message}`);
  }

  return NextResponse.json({ info, errors });
}
