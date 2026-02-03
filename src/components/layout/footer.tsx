import Link from 'next/link';
import { Logo } from '@/components/ui';

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Logo size="md" />
            <p className="mt-4 text-sm text-gray-500 leading-relaxed">
              The marketplace for non-renewal domains at a fixed $99 price.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-tight mb-4">Marketplace</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/browse" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  Browse Domains
                </Link>
              </li>
              <li>
                <Link href="/recently-sold" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  Recently Sold
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-tight mb-4">Sellers</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/signup" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  Start Selling
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  Seller Login
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-tight mb-4">Support</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-tight mb-4">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/terms" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-200/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} NotRenewing. All rights reserved.
          </p>
          <a
            href="https://sullysblog.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-400 hover:text-gray-900 transition-colors"
          >
            A SullysBlog.com project
          </a>
        </div>
      </div>
    </footer>
  );
}
