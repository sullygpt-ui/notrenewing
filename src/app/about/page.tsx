import Link from 'next/link';
import { Button } from '@/components/ui';

export const metadata = {
  title: 'About - NotRenewing',
  description: 'Learn how NotRenewing helps domain owners sell domains they are not renewing for a fixed $99 price.',
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">About NotRenewing</h1>

      <div className="prose prose-lg max-w-none">
        <p className="text-xl text-gray-600 mb-8">
          NotRenewing is a simple marketplace for domains that owners have decided not to renew.
          Every domain sells for a fixed $99 - no auctions, no negotiations, no hassle.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">The Problem We Solve</h2>
        <p className="text-gray-600 mb-4">
          Every year, millions of domain names expire because their owners no longer need them.
          These domains often have value - they may have age, backlinks, or simply be good names -
          but selling them through traditional marketplaces can be time-consuming and frustrating.
        </p>
        <p className="text-gray-600 mb-4">
          Premium marketplaces want high-value domains. Auction sites require waiting and negotiating.
          Meanwhile, the renewal deadline approaches and the domain expires worthless.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">How It Works</h2>

        <div className="bg-gray-50 rounded-lg p-6 my-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">For Sellers</h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-600">
            <li><strong>List for free</strong> - Submit domains you don&apos;t plan to renew. No listing fees.</li>
            <li><strong>Verify ownership</strong> - Add a simple DNS TXT record to prove you own the domain.</li>
            <li><strong>Get paid</strong> - When your domain sells, you receive $97 ($99 minus $2 platform fee).</li>
          </ol>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 my-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">For Buyers</h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-600">
            <li><strong>Browse domains</strong> - Every domain is $99. No negotiation needed.</li>
            <li><strong>Purchase securely</strong> - Pay with any major credit card. We hold the payment.</li>
            <li><strong>Receive your domain</strong> - Seller transfers the domain within 72 hours or you get a refund.</li>
          </ol>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Why $99?</h2>
        <p className="text-gray-600 mb-4">
          We chose a fixed price to eliminate the friction of negotiation. $99 is low enough to be an
          impulse purchase for buyers, yet high enough to be worthwhile for sellers who would otherwise
          let their domains expire for nothing.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Domain Requirements</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-600 mb-6">
          <li>Domain must be at least 24 months old</li>
          <li>Domain must expire within the next 12 months</li>
          <li>Supported extensions: .com, .net, .org, .io, .ai</li>
        </ul>

        <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Buyer Protection</h2>
        <p className="text-gray-600 mb-4">
          We hold all payments until the domain transfer is complete. Sellers have 72 hours to initiate
          the transfer after a sale. If they don&apos;t, you get an automatic refund. You can also open a
          dispute if any issues arise during the transfer.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Get Started</h2>
        <p className="text-gray-600 mb-6">
          Ready to turn your expiring domains into cash, or find your next great domain for just $99?
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/signup">
            <Button size="lg">Start Selling</Button>
          </Link>
          <Link href="/browse">
            <Button variant="outline" size="lg">Browse Domains</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
