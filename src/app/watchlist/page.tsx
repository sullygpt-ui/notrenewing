import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { DomainGrid } from '@/components/domain';
import { Button } from '@/components/ui';
import type { Listing } from '@/types/database';

export const dynamic = 'force-dynamic';

export default async function WatchlistPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login?redirect=/watchlist');
  }

  const { data: watchlistData } = await supabase
    .from('watchlist')
    .select(`
      id,
      created_at,
      listing:listings (*)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const watchlist = watchlistData || [];
  const listings = watchlist
    .map((item: any) => item.listing)
    .filter((listing: Listing | null) => listing && listing.status === 'active') as Listing[];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Watchlist</h1>
        <p className="text-gray-500 mt-1">Domains you're interested in</p>
      </div>

      {listings.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">You haven't saved any domains yet.</p>
          <Link href="/browse">
            <Button>Browse Domains</Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <p className="text-sm text-gray-500">
              {listings.length} domain{listings.length !== 1 ? 's' : ''} saved
            </p>
          </div>
          <DomainGrid listings={listings} />
        </>
      )}
    </div>
  );
}
