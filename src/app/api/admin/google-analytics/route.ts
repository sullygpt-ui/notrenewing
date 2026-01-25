import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { BetaAnalyticsDataClient } from '@google-analytics/data';
import type { GAMetrics, GATrafficSource, GATopPage, GADailyMetric } from '@/lib/types/google-analytics';

function getAnalyticsClient() {
  let privateKey = process.env.GA_PRIVATE_KEY || '';

  // Check if it's base64 encoded
  if (process.env.GA_PRIVATE_KEY_BASE64) {
    privateKey = Buffer.from(process.env.GA_PRIVATE_KEY_BASE64, 'base64').toString('utf8');
  } else {
    // Handle escaped newlines
    privateKey = privateKey
      .split('\\n').join('\n')
      .split('\\\\n').join('\n');
  }

  // Ensure the key has proper line breaks
  if (!privateKey.includes('\n') && privateKey.includes('-----BEGIN')) {
    privateKey = privateKey
      .replace('-----BEGIN PRIVATE KEY-----', '-----BEGIN PRIVATE KEY-----\n')
      .replace('-----END PRIVATE KEY-----', '\n-----END PRIVATE KEY-----');
  }

  const credentials = {
    client_email: process.env.GA_CLIENT_EMAIL,
    private_key: privateKey,
  };

  return new BetaAnalyticsDataClient({ credentials });
}

export async function GET(request: NextRequest) {
  try {
    // Verify admin auth
    const supabase = await createClient();
    const serviceClient = await createServiceClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await serviceClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate') || '30daysAgo';
    const endDate = searchParams.get('endDate') || 'today';

    const propertyId = process.env.GA_PROPERTY_ID;
    if (!propertyId) {
      return NextResponse.json({ error: 'GA_PROPERTY_ID not configured' }, { status: 500 });
    }

    if (!process.env.GA_CLIENT_EMAIL) {
      return NextResponse.json({ error: 'GA_CLIENT_EMAIL not configured' }, { status: 500 });
    }

    if (!process.env.GA_PRIVATE_KEY && !process.env.GA_PRIVATE_KEY_BASE64) {
      return NextResponse.json({ error: 'GA_PRIVATE_KEY not configured' }, { status: 500 });
    }

    const analyticsClient = getAnalyticsClient();

    // Fetch multiple reports in parallel
    const [
      coreMetrics,
      trafficSources,
      topPages,
      dailyMetrics
    ] = await Promise.all([
      fetchCoreMetrics(analyticsClient, propertyId, startDate, endDate),
      fetchTrafficSources(analyticsClient, propertyId, startDate, endDate),
      fetchTopPages(analyticsClient, propertyId, startDate, endDate),
      fetchDailyMetrics(analyticsClient, propertyId, startDate, endDate),
    ]);

    return NextResponse.json({
      coreMetrics,
      trafficSources,
      topPages,
      dailyMetrics,
      dateRange: { startDate, endDate }
    });
  } catch (error) {
    console.error('Error fetching GA data:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to fetch analytics data: ${errorMessage}` },
      { status: 500 }
    );
  }
}

async function fetchCoreMetrics(
  client: BetaAnalyticsDataClient,
  propertyId: string,
  startDate: string,
  endDate: string
): Promise<GAMetrics> {
  const [response] = await client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate, endDate }],
    metrics: [
      { name: 'screenPageViews' },
      { name: 'sessions' },
      { name: 'totalUsers' },
      { name: 'newUsers' },
      { name: 'bounceRate' },
      { name: 'averageSessionDuration' },
      { name: 'engagementRate' },
      { name: 'eventCount' },
    ],
  });

  const row = response.rows?.[0];
  return {
    pageViews: parseInt(row?.metricValues?.[0]?.value || '0'),
    sessions: parseInt(row?.metricValues?.[1]?.value || '0'),
    users: parseInt(row?.metricValues?.[2]?.value || '0'),
    newUsers: parseInt(row?.metricValues?.[3]?.value || '0'),
    bounceRate: parseFloat(row?.metricValues?.[4]?.value || '0') * 100,
    avgSessionDuration: parseFloat(row?.metricValues?.[5]?.value || '0'),
    engagementRate: parseFloat(row?.metricValues?.[6]?.value || '0') * 100,
    eventCount: parseInt(row?.metricValues?.[7]?.value || '0'),
  };
}

async function fetchTrafficSources(
  client: BetaAnalyticsDataClient,
  propertyId: string,
  startDate: string,
  endDate: string
): Promise<GATrafficSource[]> {
  const [response] = await client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate, endDate }],
    dimensions: [
      { name: 'sessionSource' },
      { name: 'sessionMedium' },
    ],
    metrics: [
      { name: 'sessions' },
      { name: 'totalUsers' },
    ],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    limit: 10,
  });

  return response.rows?.map(row => ({
    source: row.dimensionValues?.[0]?.value || 'Unknown',
    medium: row.dimensionValues?.[1]?.value || 'Unknown',
    sessions: parseInt(row.metricValues?.[0]?.value || '0'),
    users: parseInt(row.metricValues?.[1]?.value || '0'),
  })) || [];
}

async function fetchTopPages(
  client: BetaAnalyticsDataClient,
  propertyId: string,
  startDate: string,
  endDate: string
): Promise<GATopPage[]> {
  const [response] = await client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate, endDate }],
    dimensions: [
      { name: 'pagePath' },
      { name: 'pageTitle' },
    ],
    metrics: [
      { name: 'screenPageViews' },
      { name: 'averageSessionDuration' },
      { name: 'bounceRate' },
    ],
    orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
    limit: 20,
  });

  return response.rows?.map(row => ({
    path: row.dimensionValues?.[0]?.value || '/',
    title: row.dimensionValues?.[1]?.value || 'Untitled',
    views: parseInt(row.metricValues?.[0]?.value || '0'),
    avgDuration: parseFloat(row.metricValues?.[1]?.value || '0'),
    bounceRate: parseFloat(row.metricValues?.[2]?.value || '0') * 100,
  })) || [];
}

async function fetchDailyMetrics(
  client: BetaAnalyticsDataClient,
  propertyId: string,
  startDate: string,
  endDate: string
): Promise<GADailyMetric[]> {
  const [response] = await client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: 'date' }],
    metrics: [
      { name: 'screenPageViews' },
      { name: 'sessions' },
      { name: 'totalUsers' },
    ],
    orderBys: [{ dimension: { dimensionName: 'date' }, desc: false }],
  });

  return response.rows?.map(row => {
    const dateStr = row.dimensionValues?.[0]?.value || '';
    // Format YYYYMMDD to MM/DD
    const formattedDate = dateStr ?
      `${dateStr.slice(4,6)}/${dateStr.slice(6,8)}` : '';

    return {
      date: formattedDate,
      pageViews: parseInt(row.metricValues?.[0]?.value || '0'),
      sessions: parseInt(row.metricValues?.[1]?.value || '0'),
      users: parseInt(row.metricValues?.[2]?.value || '0'),
    };
  }) || [];
}
