import { notFound } from 'next/navigation';
import { createServiceClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const supabase = await createServiceClient();
  const { data: page } = await supabase
    .from('pages')
    .select('title, meta_description')
    .eq('slug', 'terms')
    .single();

  return {
    title: page?.title || 'Terms of Service',
    description: page?.meta_description || 'Terms of Service for NotRenewing',
  };
}

export default async function TermsPage() {
  const supabase = await createServiceClient();

  const { data: page, error } = await supabase
    .from('pages')
    .select('*')
    .eq('slug', 'terms')
    .eq('is_published', true)
    .single();

  if (error || !page) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <article className="prose prose-gray max-w-none">
        <div dangerouslySetInnerHTML={{ __html: page.content }} />
      </article>
      <div className="mt-8 pt-8 border-t border-gray-200 text-sm text-gray-500">
        Last updated: {new Date(page.updated_at).toLocaleDateString()}
      </div>
    </div>
  );
}
