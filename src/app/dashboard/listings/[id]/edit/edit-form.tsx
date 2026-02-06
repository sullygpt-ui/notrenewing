'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Wand2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';
import type { Listing } from '@/types/database';

interface EditListingFormProps {
  listing: Listing;
}

const MAX_USE_CASE_CHARS = 80;

export function EditListingForm({ listing }: EditListingFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    registrar: listing.registrar || '',
    expiration_date: listing.expiration_date ? listing.expiration_date.split('T')[0] : '',
    use_case: listing.use_case || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`/api/listings/${listing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrar: formData.registrar || null,
          expiration_date: formData.expiration_date || null,
          use_case: formData.use_case || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Update failed');
      }

      setSuccess(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateUseCase = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ai/use-case', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: listing.id }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate');
      }
      
      const data = await response.json();
      setFormData(prev => ({ ...prev, use_case: data.useCase }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate');
    } finally {
      setIsGenerating(false);
    }
  };

  const charsRemaining = MAX_USE_CASE_CHARS - formData.use_case.length;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{listing.domain_name}</CardTitle>
              <p className="text-sm text-gray-500 mt-1">Edit listing details</p>
            </div>
            <Badge
              variant={
                listing.status === 'active' ? 'success' :
                listing.status === 'pending_verification' ? 'warning' :
                listing.status === 'pending_payment' ? 'danger' :
                'default'
              }
            >
              {listing.status.replace(/_/g, ' ')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Registrar */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Registrar
              </label>
              <input
                type="text"
                value={formData.registrar}
                onChange={(e) => setFormData({ ...formData, registrar: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., GoDaddy, Namecheap, Porkbun"
              />
              <p className="text-xs text-gray-400 mt-1">Where is this domain registered?</p>
            </div>

            {/* Expiration Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiration Date
              </label>
              <input
                type="date"
                value={formData.expiration_date}
                onChange={(e) => setFormData({ ...formData, expiration_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-400 mt-1">When does your registration expire?</p>
            </div>

            {/* Use Case */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Use Case
                </label>
                <button
                  type="button"
                  onClick={handleGenerateUseCase}
                  disabled={isGenerating}
                  className="inline-flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-700 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-3 h-3" />
                      Generate with AI
                    </>
                  )}
                </button>
              </div>
              <input
                type="text"
                value={formData.use_case}
                onChange={(e) => setFormData({ ...formData, use_case: e.target.value.slice(0, MAX_USE_CASE_CHARS) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., Launch your next SaaS startup"
              />
              <div className="flex justify-between text-xs mt-1">
                <p className="text-gray-400">A short pitch for potential buyers</p>
                <span className={charsRemaining < 10 ? 'text-red-500' : 'text-gray-400'}>
                  {charsRemaining} characters left
                </span>
              </div>
            </div>

            {/* Domain Info (read-only) */}
            <div className="pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Domain Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">TLD:</span>
                  <span className="ml-2 text-gray-900">{listing.tld}</span>
                </div>
                {listing.domain_age_months !== null && (
                  <div>
                    <span className="text-gray-500">Age:</span>
                    <span className="ml-2 text-gray-900">
                      {listing.domain_age_months < 12 
                        ? `${listing.domain_age_months} months`
                        : `${Math.floor(listing.domain_age_months / 12)} year${Math.floor(listing.domain_age_months / 12) > 1 ? 's' : ''}`
                      }
                    </span>
                  </div>
                )}
                {listing.ai_score !== null && (
                  <div>
                    <span className="text-gray-500">AI Score:</span>
                    <span className="ml-2 text-gray-900">{listing.ai_score}/100</span>
                  </div>
                )}
                {listing.ai_tier && (
                  <div>
                    <span className="text-gray-500">Tier:</span>
                    <Badge variant={listing.ai_tier === 'high' ? 'success' : listing.ai_tier === 'medium' ? 'warning' : 'default'} className="ml-2">
                      {listing.ai_tier}
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                Listing updated successfully!
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-3">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
              <Link href="/dashboard">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
