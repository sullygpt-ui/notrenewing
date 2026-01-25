import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui';

export const dynamic = 'force-dynamic';

const GA_MEASUREMENT_ID = 'G-CGD9K892KP';
const GA_PROPERTY_URL = `https://analytics.google.com/analytics/web/#/p${GA_MEASUREMENT_ID.replace('G-', '')}/reports/intelligenthome`;

export default function AdminGoogleAnalyticsPage() {
  const quickLinks = [
    {
      title: 'Real-Time Overview',
      description: 'See who is on your site right now',
      url: 'https://analytics.google.com/analytics/web/#/realtime/overview',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      title: 'Acquisition Overview',
      description: 'See where your traffic comes from',
      url: 'https://analytics.google.com/analytics/web/#/report/acquisition-overview',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      title: 'Engagement Overview',
      description: 'See how users interact with your site',
      url: 'https://analytics.google.com/analytics/web/#/report/engagement-overview',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
    },
    {
      title: 'Pages and Screens',
      description: 'See which pages are most popular',
      url: 'https://analytics.google.com/analytics/web/#/report/content-pages',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      title: 'User Demographics',
      description: 'See user location, language, and more',
      url: 'https://analytics.google.com/analytics/web/#/report/visitors-demographics-overview',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: 'Technology Overview',
      description: 'See devices, browsers, and OS',
      url: 'https://analytics.google.com/analytics/web/#/report/visitors-tech-overview',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
  ];

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
        >
          <Button>
            Open Google Analytics
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </Button>
        </a>
      </div>

      {/* Status Card */}
      <Card className="mb-8 bg-green-50 border-green-200">
        <CardContent>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-green-800">Google Analytics is Active</p>
              <p className="text-sm text-green-600">Tracking is enabled on all pages of your site</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Reports</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {quickLinks.map((link) => (
          <a
            key={link.title}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
              <CardContent>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 flex-shrink-0">
                    {link.icon}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{link.title}</p>
                    <p className="text-sm text-gray-500">{link.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </a>
        ))}
      </div>

      {/* Key Metrics to Track */}
      <Card>
        <CardHeader>
          <CardTitle>Key Metrics to Monitor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Traffic Metrics</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span><strong>Users</strong> - Unique visitors to your site</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span><strong>Sessions</strong> - Total visits to your site</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span><strong>Pageviews</strong> - Total pages viewed</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span><strong>Bounce Rate</strong> - Single-page visits</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Conversion Metrics</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span><strong>Browse to Submit</strong> - Users who list domains</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span><strong>Listing Views</strong> - Domain page visits</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span><strong>Checkout Started</strong> - Purchase attempts</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span><strong>Purchase Complete</strong> - Successful sales</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Tip:</strong> Set up conversion events in Google Analytics to track when users complete key actions like submitting a domain listing or making a purchase. This helps measure the effectiveness of your marketing efforts.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
