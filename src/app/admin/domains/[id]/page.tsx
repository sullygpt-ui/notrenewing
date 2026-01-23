import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createServiceClient } from '@/lib/supabase/server';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '@/components/ui';
import { AdminDomainActions } from '../actions';
import { RescoeDomainButton } from './rescore-button';
import { EditListingForm } from './edit-form';

export const dynamic = 'force-dynamic';

interface DomainDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminDomainDetailPage({ params }: DomainDetailPageProps) {
  const { id } = await params;
  // Use service client to bypass RLS for admin queries
  const supabase = await createServiceClient();

  const { data: listing, error } = await supabase
    .from('listings')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !listing) {
    notFound();
  }

  // Get seller info
  const { data: sellerData } = await supabase.auth.admin.getUserById(listing.seller_id);
  const { data: sellerProfile } = await supabase
    .from('profiles')
    .select('reliability_score, is_suspended')
    .eq('id', listing.seller_id)
    .single();

  // Get purchase info if sold
  let purchase = null;
  if (listing.status === 'sold') {
    const { data } = await supabase
      .from('purchases')
      .select('*')
      .eq('listing_id', listing.id)
      .single();
    purchase = data;
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/domains" className="text-sm text-gray-500 hover:text-gray-700">
          &larr; Back to Domains
        </Link>
      </div>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{listing.domain_name}</h1>
          <p className="text-gray-500">ID: {listing.id}</p>
        </div>
        <AdminDomainActions listing={listing} showStatusDropdown={true} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Domain Info */}
        <Card>
          <CardHeader>
            <CardTitle>Domain Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div className="flex justify-between">
                <dt className="text-gray-500">Domain Name</dt>
                <dd className="font-medium">{listing.domain_name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">TLD</dt>
                <dd className="font-medium">.{listing.tld}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Status</dt>
                <dd>
                  <Badge
                    variant={
                      listing.status === 'active' ? 'success' :
                      listing.status === 'sold' ? 'info' :
                      listing.status === 'pending_verification' ? 'warning' : 'default'
                    }
                  >
                    {listing.status.replace(/_/g, ' ')}
                  </Badge>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Registrar</dt>
                <dd className="font-medium">{listing.registrar || '-'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Domain Age</dt>
                <dd className="font-medium">
                  {listing.domain_age_months ? `${listing.domain_age_months} months` : '-'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Expiration Date</dt>
                <dd className="font-medium">
                  {listing.expiration_date
                    ? new Date(listing.expiration_date).toLocaleDateString()
                    : '-'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Verification Token</dt>
                <dd className="font-mono text-sm">{listing.verification_token || '-'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Verified At</dt>
                <dd className="font-medium">
                  {listing.verified_at
                    ? new Date(listing.verified_at).toLocaleString()
                    : '-'}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* AI Score */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>AI Scoring</CardTitle>
              <RescoeDomainButton listingId={listing.id} domainName={listing.domain_name} />
            </div>
          </CardHeader>
          <CardContent>
            {listing.ai_score !== null ? (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-5xl font-bold mb-2">{listing.ai_score}</div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    listing.ai_tier === 'high' ? 'bg-green-100 text-green-800' :
                    listing.ai_tier === 'medium' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {listing.ai_tier?.toUpperCase()} TIER
                  </span>
                </div>

                {/* Score breakdown visual */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Score</span>
                    <span className="font-medium">{listing.ai_score}/100</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${
                        listing.ai_score >= 70 ? 'bg-green-500' :
                        listing.ai_score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${listing.ai_score}%` }}
                    />
                  </div>
                </div>

                {/* Tier explanation */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Tier Guidelines</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li className={listing.ai_tier === 'high' ? 'font-medium text-green-600' : ''}>
                      • High (70-100): Exceptional - Short, memorable, brandable
                    </li>
                    <li className={listing.ai_tier === 'medium' ? 'font-medium text-yellow-600' : ''}>
                      • Medium (40-69): Good - Solid domain with clear appeal
                    </li>
                    <li className={listing.ai_tier === 'low' ? 'font-medium text-red-600' : ''}>
                      • Low (0-39): Limited - May have issues or limited appeal
                    </li>
                  </ul>
                </div>

                {/* AI Reasoning */}
                {listing.ai_reasoning && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">AI Analysis</h4>
                    <p className="text-sm text-blue-800">{listing.ai_reasoning}</p>
                  </div>
                )}

                <div className="text-xs text-gray-400 text-center">
                  Scored at: {listing.ai_scored_at
                    ? new Date(listing.ai_scored_at).toLocaleString()
                    : 'Unknown'}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">Not yet scored</p>
                <RescoeDomainButton listingId={listing.id} domainName={listing.domain_name} />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Seller Info */}
        <Card>
          <CardHeader>
            <CardTitle>Seller Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div className="flex justify-between">
                <dt className="text-gray-500">Email</dt>
                <dd className="font-medium">{sellerData?.user?.email || 'Unknown'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Seller ID</dt>
                <dd className="font-mono text-sm">{listing.seller_id}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Reliability Score</dt>
                <dd className="font-medium">{sellerProfile?.reliability_score || 100}%</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Account Status</dt>
                <dd>
                  {sellerProfile?.is_suspended ? (
                    <Badge variant="danger">Suspended</Badge>
                  ) : (
                    <Badge variant="success">Active</Badge>
                  )}
                </dd>
              </div>
            </dl>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <Link
                href={`/admin/sellers?search=${listing.seller_id}`}
                className="text-sm text-primary-600 hover:underline"
              >
                View Seller Details &rarr;
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Admin Flags */}
        <Card>
          <CardHeader>
            <CardTitle>Admin Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div className="flex justify-between">
                <dt className="text-gray-500">Staff Pick</dt>
                <dd>
                  {listing.staff_pick ? (
                    <Badge variant="warning">Staff Pick</Badge>
                  ) : (
                    <span className="text-gray-400">No</span>
                  )}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Featured</dt>
                <dd>
                  {listing.admin_featured ? (
                    <Badge variant="success">Yes</Badge>
                  ) : (
                    <span className="text-gray-400">No</span>
                  )}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Hidden</dt>
                <dd>
                  {listing.admin_hidden ? (
                    <Badge variant="danger">Hidden</Badge>
                  ) : (
                    <span className="text-gray-400">No</span>
                  )}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Sponsored</dt>
                <dd>
                  {listing.is_sponsored ? (
                    <div>
                      <Badge variant="info">Sponsored</Badge>
                      <span className="text-xs text-gray-500 ml-2">
                        until {listing.sponsored_until
                          ? new Date(listing.sponsored_until).toLocaleDateString()
                          : 'N/A'}
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-400">No</span>
                  )}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Edit Listing */}
        <Card>
          <CardHeader>
            <CardTitle>Edit Listing</CardTitle>
          </CardHeader>
          <CardContent>
            <EditListingForm listing={listing} />
          </CardContent>
        </Card>

        {/* Purchase Info (if sold) */}
        {purchase && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Purchase Information</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid md:grid-cols-2 gap-4">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Buyer Email</dt>
                  <dd className="font-medium">{purchase.buyer_email}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Amount Paid</dt>
                  <dd className="font-medium">${(purchase.amount_paid / 100).toFixed(2)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Transfer Status</dt>
                  <dd>
                    <Badge
                      variant={
                        purchase.transfer_status === 'completed' ? 'success' :
                        purchase.transfer_status === 'pending' ? 'warning' :
                        purchase.transfer_status === 'disputed' ? 'danger' : 'default'
                      }
                    >
                      {purchase.transfer_status}
                    </Badge>
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Purchase Date</dt>
                  <dd className="font-medium">
                    {new Date(purchase.created_at).toLocaleString()}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        )}

        {/* Timestamps */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid md:grid-cols-3 gap-4">
              <div>
                <dt className="text-gray-500 text-sm">Created</dt>
                <dd className="font-medium">{new Date(listing.created_at).toLocaleString()}</dd>
              </div>
              <div>
                <dt className="text-gray-500 text-sm">Listed</dt>
                <dd className="font-medium">
                  {listing.listed_at ? new Date(listing.listed_at).toLocaleString() : '-'}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500 text-sm">Listing Expires</dt>
                <dd className="font-medium">
                  {listing.expires_at ? new Date(listing.expires_at).toLocaleString() : '-'}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
