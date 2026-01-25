'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';

export function FeedbackActions({ feedbackId }: { feedbackId: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this feedback?')) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch('/api/admin/feedback', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: feedbackId }),
      });

      if (response.ok) {
        router.refresh();
      } else {
        alert('Failed to delete feedback');
      }
    } catch (error) {
      alert('Failed to delete feedback');
    }
    setDeleting(false);
  };

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleDelete}
      disabled={deleting}
    >
      {deleting ? 'Deleting...' : 'Delete'}
    </Button>
  );
}
