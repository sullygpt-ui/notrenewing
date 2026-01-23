import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import Stripe from 'stripe';
import { sendEmail } from '@/lib/email';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

// Transfer deadline in hours
const TRANSFER_DEADLINE_HOURS = 72;

// This endpoint should be called by a cron job (e.g., Vercel Cron, GitHub Actions)
// Verify the request is from a trusted source using CRON_SECRET
export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();
    const now = new Date();
    const deadlineTime = new Date(now.getTime() - TRANSFER_DEADLINE_HOURS * 60 * 60 * 1000);

    // Find purchases that are overdue for transfer
    const { data: overduePurchases, error: fetchError } = await supabase
      .from('purchases')
      .select(`
        *,
        listing:listings(
          id,
          domain_name,
          seller_id,
          seller:users!seller_id(email, name)
        ),
        buyer:users!buyer_id(email, name)
      `)
      .eq('transfer_status', 'pending')
      .lt('created_at', deadlineTime.toISOString());

    if (fetchError) {
      console.error('Error fetching overdue purchases:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch overdue purchases' }, { status: 500 });
    }

    if (!overduePurchases || overduePurchases.length === 0) {
      return NextResponse.json({ message: 'No overdue transfers found', processed: 0 });
    }

    let processedCount = 0;
    const errors: string[] = [];

    for (const purchase of overduePurchases) {
      try {
        // Process refund if we have a Stripe payment intent
        if (purchase.stripe_payment_intent_id) {
          await stripe.refunds.create({
            payment_intent: purchase.stripe_payment_intent_id,
            reason: 'requested_by_customer',
          });
        }

        // Update purchase status to refunded
        await supabase
          .from('purchases')
          .update({
            transfer_status: 'refunded',
            refunded_at: new Date().toISOString(),
            refund_reason: 'Transfer deadline exceeded',
          })
          .eq('id', purchase.id);

        // Re-activate the listing
        await supabase
          .from('listings')
          .update({ status: 'active' })
          .eq('id', purchase.listing_id);

        // Create a dispute record for tracking
        await supabase
          .from('disputes')
          .insert({
            purchase_id: purchase.id,
            opened_by: purchase.buyer_id,
            reason: 'Transfer deadline exceeded - automatic refund',
            status: 'resolved',
            resolved_at: new Date().toISOString(),
            resolution: 'refund',
          });

        // Send email notifications
        const listing = purchase.listing as any;

        // Notify buyer
        if (purchase.buyer?.email) {
          await sendEmail({
            to: purchase.buyer.email,
            template: 'transfer_deadline_refund_buyer',
            data: {
              buyerName: purchase.buyer.name || 'Buyer',
              domainName: listing.domain_name,
              refundAmount: '$99.00',
            },
          });
        }

        // Notify seller
        if (listing.seller?.email) {
          await sendEmail({
            to: listing.seller.email,
            template: 'transfer_deadline_refund_seller',
            data: {
              sellerName: listing.seller.name || 'Seller',
              domainName: listing.domain_name,
            },
          });
        }

        processedCount++;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        errors.push(`Purchase ${purchase.id}: ${errorMsg}`);
        console.error(`Error processing purchase ${purchase.id}:`, err);
      }
    }

    return NextResponse.json({
      message: 'Transfer deadline enforcement completed',
      processed: processedCount,
      total: overduePurchases.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Transfer deadline cron error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
