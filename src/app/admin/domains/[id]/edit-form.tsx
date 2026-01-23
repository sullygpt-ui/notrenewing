'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';

interface EditListingFormProps {
  listing: {
    id: string;
    domain_name: string;
    tld: string;
    registrar: string | null;
    expiration_date: string | null;
    ai_score: number | null;
    ai_tier: string | null;
  };
}

export function EditListingForm({ listing }: EditListingFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    registrar: listing.registrar || '',
    expiration_date: listing.expiration_date ? listing.expiration_date.split('T')[0] : '',
    ai_score: listing.ai_score?.toString() || '',
    ai_tier: listing.ai_tier || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: listing.id,
          action: 'update_fields',
          value: {
            registrar: formData.registrar || null,
            expiration_date: formData.expiration_date || null,
            ai_score: formData.ai_score ? parseInt(formData.ai_score) : null,
            ai_tier: formData.ai_tier || null,
          },
        }),
      });

      if (response.ok) {
        router.refresh();
        alert('Listing updated successfully');
      } else {
        const data = await response.json();
        alert(data.error || 'Update failed');
      }
    } catch (err) {
      alert('Update failed');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Registrar</label>
        <input
          type="text"
          value={formData.registrar}
          onChange={(e) => setFormData({ ...formData, registrar: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="e.g., GoDaddy, Namecheap"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date</label>
        <input
          type="date"
          value={formData.expiration_date}
          onChange={(e) => setFormData({ ...formData, expiration_date: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">AI Score (0-100)</label>
        <input
          type="number"
          min="0"
          max="100"
          value={formData.ai_score}
          onChange={(e) => setFormData({ ...formData, ai_score: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">AI Tier</label>
        <select
          value={formData.ai_tier}
          onChange={(e) => setFormData({ ...formData, ai_tier: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Select tier...</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Saving...' : 'Save Changes'}
      </Button>
    </form>
  );
}
