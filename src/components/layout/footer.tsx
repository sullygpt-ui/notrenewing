import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Marketplace</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/browse" className="text-sm text-gray-600 hover:text-gray-900">
                  Browse Domains
                </Link>
              </li>
              <li>
                <Link href="/recently-sold" className="text-sm text-gray-600 hover:text-gray-900">
                  Recently Sold
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Sellers</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/signup" className="text-sm text-gray-600 hover:text-gray-900">
                  Start Selling
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">
                  Seller Login
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Support</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-sm text-gray-600 hover:text-gray-900">
                  About
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-sm text-gray-600 hover:text-gray-900">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-gray-600 hover:text-gray-900">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/terms" className="text-sm text-gray-600 hover:text-gray-900">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-gray-600 hover:text-gray-900">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} NotRenewing. All rights reserved.
          </p>
          <a
            href="https://sullysblog.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-500 hover:text-gray-900"
          >
            SullysBlog.com
          </a>
        </div>
      </div>
    </footer>
  );
}
