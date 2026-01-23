import { notFound } from 'next/navigation';
import { createServiceClient } from '@/lib/supabase/server';
import { TransferActions } from './actions';

interface TransferPageProps {
  params: Promise<{ token: string }>;
}

export default async function TransferPage({ params }: TransferPageProps) {
  const { token } = await params;
  const supabase = await createServiceClient();

  // Find purchase by token (we'll use the purchase ID as token for now)
  const { data: purchase, error } = await supabase
    .from('purchases')
    .select('*, listings(*)')
    .eq('id', token)
    .single();

  if (error || !purchase) {
    notFound();
  }

  const listing = purchase.listings as any;
  const isCompleted = purchase.transfer_status === 'completed';
  const isDisputed = purchase.transfer_status === 'disputed';
  const transferDeadline = purchase.transfer_deadline ? new Date(purchase.transfer_deadline) : null;
  const isPastTransferDeadline = transferDeadline && transferDeadline < new Date();
  const hasTransferInfo = !!purchase.transfer_initiated_at;
  const confirmationDeadline = purchase.buyer_confirmation_deadline ? new Date(purchase.buyer_confirmation_deadline) : null;
  const isAutoReleased = purchase.auto_released;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Domain Transfer</h1>
        <p className="text-gray-600">
          {listing.domain_name}
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Transfer Status</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Domain</span>
            <span className="font-medium">{listing.domain_name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Purchase Date</span>
            <span className="font-medium">
              {new Date(purchase.created_at).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Amount Paid</span>
            <span className="font-medium">${(purchase.amount_paid / 100).toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Status</span>
            <span className={`font-medium ${
              isCompleted ? 'text-green-600' :
              isDisputed ? 'text-red-600' :
              'text-yellow-600'
            }`}>
              {purchase.transfer_status.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
            </span>
          </div>
          {transferDeadline && !isCompleted && !hasTransferInfo && (
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Seller Deadline</span>
              <span className={`font-medium ${isPastTransferDeadline ? 'text-red-600' : ''}`}>
                {transferDeadline.toLocaleDateString()} {transferDeadline.toLocaleTimeString()}
              </span>
            </div>
          )}
          {confirmationDeadline && !isCompleted && hasTransferInfo && (
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Auto-Release Date</span>
              <span className="font-medium text-orange-600">
                {confirmationDeadline.toLocaleDateString()} {confirmationDeadline.toLocaleTimeString()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Auth Code Section - Show when seller has provided transfer info */}
      {hasTransferInfo && !isCompleted && !isDisputed && (
        <div className="bg-green-50 rounded-xl p-6 mb-6 border border-green-200">
          <h3 className="font-semibold text-green-900 mb-4">Transfer Information Ready</h3>

          <div className="bg-white p-4 rounded-lg border border-green-300 mb-4">
            <p className="text-sm text-gray-600 mb-2">Authorization Code</p>
            <p className="font-mono text-lg font-medium text-gray-900 break-all">
              {purchase.auth_code}
            </p>
          </div>

          {purchase.transfer_notes && (
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-4">
              <p className="text-sm text-yellow-800 font-medium mb-1">Seller Notes</p>
              <p className="text-yellow-900">{purchase.transfer_notes}</p>
            </div>
          )}

          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <p className="text-sm text-orange-800">
              <strong>Important:</strong> Payment will be automatically released to the seller on{' '}
              <strong>{confirmationDeadline?.toLocaleDateString()}</strong> if you don&apos;t confirm
              receipt or open a dispute before then.
            </p>
          </div>
        </div>
      )}

      {/* Waiting for seller - no transfer info yet */}
      {!hasTransferInfo && !isCompleted && !isDisputed && (
        <div className="bg-blue-50 rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">Waiting for Seller</h3>
          <p className="text-blue-800 text-sm mb-4">
            The seller has until {transferDeadline?.toLocaleDateString()} {transferDeadline?.toLocaleTimeString()} to
            provide transfer information.
          </p>
          <ol className="list-decimal list-inside text-blue-800 space-y-2 text-sm">
            <li>The seller will provide the authorization code</li>
            <li>You&apos;ll receive an email when transfer info is ready</li>
            <li>Use the auth code to accept the transfer at your registrar</li>
            <li>Once you have control of the domain, confirm receipt below</li>
          </ol>
        </div>
      )}

      {isCompleted ? (
        <div className="bg-green-50 rounded-xl p-6 text-center">
          <div className="text-4xl mb-2">✓</div>
          <h3 className="font-semibold text-green-900 mb-2">Transfer Complete</h3>
          <p className="text-green-700 text-sm">
            {isAutoReleased ? (
              <>
                Payment was automatically released on{' '}
                {purchase.transfer_confirmed_at && new Date(purchase.transfer_confirmed_at).toLocaleDateString()}.
              </>
            ) : (
              <>
                You confirmed receipt of this domain on{' '}
                {purchase.transfer_confirmed_at && new Date(purchase.transfer_confirmed_at).toLocaleDateString()}.
              </>
            )}{' '}
            The seller has been paid.
          </p>
        </div>
      ) : isDisputed ? (
        <div className="bg-red-50 rounded-xl p-6 text-center">
          <div className="text-4xl mb-2">!</div>
          <h3 className="font-semibold text-red-900 mb-2">Dispute Opened</h3>
          <p className="text-red-700 text-sm">
            A dispute has been opened for this transfer. Our team will review and contact you.
          </p>
        </div>
      ) : (
        <TransferActions
          purchaseId={purchase.id}
          isPastTransferDeadline={isPastTransferDeadline || false}
          hasTransferInfo={hasTransferInfo}
        />
      )}
    </div>
  );
}
