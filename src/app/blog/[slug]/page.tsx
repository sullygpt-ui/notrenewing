import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Calendar, Clock, Share2 } from 'lucide-react';
import { ShareButtons } from '@/components/ui';

// Author data
const authors = {
  mike: {
    name: 'Mike Sullivan',
    headshot: 'https://i.pravatar.cc/150?u=mike-sullivan',
  },
  sarah: {
    name: 'Sarah Chen',
    headshot: 'https://i.pravatar.cc/150?u=sarah-chen',
  },
  alex: {
    name: 'Alex Rivera',
    headshot: 'https://i.pravatar.cc/150?u=alex-rivera',
  },
};

// Blog posts content - can be moved to a CMS later
const blogPosts: Record<string, {
  title: string;
  excerpt: string;
  date: string;
  readTime: number;
  category: string;
  author: { name: string; headshot: string };
  content: string;
}> = {
  'why-buy-expiring-domains': {
    title: 'Why Buying Expiring Domains is a Smart Investment',
    excerpt: 'Discover the untapped potential of domains that owners don\'t plan to renew.',
    date: '2025-01-31',
    readTime: 5,
    category: 'Domain Investing',
    author: authors.mike,
    content: `
## The Hidden Opportunity in Expiring Domains

Every day, thousands of domain names expire because their owners simply don't want to renew them. Maybe they started a project that never took off, registered a domain on impulse, or their business direction changed. Whatever the reason, these domains represent a massive opportunity for savvy buyers.

## Why Expiring Domains Are Different

Unlike domains on the aftermarket that can cost hundreds or thousands of dollars, expiring domains are available at a fraction of the price. On NotRenewing, every domain is just $99 - no negotiation, no hidden fees.

### Benefits of Buying Expiring Domains:

1. **Lower Cost** - Get quality domains without the premium aftermarket markup
2. **Established Age** - Many expiring domains have years of history
3. **Existing Backlinks** - Some domains retain valuable SEO equity
4. **Memorable Names** - Find gems that were registered years ago when good names were available

## How to Spot a Good Expiring Domain

When browsing expiring domains, look for:

- **Short, memorable names** - Easier to brand and remember
- **Relevant keywords** - Industry-specific terms can provide SEO value
- **Clean history** - Check the Wayback Machine for past usage
- **Quality TLD** - .com is still king, but .io, .ai, and others have their place

## The NotRenewing Advantage

We make it simple to find and purchase expiring domains:

- **Fixed $99 pricing** - No haggling or uncertainty
- **Verified sellers** - DNS verification ensures legitimate ownership
- **Secure transfers** - Payment held until transfer is confirmed
- **AI-powered rankings** - Our algorithms surface the best opportunities

## Get Started

Ready to find your next domain? [Browse our listings](/browse) or [sign up](/signup) to start selling domains you're not renewing.
    `,
  },
  'domain-transfer-guide': {
    title: 'The Complete Guide to Domain Transfers',
    excerpt: 'Everything you need to know about transferring a domain between registrars.',
    date: '2025-01-28',
    readTime: 8,
    category: 'Guides',
    author: authors.sarah,
    content: `
## Understanding Domain Transfers

Transferring a domain from one person or registrar to another is a standard process, but it can seem complicated if you've never done it before. This guide walks you through everything you need to know.

## Before You Start

### For Sellers:
1. **Unlock your domain** - Remove the transfer lock in your registrar's dashboard
2. **Disable privacy protection** - WHOIS privacy must be off during transfer
3. **Get the auth code** - Also called EPP code or transfer key

### For Buyers:
1. **Have a registrar account ready** - GoDaddy, Namecheap, Cloudflare, etc.
2. **Know the process** - Each registrar has slightly different steps
3. **Be patient** - Transfers can take 5-7 days to complete

## Step-by-Step Transfer Process

### Step 1: Seller Initiates Transfer
The seller unlocks the domain and provides the authorization code. On NotRenewing, we facilitate this communication automatically.

### Step 2: Buyer Accepts Transfer
Using the auth code, the buyer initiates the incoming transfer at their registrar.

### Step 3: Confirmation
Both parties may need to confirm via email. Some registrars auto-approve after a waiting period.

### Step 4: Transfer Completes
The domain appears in the buyer's account. DNS settings may need to be reconfigured.

## Common Issues and Solutions

**Transfer rejected?**
- Check that the domain is unlocked
- Verify the auth code is correct
- Ensure the domain wasn't registered/transferred in the last 60 days

**Taking too long?**
- Standard transfers take 5-7 days
- Contact your registrar support if it's been longer

## NotRenewing Protection

When you buy through NotRenewing:
- Payment is held until you confirm receipt
- Automatic refund if transfer fails
- 72-hour transfer deadline for sellers
- Dispute resolution if issues arise

[Browse domains](/browse) with confidence knowing you're protected.
    `,
  },
  'what-makes-domain-valuable': {
    title: 'What Makes a Domain Name Valuable?',
    excerpt: 'Understanding domain valuation: length, keywords, TLD, age, and more.',
    date: '2025-01-25',
    readTime: 6,
    category: 'Domain Investing',
    author: authors.alex,
    content: `
## The Art and Science of Domain Valuation

Domain valuation isn't an exact science, but certain factors consistently affect a domain's worth. Understanding these can help you spot valuable domains at any price point.

## Key Valuation Factors

### 1. Length
Shorter is almost always better. Single-word domains are premium. Two-word domains are valuable. Beyond that, value drops significantly unless the phrase is highly memorable or brandable.

### 2. Memorability
Can someone remember your domain after hearing it once? Domains that are easy to spell, pronounce, and recall command higher prices.

### 3. Keywords
Domains containing popular search terms (like "insurance," "loans," "crypto") can be valuable for SEO purposes, though this matters less than it used to.

### 4. TLD (Top-Level Domain)
- **.com** - Still the most valuable and trusted
- **.io** - Popular for tech and startups
- **.ai** - Growing in value with AI boom
- **.net/.org** - Solid alternatives

### 5. Age
Older domains can carry more SEO weight and trust. A domain registered in 2005 may be worth more than one from 2023.

### 6. History
A clean history is essential. Domains previously used for spam or malware are devalued or worthless.

## The $99 Sweet Spot

On NotRenewing, all domains are $99. This creates interesting opportunities:

- Premium domains that sellers undervalue
- Brandable names at startup-friendly prices
- Niche keywords that could be worth much more
- Aged domains with potential

## Our AI Scoring

We use AI to evaluate domains and surface the best opportunities. Our scoring considers:
- Word patterns and brandability
- TLD quality
- Domain age
- Market trends

[Check out our top-rated domains](/browse?sort=score) to see what our AI thinks is valuable.
    `,
  },
  'best-domains-this-week': {
    title: 'Best Domains This Week: January 2025',
    excerpt: 'Our weekly roundup of the most interesting domains listed on NotRenewing.',
    date: '2025-01-24',
    readTime: 4,
    category: 'Weekly Picks',
    author: authors.mike,
    content: `
## This Week's Highlights

Every week, we spotlight some of the most interesting domains that hit NotRenewing. Whether you're looking to start a new project or invest in digital real estate, these are worth a look.

## Staff Picks

Our team manually reviews listings to find hidden gems. This week's picks:

*Check out our [Staff Picks](/browse?filter=staff-pick) for the latest selections.*

## Trending Categories

This week's most active categories:
- **AI & Tech** - As always, tech-related domains are hot
- **Finance** - Crypto and fintech names seeing interest
- **Health** - Wellness and healthcare domains popular

## Tips for This Week

1. **Act fast on good names** - Popular domains sell quickly at $99
2. **Check expiration dates** - Some gems are expiring soon
3. **Browse by category** - Use our new category filters to find relevant domains

## Coming Soon

We're working on new features:
- Email alerts for your favorite categories
- Saved searches
- Price history (if we ever add variable pricing)

[Browse this week's listings →](/browse?sort=newest)

---

*Want to be featured? [List your domains](/submit) for free during our beta!*
    `,
  },
};

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = blogPosts[slug];

  if (!post) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link href="/blog" className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </Link>

        <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
          <span className="bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full text-xs font-medium">
            {post.category}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {new Date(post.date).toLocaleDateString('en-US', { 
              month: 'long', 
              day: 'numeric',
              year: 'numeric'
            })}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {post.readTime} min read
          </span>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          {post.title}
        </h1>

        <p className="text-xl text-gray-600 mb-6">
          {post.excerpt}
        </p>

        <div className="flex items-center gap-3 mb-6">
          <Image
            src={post.author.headshot}
            alt={post.author.name}
            width={48}
            height={48}
            className="rounded-full"
          />
          <div>
            <p className="font-medium text-gray-900">{post.author.name}</p>
            <p className="text-sm text-gray-500">Author</p>
          </div>
        </div>

        <ShareButtons 
          domain={post.title} 
          url={`https://notrenewing.com/blog/${slug}`} 
        />
      </div>

      <article className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-600 prose-a:text-primary-600 prose-strong:text-gray-900">
        <div dangerouslySetInnerHTML={{ __html: parseMarkdown(post.content) }} />
      </article>

      <div className="mt-12 pt-8 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ready to find your next domain?</h3>
        <div className="flex gap-4">
          <Link href="/browse" className="bg-primary-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors">
            Browse Domains
          </Link>
          <Link href="/signup" className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors">
            Start Selling
          </Link>
        </div>
      </div>
    </div>
  );
}

// Simple markdown parser (basic - upgrade to MDX for full features)
function parseMarkdown(content: string): string {
  return content
    .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-8 mb-4">$1</h2>')
    .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold mt-6 mb-3">$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary-600 hover:underline">$1</a>')
    .replace(/^- (.*$)/gim, '<li class="ml-4">$1</li>')
    .replace(/^(\d+)\. (.*$)/gim, '<li class="ml-4">$1. $2</li>')
    .replace(/\n\n/g, '</p><p class="mb-4">')
    .replace(/^(?!<)/gm, '<p class="mb-4">')
    .replace(/<p class="mb-4"><h/g, '<h')
    .replace(/<\/h(\d)><\/p>/g, '</h$1>')
    .replace(/<p class="mb-4"><li/g, '<li')
    .replace(/<\/li><\/p>/g, '</li>')
    .replace(/<p class="mb-4">---<\/p>/g, '<hr class="my-8 border-gray-200" />');
}

// Generate static params for known blog posts
export async function generateStaticParams() {
  return Object.keys(blogPosts).map((slug) => ({ slug }));
}
