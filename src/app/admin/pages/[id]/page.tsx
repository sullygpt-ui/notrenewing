import { notFound } from 'next/navigation';
import { createServiceClient } from '@/lib/supabase/server';
import { PageEditor } from './editor';

export const dynamic = 'force-dynamic';

interface PageEditorPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminPageEditorPage({ params }: PageEditorPageProps) {
  const { id } = await params;
  const supabase = await createServiceClient();

  const { data: page, error } = await supabase
    .from('pages')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !page) {
    notFound();
  }

  return (
    <div>
      <PageEditor page={page} />
    </div>
  );
}
