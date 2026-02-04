import { Mail, MessageSquare, HelpCircle } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Contact - NotRenewing',
  description: 'Get in touch with the NotRenewing team. We\'re here to help with any questions.',
};

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Contact Us</h1>
        <p className="text-gray-600">
          Have a question or need help? We&apos;re here for you.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-12">
        {/* Email Support */}
        <div className="p-6 bg-white border border-gray-200 rounded-2xl hover:border-primary-300 hover:shadow-md transition-all">
          <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-xl mb-4">
            <Mail className="w-6 h-6 text-primary-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Support</h3>
          <p className="text-gray-600 text-sm mb-4">
            For general inquiries, partnership opportunities, or any questions about NotRenewing.
          </p>
          <a 
            href="mailto:support@notrenewing.com"
            className="inline-flex items-center text-primary-600 font-medium hover:text-primary-700 transition-colors"
          >
            support@notrenewing.com
          </a>
        </div>

        {/* FAQ */}
        <div className="p-6 bg-white border border-gray-200 rounded-2xl hover:border-primary-300 hover:shadow-md transition-all">
          <div className="flex items-center justify-center w-12 h-12 bg-violet-100 rounded-xl mb-4">
            <HelpCircle className="w-6 h-6 text-violet-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">FAQ</h3>
          <p className="text-gray-600 text-sm mb-4">
            Find quick answers to common questions about buying, selling, and transfers.
          </p>
          <Link 
            href="/faq"
            className="inline-flex items-center text-primary-600 font-medium hover:text-primary-700 transition-colors"
          >
            Browse FAQ →
          </Link>
        </div>
      </div>

      {/* Contact Topics */}
      <div className="bg-gray-50 rounded-2xl p-6 mb-12">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-gray-400" />
          Common Topics
        </h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-primary-600 font-bold">•</span>
            <div>
              <span className="font-medium text-gray-900">Domain Transfer Issues</span>
              <p className="text-sm text-gray-600">Problems with receiving or sending a domain? Email us with your order details.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-primary-600 font-bold">•</span>
            <div>
              <span className="font-medium text-gray-900">Payment & Refunds</span>
              <p className="text-sm text-gray-600">Questions about payments, payouts, or refund requests.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-primary-600 font-bold">•</span>
            <div>
              <span className="font-medium text-gray-900">Account Help</span>
              <p className="text-sm text-gray-600">Can&apos;t log in or need help with your seller account.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-primary-600 font-bold">•</span>
            <div>
              <span className="font-medium text-gray-900">Bug Reports</span>
              <p className="text-sm text-gray-600">Found something broken? Let us know and we&apos;ll fix it.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Response Time */}
      <div className="text-center text-sm text-gray-500">
        <p>We typically respond within 24-48 hours during business days.</p>
        <p className="mt-1">For urgent transfer issues, please include &quot;URGENT&quot; in your subject line.</p>
      </div>
    </div>
  );
}
