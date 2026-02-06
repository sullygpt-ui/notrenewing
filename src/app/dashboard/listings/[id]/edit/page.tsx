import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { EditListingForm } from './edit-form';
import type { Listing } from '@/types/database';

export const dynamic = 'force-dynamic';

interface EditListingPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditListingPage({ params }: EditListingPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // Fetch the listing, only if owned by this user
  const { data: listingData, error } = await supabase
    .from('listings')
    .select('*')
    .eq('id', id)
    .eq('seller_id', user.id)
    .single();

  if (error || !listingData) {
    notFound();
  }

  const listing = listingData as Listing;

  // Only allow editing certain statuses
  const editableStatuses = ['pending_payment', 'pending_verification', 'active'];
  if (!editableStatuses.includes(listing.status)) {
    redirect('/dashboard');
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <EditListingForm listing={listing} />
    </div>
  );
}
