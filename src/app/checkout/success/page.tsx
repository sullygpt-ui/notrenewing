import Link from 'next/link';
import { Button, Card, CardContent } from '@/components/ui';

export default function CheckoutSuccessPage() {
  return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
      <p className="text-gray-600 mb-8">
        Thank you for your purchase. We've sent transfer instructions to your email.
      </p>

      <Card className="mb-8 text-left">
        <CardContent>
          <h2 className="font-semibold text-gray-900 mb-4">What happens next?</h2>
          <ol className="space-y-3 text-sm text-gray-600">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-medium">1</span>
              <span>The seller has been notified and has 72 hours to initiate the transfer.</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-medium">2</span>
              <span>You'll receive an email with instructions on how to accept the transfer.</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-medium">3</span>
              <span>Once you confirm receipt, the payment is released to the seller.</span>
            </li>
          </ol>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/browse">
          <Button variant="outline">Continue Browsing</Button>
        </Link>
      </div>

      <p className="mt-8 text-sm text-gray-500">
        Questions? Contact our support team at support@notrenewing.com
      </p>
    </div>
  );
}
