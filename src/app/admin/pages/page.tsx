import Link from 'next/link';
import { createServiceClient } from '@/lib/supabase/server';
import { Card, Badge, Button } from '@/components/ui';

export const dynamic = 'force-dynamic';

export default async function AdminPagesPage() {
  const supabase = await createServiceClient();

  const { data: pages } = await supabase
    .from('pages')
    .select('*')
    .order('title', { ascending: true });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Page Management</h1>
        <Link href="/admin/pages/new">
          <Button>Create New Page</Button>
        </Link>
      </div>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Page</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">URL</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Updated</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {pages && pages.length > 0 ? (
                pages.map((page: any) => (
                  <tr key={page.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{page.title}</p>
                      <p className="text-xs text-gray-500">{page.meta_description?.slice(0, 60)}...</p>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <a
                        href={`/${page.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:underline"
                      >
                        /{page.slug}
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      {page.is_published ? (
                        <Badge variant="success">Published</Badge>
                      ) : (
                        <Badge variant="warning">Draft</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(page.updated_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/admin/pages/${page.id}`}>
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No pages found. Create your first page.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
