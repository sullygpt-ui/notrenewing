'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Input, Badge } from '@/components/ui';

const SUPPORTED_TLDS = ['com', 'net', 'org', 'io', 'ai'];

interface DomainValidation {
  domain: string;
  tld: string;
  valid: boolean;
  error?: string;
}

export default function SubmitPage() {
  const router = useRouter();
  const supabase = createClient();

  const [domains, setDomains] = useState('');
  const [validations, setValidations] = useState<DomainValidation[]>([]);
  const [step, setStep] = useState<'input' | 'review' | 'payment'>('input');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseDomains = (input: string): string[] => {
    return input
      .split(/[\n,]+/)
      .map((d) => d.trim().toLowerCase())
      .filter((d) => d.length > 0);
  };

  const validateDomain = (domain: string): DomainValidation => {
    const parts = domain.split('.');
    if (parts.length < 2) {
      return { domain, tld: '', valid: false, error: 'Invalid domain format' };
    }

    const tld = parts[parts.length - 1];
    if (!SUPPORTED_TLDS.includes(tld)) {
      return { domain, tld, valid: false, error: `TLD .${tld} not supported` };
    }

    const domainRegex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z]{2,})+$/;
    if (!domainRegex.test(domain)) {
      return { domain, tld, valid: false, error: 'Invalid domain name' };
    }

    return { domain, tld, valid: true };
  };

  const handleValidate = async () => {
    setLoading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    const domainList = parseDomains(domains);

    if (domainList.length === 0) {
      setError('Please enter at least one domain');
      setLoading(false);
      return;
    }

    if (domainList.length > 100) {
      setError('Maximum 100 domains per submission');
      setLoading(false);
      return;
    }

    // Check for duplicates in input
    const uniqueDomains = [...new Set(domainList)];
    if (uniqueDomains.length !== domainList.length) {
      setError('Duplicate domains found in your submission');
      setLoading(false);
      return;
    }

    // Validate format
    const validated = uniqueDomains.map(validateDomain);

    // Check if already listed
    const { data: existingListings } = await supabase
      .from('listings')
      .select('domain_name')
      .in('domain_name', uniqueDomains);

    const existingDomains = new Set(
      (existingListings as { domain_name: string }[] | null)?.map((l) => l.domain_name) || []
    );

    const finalValidations = validated.map((v) => {
      if (existingDomains.has(v.domain)) {
        return { ...v, valid: false, error: 'Already listed' };
      }
      return v;
    });

    setValidations(finalValidations);
    setStep('review');
    setLoading(false);
  };

  const validCount = validations.filter((v) => v.valid).length;
  const totalFee = validCount * 100; // $1 = 100 cents

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    const validDomains = validations.filter((v) => v.valid);

    // Create listings with pending_verification status
    const listings = validDomains.map((v) => ({
      seller_id: user.id,
      domain_name: v.domain,
      tld: v.tld,
      status: 'pending_verification' as const,
      verification_token: crypto.randomUUID().split('-')[0].toUpperCase(),
    }));

    const { data: createdListings, error: insertError } = await supabase
      .from('listings')
      .insert(listings as any)
      .select();

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    // TODO: Redirect to Stripe for $1/domain payment
    // For now, redirect to dashboard with success message
    router.push('/dashboard?submitted=' + validDomains.length);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Submit Domains</h1>
        <p className="text-gray-500 mt-1">List domains you don't plan to renew</p>
      </div>

      {step === 'input' && (
        <Card>
          <CardHeader>
            <CardTitle>Enter Your Domains</CardTitle>
            <CardDescription>
              Enter one domain per line, or separate with commas. Maximum 100 domains per submission.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">Supported TLDs:</p>
              <div className="flex flex-wrap gap-2">
                {SUPPORTED_TLDS.map((tld) => (
                  <Badge key={tld} variant="default">.{tld}</Badge>
                ))}
              </div>
            </div>

            <textarea
              className="w-full h-48 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="example.com&#10;another-domain.io&#10;my-domain.net"
              value={domains}
              onChange={(e) => setDomains(e.target.value)}
            />

            <div className="mt-4 flex justify-end">
              <Button onClick={handleValidate} isLoading={loading}>
                Validate Domains
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'review' && (
        <Card>
          <CardHeader>
            <CardTitle>Review Your Submission</CardTitle>
            <CardDescription>
              {validCount} of {validations.length} domains are eligible for listing
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="divide-y divide-gray-200 mb-6 max-h-96 overflow-y-auto">
              {validations.map((v, i) => (
                <div key={i} className="py-3 flex items-center justify-between">
                  <span className={v.valid ? 'text-gray-900' : 'text-gray-400 line-through'}>
                    {v.domain}
                  </span>
                  {v.valid ? (
                    <Badge variant="success">Eligible</Badge>
                  ) : (
                    <Badge variant="danger">{v.error}</Badge>
                  )}
                </div>
              ))}
            </div>

            {validCount > 0 && (
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-600">Listing fee ({validCount} domains)</span>
                  <span className="text-xl font-bold text-gray-900">
                    ${(totalFee / 100).toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-4">
                  $1 per domain. Non-refundable. You'll need to verify ownership via DNS TXT record.
                </p>
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setStep('input')}>
                Back
              </Button>
              {validCount > 0 && (
                <Button onClick={handleSubmit} isLoading={loading}>
                  Pay ${(totalFee / 100).toFixed(2)} & Submit
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
