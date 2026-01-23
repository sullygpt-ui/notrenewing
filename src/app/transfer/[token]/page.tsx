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
  const deadline = purchase.transfer_deadline ? new Date(purchase.transfer_deadline) : null;
  const isPastDeadline = deadline && deadline < new Date();

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
          {deadline && !isCompleted && (
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Transfer Deadline</span>
              <span className={`font-medium ${isPastDeadline ? 'text-red-600' : ''}`}>
                {deadline.toLocaleDateString()} {deadline.toLocaleTimeString()}
              </span>
            </div>
          )}
        </div>
      </div>

      {!isCompleted && !isDisputed && (
        <div className="bg-blue-50 rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">What to Expect</h3>
          <ol className="list-decimal list-inside text-blue-800 space-y-2 text-sm">
            <li>The seller will initiate the domain transfer within 72 hours</li>
            <li>You&apos;ll receive an auth code via email from the seller or registrar</li>
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
            You confirmed receipt of this domain on{' '}
            {purchase.transfer_confirmed_at && new Date(purchase.transfer_confirmed_at).toLocaleDateString()}.
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
        <TransferActions purchaseId={purchase.id} isPastDeadline={isPastDeadline || false} />
      )}
    </div>
  );
}
