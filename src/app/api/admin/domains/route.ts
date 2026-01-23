import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { listingId, action, value } = body;

    if (!listingId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = await createClient();
    const serviceClient = await createServiceClient();

    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await serviceClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Perform action
    let updateData: Record<string, any> = {};

    switch (action) {
      case 'feature':
        updateData = { admin_featured: true };
        break;
      case 'unfeature':
        updateData = { admin_featured: false };
        break;
      case 'hide':
        updateData = { admin_hidden: true };
        break;
      case 'unhide':
        updateData = { admin_hidden: false };
        break;
      case 'remove':
        updateData = { status: 'removed' };
        break;
      case 'staff_pick':
        updateData = { staff_pick: true };
        break;
      case 'unstaff_pick':
        updateData = { staff_pick: false };
        break;
      case 'set_status':
        if (value && ['pending_payment', 'pending_verification', 'active', 'paused', 'sold', 'expired', 'removed'].includes(value)) {
          updateData = { status: value };
          // If activating, set listed_at if not already set
          if (value === 'active') {
            updateData.listed_at = new Date().toISOString();
          }
        } else {
          return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }
        break;
      case 'update_fields':
        if (value && typeof value === 'object') {
          const allowedFields = ['registrar', 'expiration_date', 'ai_score', 'ai_tier', 'domain_age_months'];
          for (const key of Object.keys(value)) {
            if (allowedFields.includes(key)) {
              updateData[key] = value[key];
            }
          }
        } else {
          return NextResponse.json({ error: 'Invalid update data' }, { status: 400 });
        }
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const { error } = await serviceClient
      .from('listings')
      .update(updateData)
      .eq('id', listingId);

    if (error) {
      console.error('Failed to update listing:', error);
      return NextResponse.json({ error: 'Failed to update listing' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin action error:', error);
    return NextResponse.json({ error: 'Action failed' }, { status: 500 });
  }
}
