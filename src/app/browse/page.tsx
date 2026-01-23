import { createClient } from '@/lib/supabase/server';
import { DomainGrid } from '@/components/domain';
import { Badge } from '@/components/ui';
import Link from 'next/link';
import type { Listing } from '@/types/database';

export const dynamic = 'force-dynamic';

const SUPPORTED_TLDS = ['com', 'net', 'org', 'io', 'ai'];

interface BrowsePageProps {
  searchParams: Promise<{
    tld?: string;
    sort?: 'newest' | 'expiring';
    q?: string;
  }>;
}

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  const { tld, sort = 'newest', q } = params;

  let query = supabase
    .from('listings')
    .select('*')
    .eq('status', 'active')
    .eq('admin_hidden', false);

  // Filter by TLD
  if (tld && SUPPORTED_TLDS.includes(tld)) {
    query = query.eq('tld', tld);
  }

  // Search by domain name
  if (q) {
    query = query.ilike('domain_name', `%${q}%`);
  }

  // Sort
  if (sort === 'expiring') {
    query = query.order('expiration_date', { ascending: true });
  } else {
    query = query.order('listed_at', { ascending: false });
  }

  const { data: listingsData } = await query.limit(100);
  const listings = (listingsData || []) as Listing[];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Browse Domains</h1>
        <p className="text-gray-500 mt-1">All domains are $99. No negotiation.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-8">
        {/* TLD Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Extension:</span>
          <div className="flex gap-2">
            <Link href="/browse">
              <Badge variant={!tld ? 'info' : 'default'} size="md">
                All
              </Badge>
            </Link>
            {SUPPORTED_TLDS.map((t) => (
              <Link key={t} href={`/browse?tld=${t}${sort !== 'newest' ? `&sort=${sort}` : ''}${q ? `&q=${q}` : ''}`}>
                <Badge variant={tld === t ? 'info' : 'default'} size="md">
                  .{t}
                </Badge>
              </Link>
            ))}
          </div>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-sm text-gray-500">Sort:</span>
          <div className="flex gap-2">
            <Link href={`/browse?${tld ? `tld=${tld}` : ''}${q ? `${tld ? '&' : ''}q=${q}` : ''}`}>
              <Badge variant={sort === 'newest' ? 'info' : 'default'} size="md">
                Newest
              </Badge>
            </Link>
            <Link href={`/browse?${tld ? `tld=${tld}&` : ''}sort=expiring${q ? `&q=${q}` : ''}`}>
              <Badge variant={sort === 'expiring' ? 'info' : 'default'} size="md">
                Expiring Soon
              </Badge>
            </Link>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-8">
        <form action="/browse" method="GET">
          {tld && <input type="hidden" name="tld" value={tld} />}
          {sort !== 'newest' && <input type="hidden" name="sort" value={sort} />}
          <div className="relative">
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Search domains..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Results */}
      <div className="mb-4">
        <p className="text-sm text-gray-500">
          {listings.length} domain{listings.length !== 1 ? 's' : ''} found
        </p>
      </div>

      <DomainGrid listings={listings} />
    </div>
  );
}
