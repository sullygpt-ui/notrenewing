import { createServiceClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui';
import { FeedbackActions } from './actions';

export const dynamic = 'force-dynamic';

export default async function AdminFeedbackPage() {
  const supabase = await createServiceClient();

  const { data: feedback } = await supabase
    .from('feedback')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Beta Feedback</h1>
        <span className="text-sm text-gray-500">
          {feedback?.length || 0} submissions
        </span>
      </div>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Feedback</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {feedback && feedback.length > 0 ? (
                feedback.map((item: any) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {new Date(item.created_at).toLocaleDateString()}{' '}
                      {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {item.email || <span className="text-gray-400 italic">No email</span>}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xl">
                      <p className="whitespace-pre-wrap">{item.feedback}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <FeedbackActions feedbackId={item.id} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    No feedback submitted yet
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
