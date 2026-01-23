import { redirect, notFound } from 'next/navigation';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';
import { SellerTransferForm } from './form';

interface SellerTransferPageProps {
  params: Promise<{ id: string }>;
}

export default async function SellerTransferPage({ params }: SellerTransferPageProps) {
  const { id: purchaseId } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const serviceClient = await createServiceClient();

  // Get purchase and verify seller owns the listing
  const { data: purchase, error } = await serviceClient
    .from('purchases')
    .select('*, listings(*)')
    .eq('id', purchaseId)
    .single();

  if (error || !purchase) {
    notFound();
  }

  const listing = purchase.listings as any;

  if (listing.seller_id !== user.id) {
    notFound();
  }

  const isCompleted = purchase.transfer_status === 'completed';
  const isDisputed = purchase.transfer_status === 'disputed';
  const hasTransferInfo = !!purchase.transfer_initiated_at;
  const transferDeadline = purchase.transfer_deadline ? new Date(purchase.transfer_deadline) : null;
  const confirmationDeadline = purchase.buyer_confirmation_deadline ? new Date(purchase.buyer_confirmation_deadline) : null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Transfer Domain</h1>
        <p className="text-gray-600 mt-1">{listing.domain_name}</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Transfer Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Domain</span>
              <span className="font-medium">{listing.domain_name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Buyer</span>
              <span className="font-medium">{purchase.buyer_email}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Sale Amount</span>
              <span className="font-medium">${(purchase.amount_paid / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Your Payout</span>
              <span className="font-medium text-green-600">
                ${((purchase.seller_payout || purchase.amount_paid - (purchase.processing_fee || 0)) / 100).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Status</span>
              <Badge
                variant={
                  isCompleted ? 'success' :
                  isDisputed ? 'danger' :
                  hasTransferInfo ? 'info' : 'warning'
                }
              >
                {isCompleted ? 'Completed' :
                 isDisputed ? 'Disputed' :
                 hasTransferInfo ? 'Awaiting Buyer' : 'Pending Transfer'}
              </Badge>
            </div>
            {transferDeadline && !hasTransferInfo && !isCompleted && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Your Deadline</span>
                <span className="font-medium text-orange-600">
                  {transferDeadline.toLocaleDateString()} {transferDeadline.toLocaleTimeString()}
                </span>
              </div>
            )}
            {confirmationDeadline && hasTransferInfo && !isCompleted && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Auto-Release Date</span>
                <span className="font-medium text-green-600">
                  {confirmationDeadline.toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {isCompleted ? (
        <Card>
          <CardContent className="text-center py-8">
            <div className="text-4xl mb-2">✓</div>
            <h3 className="font-semibold text-green-900 mb-2">Transfer Complete</h3>
            <p className="text-green-700 text-sm">
              {purchase.auto_released
                ? 'Payment was automatically released after the confirmation period.'
                : 'The buyer confirmed receipt and your payout has been processed.'}
            </p>
          </CardContent>
        </Card>
      ) : isDisputed ? (
        <Card>
          <CardContent className="text-center py-8">
            <div className="text-4xl mb-2">!</div>
            <h3 className="font-semibold text-red-900 mb-2">Dispute Opened</h3>
            <p className="text-red-700 text-sm">
              The buyer has opened a dispute for this transfer.
              Our team will review and contact you.
            </p>
            {purchase.dispute_reason && (
              <div className="mt-4 p-3 bg-red-50 rounded-lg text-left">
                <p className="text-sm text-red-800">
                  <strong>Reason:</strong> {purchase.dispute_reason}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : hasTransferInfo ? (
        <Card>
          <CardHeader>
            <CardTitle>Transfer Information Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-green-50 p-4 rounded-lg mb-4">
              <p className="text-green-800 text-sm">
                You submitted the transfer information on{' '}
                {new Date(purchase.transfer_initiated_at).toLocaleDateString()}.
                The buyer has been notified.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 mb-1">Auth Code Provided</p>
                <p className="font-mono bg-gray-100 p-2 rounded text-sm">{purchase.auth_code}</p>
              </div>
              {purchase.transfer_notes && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Notes</p>
                  <p className="bg-gray-100 p-2 rounded text-sm">{purchase.transfer_notes}</p>
                </div>
              )}
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-800 text-sm">
                <strong>What happens next:</strong> The buyer will use the auth code to transfer
                the domain to their registrar. Once complete, they&apos;ll confirm receipt and your
                payout will be processed. If they don&apos;t respond by{' '}
                {confirmationDeadline?.toLocaleDateString()}, payment will be automatically released.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <SellerTransferForm purchaseId={purchaseId} domainName={listing.domain_name} />
      )}
    </div>
  );
}
