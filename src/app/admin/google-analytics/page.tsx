import { GoogleAnalyticsDashboard } from '@/components/admin/GoogleAnalyticsDashboard';

export const dynamic = 'force-dynamic';

const GA_MEASUREMENT_ID = 'G-CGD9K892KP';

interface PageProps {
  searchParams: Promise<{ start?: string; end?: string }>;
}

export default async function AdminGoogleAnalyticsPage({ searchParams }: PageProps) {
  const { start, end } = await searchParams;

  // Default to last 30 days
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const initialStartDate = start || thirtyDaysAgo.toISOString().split('T')[0];
  const initialEndDate = end || today.toISOString().split('T')[0];

  // Check if GA API is configured
  const isConfigured = !!(
    process.env.GA_PROPERTY_ID &&
    process.env.GA_CLIENT_EMAIL &&
    (process.env.GA_PRIVATE_KEY || process.env.GA_PRIVATE_KEY_BASE64)
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Google Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Property ID: {GA_MEASUREMENT_ID}</p>
        </div>
        <a
          href="https://analytics.google.com/analytics/web/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          Open Full Dashboard
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>

      {isConfigured ? (
        <GoogleAnalyticsDashboard
          initialStartDate={initialStartDate}
          initialEndDate={initialEndDate}
        />
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            Google Analytics API Not Configured
          </h3>
          <p className="text-yellow-700 mb-4">
            To display analytics data directly in this dashboard, you need to configure the Google Analytics Data API credentials.
          </p>
          <div className="bg-white rounded-lg p-4 border border-yellow-200">
            <p className="text-sm font-medium text-gray-700 mb-2">Required environment variables:</p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li><code className="bg-gray-100 px-1 rounded">GA_PROPERTY_ID</code> - Your GA4 property ID (numeric)</li>
              <li><code className="bg-gray-100 px-1 rounded">GA_CLIENT_EMAIL</code> - Service account email</li>
              <li><code className="bg-gray-100 px-1 rounded">GA_PRIVATE_KEY</code> - Service account private key</li>
            </ul>
          </div>
          <div className="mt-4">
            <a
              href="https://analytics.google.com/analytics/web/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-yellow-700 hover:text-yellow-800 font-medium"
            >
              View analytics on Google Analytics instead
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
