import { createClient } from '@/lib/supabase/server';
import { Badge } from '@/components/ui';
import { Calendar, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Recently Sold - NotRenewing',
  description: 'See domains that have recently sold on NotRenewing for $99.',
};

// TLD color mapping
const TLD_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  com: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
  net: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' },
  org: { bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-200' },
  io: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200' },
  ai: { bg: 'bg-fuchsia-50', text: 'text-fuchsia-600', border: 'border-fuchsia-200' },
};

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
  return `${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) > 1 ? 's' : ''} ago`;
}

export default async function RecentlySoldPage() {
  const supabase = await createClient();

  // Fetch sold listings with purchase info
  const { data: soldListings } = await supabase
    .from('listings')
    .select(`
      id,
      domain_name,
      tld,
      domain_age_months,
      created_at,
      purchases (
        created_at,
        transfer_status,
        transfer_confirmed_at
      )
    `)
    .eq('status', 'sold')
    .order('created_at', { ascending: false })
    .limit(50);

  const listings = soldListings || [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Recently Sold</h1>
        <p className="text-gray-500 mt-1">
          Domains that found new homes through NotRenewing. All sold for $99.
        </p>
      </div>

      {listings.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No sales yet</h3>
          <p className="text-gray-500 mb-6">
            Be the first to sell a domain on NotRenewing!
          </p>
          <Link 
            href="/signup"
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            Start Selling
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {listings.map((listing) => {
            const tldColor = TLD_COLORS[listing.tld] || { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200' };
            const purchase = Array.isArray(listing.purchases) ? listing.purchases[0] : listing.purchases;
            const soldDate = purchase?.transfer_confirmed_at || purchase?.created_at || listing.created_at;
            const domainAge = listing.domain_age_months 
              ? listing.domain_age_months < 12 
                ? `${listing.domain_age_months}mo old`
                : `${Math.floor(listing.domain_age_months / 12)}yr${Math.floor(listing.domain_age_months / 12) > 1 ? 's' : ''} old`
              : null;

            return (
              <div 
                key={listing.id}
                className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{listing.domain_name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full border ${tldColor.bg} ${tldColor.text} ${tldColor.border}`}>
                        .{listing.tld}
                      </span>
                      {domainAge && (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          {domainAge}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">$99</div>
                  <div className="text-xs text-gray-500">{formatTimeAgo(soldDate)}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {listings.length > 0 && (
        <div className="mt-12 p-6 bg-gradient-to-r from-primary-50 to-violet-50 rounded-2xl text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Got domains you&apos;re not renewing?
          </h3>
          <p className="text-gray-600 mb-4">
            Turn your expiring domains into cash. Free to list, sell for $99.
          </p>
          <Link 
            href="/signup"
            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors shadow-md shadow-primary-500/25"
          >
            Start Selling Today
          </Link>
        </div>
      )}
    </div>
  );
}
