import Link from 'next/link';
import { ArrowRight, Calendar, Clock } from 'lucide-react';

// Blog posts data - can be moved to a CMS later
const blogPosts = [
  {
    slug: 'why-buy-expiring-domains',
    title: 'Why Buying Expiring Domains is a Smart Investment',
    excerpt: 'Discover the untapped potential of domains that owners don\'t plan to renew. Learn how to find hidden gems at fraction of the aftermarket price.',
    date: '2025-01-31',
    readTime: 5,
    category: 'Domain Investing',
  },
  {
    slug: 'domain-transfer-guide',
    title: 'The Complete Guide to Domain Transfers',
    excerpt: 'Everything you need to know about transferring a domain between registrars. Step-by-step instructions and common pitfalls to avoid.',
    date: '2025-01-28',
    readTime: 8,
    category: 'Guides',
  },
  {
    slug: 'what-makes-domain-valuable',
    title: 'What Makes a Domain Name Valuable?',
    excerpt: 'Understanding domain valuation: length, keywords, TLD, age, and more. Learn to spot valuable domains before others do.',
    date: '2025-01-25',
    readTime: 6,
    category: 'Domain Investing',
  },
  {
    slug: 'best-domains-this-week',
    title: 'Best Domains This Week: January 2025',
    excerpt: 'Our weekly roundup of the most interesting domains listed on NotRenewing. Staff picks and hidden gems you might have missed.',
    date: '2025-01-24',
    readTime: 4,
    category: 'Weekly Picks',
  },
];

export default function BlogPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Blog</h1>
        <p className="text-gray-500 mt-2">
          Tips, guides, and insights on domain investing and the NotRenewing marketplace.
        </p>
      </div>

      <div className="space-y-8">
        {blogPosts.map((post) => (
          <article key={post.slug} className="bg-white rounded-xl border border-gray-200 p-6 hover:border-primary-300 hover:shadow-md transition-all">
            <Link href={`/blog/${post.slug}`}>
              <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                <span className="bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full text-xs font-medium">
                  {post.category}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(post.date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {post.readTime} min read
                </span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary-600">
                {post.title}
              </h2>
              <p className="text-gray-600 mb-4">
                {post.excerpt}
              </p>
              <span className="inline-flex items-center gap-1 text-primary-600 font-medium text-sm hover:gap-2 transition-all">
                Read more <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
