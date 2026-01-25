import Link from 'next/link';
import { createServiceClient } from '@/lib/supabase/server';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';

export const dynamic = 'force-dynamic';

interface AnalyticsPageProps {
  searchParams: Promise<{ period?: string }>;
}

export default async function AdminAnalyticsPage({ searchParams }: AnalyticsPageProps) {
  const { period = '30' } = await searchParams;
  const days = parseInt(period) || 30;

  const supabase = await createServiceClient();

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startDateStr = startDate.toISOString();

  // Fetch all listings for analysis
  const { data: allListings } = await supabase
    .from('listings')
    .select('id, domain_name, tld, status, created_at, ai_score, ai_tier')
    .order('created_at', { ascending: true });

  // Fetch listings in period
  const { data: periodListings } = await supabase
    .from('listings')
    .select('id, domain_name, tld, status, created_at, ai_score, ai_tier')
    .gte('created_at', startDateStr)
    .order('created_at', { ascending: true });

  // Fetch all purchases
  const { data: allPurchases } = await supabase
    .from('purchases')
    .select('id, amount_paid, created_at, transfer_status')
    .order('created_at', { ascending: true });

  // Fetch purchases in period
  const { data: periodPurchases } = await supabase
    .from('purchases')
    .select('id, amount_paid, created_at, transfer_status')
    .gte('created_at', startDateStr)
    .order('created_at', { ascending: true });

  // Fetch all sellers
  const { data: sellers } = await supabase
    .from('profiles')
    .select('id, created_at')
    .eq('role', 'seller');

  // Fetch sellers in period
  const { data: periodSellers } = await supabase
    .from('profiles')
    .select('id, created_at')
    .eq('role', 'seller')
    .gte('created_at', startDateStr);

  // Calculate metrics
  const totalListings = allListings?.length || 0;
  const periodListingsCount = periodListings?.length || 0;
  const activeListings = allListings?.filter(l => l.status === 'active').length || 0;
  const soldListings = allListings?.filter(l => l.status === 'sold').length || 0;

  const totalRevenue = (allPurchases?.reduce((sum, p) => sum + p.amount_paid, 0) || 0) / 100;
  const periodRevenue = (periodPurchases?.reduce((sum, p) => sum + p.amount_paid, 0) || 0) / 100;
  const periodSales = periodPurchases?.length || 0;

  const conversionRate = totalListings > 0 ? ((soldListings / totalListings) * 100).toFixed(1) : '0';

  // TLD breakdown
  const tldCounts: Record<string, number> = {};
  allListings?.forEach(l => {
    tldCounts[l.tld] = (tldCounts[l.tld] || 0) + 1;
  });
  const tldBreakdown = Object.entries(tldCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  // AI Score distribution
  const scoreBuckets = { high: 0, medium: 0, low: 0, unscored: 0 };
  allListings?.forEach(l => {
    if (l.ai_tier === 'high') scoreBuckets.high++;
    else if (l.ai_tier === 'medium') scoreBuckets.medium++;
    else if (l.ai_tier === 'low') scoreBuckets.low++;
    else scoreBuckets.unscored++;
  });

  // Daily listings for chart (last N days)
  const dailyData: Record<string, { listings: number; sales: number; revenue: number }> = {};
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const key = date.toISOString().split('T')[0];
    dailyData[key] = { listings: 0, sales: 0, revenue: 0 };
  }

  periodListings?.forEach(l => {
    const key = l.created_at.split('T')[0];
    if (dailyData[key]) dailyData[key].listings++;
  });

  periodPurchases?.forEach(p => {
    const key = p.created_at.split('T')[0];
    if (dailyData[key]) {
      dailyData[key].sales++;
      dailyData[key].revenue += p.amount_paid / 100;
    }
  });

  const chartData = Object.entries(dailyData)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, data]) => ({ date, ...data }));

  const maxListings = Math.max(...chartData.map(d => d.listings), 1);
  const maxSales = Math.max(...chartData.map(d => d.sales), 1);

  // Status breakdown
  const statusCounts: Record<string, number> = {};
  allListings?.forEach(l => {
    statusCounts[l.status] = (statusCounts[l.status] || 0) + 1;
  });

  const periodFilters = [
    { label: '7 Days', value: '7' },
    { label: '30 Days', value: '30' },
    { label: '90 Days', value: '90' },
    { label: '1 Year', value: '365' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
        <div className="flex gap-2">
          {periodFilters.map((filter) => (
            <Link
              key={filter.value}
              href={`/admin/analytics?period=${filter.value}`}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                period === filter.value
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filter.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent>
            <p className="text-sm text-gray-500">Period Listings</p>
            <p className="text-3xl font-bold text-gray-900">{periodListingsCount}</p>
            <p className="text-xs text-gray-400">of {totalListings} total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-gray-500">Period Sales</p>
            <p className="text-3xl font-bold text-green-600">{periodSales}</p>
            <p className="text-xs text-gray-400">${periodRevenue.toLocaleString()} revenue</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-gray-500">Total Revenue</p>
            <p className="text-3xl font-bold text-blue-600">${totalRevenue.toLocaleString()}</p>
            <p className="text-xs text-gray-400">{allPurchases?.length || 0} total sales</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-gray-500">Conversion Rate</p>
            <p className="text-3xl font-bold text-purple-600">{conversionRate}%</p>
            <p className="text-xs text-gray-400">listed to sold</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        {/* Listings Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Listings Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-end gap-1">
              {chartData.map((day, i) => (
                <div
                  key={day.date}
                  className="flex-1 bg-blue-500 rounded-t hover:bg-blue-600 transition-colors relative group"
                  style={{ height: `${(day.listings / maxListings) * 100}%`, minHeight: day.listings > 0 ? '4px' : '0' }}
                >
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">
                    {day.date}: {day.listings} listings
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>{chartData[0]?.date}</span>
              <span>{chartData[chartData.length - 1]?.date}</span>
            </div>
          </CardContent>
        </Card>

        {/* Sales Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Sales Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-end gap-1">
              {chartData.map((day, i) => (
                <div
                  key={day.date}
                  className="flex-1 bg-green-500 rounded-t hover:bg-green-600 transition-colors relative group"
                  style={{ height: `${(day.sales / maxSales) * 100}%`, minHeight: day.sales > 0 ? '4px' : '0' }}
                >
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">
                    {day.date}: {day.sales} sales (${day.revenue})
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>{chartData[0]?.date}</span>
              <span>{chartData[chartData.length - 1]?.date}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Breakdowns Row */}
      <div className="grid md:grid-cols-3 gap-8 mb-8">
        {/* TLD Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>TLD Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tldBreakdown.map(([tld, count]) => {
                const percentage = totalListings > 0 ? (count / totalListings) * 100 : 0;
                return (
                  <div key={tld}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">.{tld}</span>
                      <span className="text-gray-500">{count} ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {tldBreakdown.length === 0 && (
                <p className="text-gray-500 text-center py-4">No data</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(statusCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([status, count]) => {
                  const percentage = totalListings > 0 ? (count / totalListings) * 100 : 0;
                  const colors: Record<string, string> = {
                    active: 'bg-green-500',
                    sold: 'bg-blue-500',
                    pending_verification: 'bg-yellow-500',
                    pending_payment: 'bg-orange-500',
                    paused: 'bg-gray-500',
                    hidden: 'bg-red-500',
                  };
                  return (
                    <div key={status}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium capitalize">{status.replace(/_/g, ' ')}</span>
                        <span className="text-gray-500">{count} ({percentage.toFixed(1)}%)</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${colors[status] || 'bg-gray-500'}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              {Object.keys(statusCounts).length === 0 && (
                <p className="text-gray-500 text-center py-4">No data</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* AI Score Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>AI Quality Tiers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: 'High Quality', key: 'high', color: 'bg-green-500' },
                { label: 'Medium Quality', key: 'medium', color: 'bg-yellow-500' },
                { label: 'Low Quality', key: 'low', color: 'bg-red-500' },
                { label: 'Unscored', key: 'unscored', color: 'bg-gray-400' },
              ].map(({ label, key, color }) => {
                const count = scoreBuckets[key as keyof typeof scoreBuckets];
                const percentage = totalListings > 0 ? (count / totalListings) * 100 : 0;
                return (
                  <div key={key}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{label}</span>
                      <span className="text-gray-500">{count} ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${color}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Summary Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-500">Total Sellers</p>
              <p className="text-2xl font-bold">{sellers?.length || 0}</p>
              <p className="text-xs text-green-600">+{periodSellers?.length || 0} this period</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Listings</p>
              <p className="text-2xl font-bold">{activeListings}</p>
              <p className="text-xs text-gray-400">currently for sale</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Avg. Listings/Day</p>
              <p className="text-2xl font-bold">{(periodListingsCount / days).toFixed(1)}</p>
              <p className="text-xs text-gray-400">last {days} days</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Avg. Sales/Day</p>
              <p className="text-2xl font-bold">{(periodSales / days).toFixed(2)}</p>
              <p className="text-xs text-gray-400">last {days} days</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
