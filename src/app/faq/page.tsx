import { notFound } from 'next/navigation';
import { createServiceClient } from '@/lib/supabase/server';
import { FAQAccordion } from './faq-accordion';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const supabase = await createServiceClient();
  const { data: page } = await supabase
    .from('pages')
    .select('title, meta_description')
    .eq('slug', 'faq')
    .single();

  return {
    title: page?.title || 'FAQ',
    description: page?.meta_description || 'Frequently Asked Questions about NotRenewing',
  };
}

export default async function FAQPage() {
  const supabase = await createServiceClient();

  const { data: page, error } = await supabase
    .from('pages')
    .select('*')
    .eq('slug', 'faq')
    .eq('is_published', true)
    .single();

  if (error || !page) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
        <p className="text-gray-600">Find answers to common questions about NotRenewing</p>
        <p className="text-gray-600 mt-6 text-left">
          NotRenewing.com isn&apos;t a premium marketplace—it&apos;s your last shot at getting something for domains you&apos;re about to drop anyway. If you&apos;ve tried selling elsewhere without luck and renewal time is approaching, list it here. Someone might see value you missed, or maybe it just didn&apos;t find the right buyer yet. No guarantees, but it beats letting it expire for nothing. Think of this as the domain equivalent of a clearance rack—not because the domains are bad, but because the clock&apos;s run out on your patience or budget.
        </p>
      </div>

      <FAQAccordion content={page.content} />

      <div className="mt-12 pt-8 border-t border-gray-200 text-center">
        <p className="text-gray-600 mb-4">Still have questions?</p>
        <a
          href="mailto:support@notrenewing.com"
          className="text-primary-600 font-medium hover:underline"
        >
          Contact Support
        </a>
      </div>
    </div>
  );
}
