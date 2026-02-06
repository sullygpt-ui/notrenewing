'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Input, Badge } from '@/components/ui';

const SUPPORTED_TLDS = ['com', 'net', 'org', 'io', 'ai'];
const MAX_ACTIVE_LISTINGS = 25;

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
  const [activeListingCount, setActiveListingCount] = useState(0);

  const availableSlots = MAX_ACTIVE_LISTINGS - activeListingCount;

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

    // Fetch current active listing count
    const { count } = await supabase
      .from('listings')
      .select('*', { count: 'exact', head: true })
      .eq('seller_id', user.id)
      .in('status', ['active', 'pending_verification', 'pending_payment']);

    const currentCount = count || 0;
    setActiveListingCount(currentCount);

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

    const slotsAvailable = MAX_ACTIVE_LISTINGS - currentCount;
    if (slotsAvailable <= 0) {
      setError(`You have reached the maximum of ${MAX_ACTIVE_LISTINGS} active listings. Please wait for some to sell or expire before listing more.`);
      setLoading(false);
      return;
    }

    if (domainList.length > slotsAvailable) {
      setError(`You can only list ${slotsAvailable} more domain${slotsAvailable === 1 ? '' : 's'}. You currently have ${currentCount} active listing${currentCount === 1 ? '' : 's'}.`);
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

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    const validDomains = validations.filter((v) => v.valid);

    try {
      // Step 1: Create listings
      const submitResponse = await fetch('/api/domains/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domains: validDomains.map((v) => ({ domain: v.domain, tld: v.tld })),
        }),
      });

      const submitData = await submitResponse.json();

      if (!submitResponse.ok) {
        setError(submitData.error || 'Failed to submit domains');
        setLoading(false);
        return;
      }

      // Redirect to dashboard - listings are free
      router.push(`/dashboard?submitted=success&count=${validDomains.length}`);
    } catch (err) {
      setError('Failed to submit domains. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Submit Domains</h1>
        <p className="text-gray-500 mt-1">List domains you don't plan to renew</p>
      </div>

      {step === 'input' && (
        <>
          {/* Requirements & Instructions */}
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-blue-900 mb-3">Before You Submit</h3>

              <div className="space-y-4 text-sm text-blue-800">
                <div>
                  <h4 className="font-medium mb-1">Domain Requirements</h4>
                  <ul className="list-disc list-inside space-y-1 text-blue-700">
                    <li>Domain must be <strong>at least 24 months old</strong></li>
                    <li>Domain must expire <strong>within the next 12 months</strong></li>
                    <li>Supported extensions: .com, .net, .org, .io, .ai (more coming soon)</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-1">Ownership Verification</h4>
                  <p className="text-blue-700 mb-2">
                    After submitting, you&apos;ll need to verify ownership by adding a DNS TXT record:
                  </p>
                  <div className="bg-blue-100 rounded p-3 font-mono text-xs">
                    <p><span className="text-blue-600">Host:</span> _notrenewing.yourdomain.com</p>
                    <p><span className="text-blue-600">Type:</span> TXT</p>
                    <p><span className="text-blue-600">Value:</span> notrenewing-verify=YOUR_TOKEN</p>
                  </div>
                  <p className="text-blue-700 mt-2 text-xs">
                    You&apos;ll receive a unique token after submitting. DNS changes typically propagate within minutes but can take up to 48 hours.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-1">Listing Duration</h4>
                  <p className="text-blue-700">
                    Each listing is active for <strong>30 days</strong>. If your domain doesn&apos;t sell, you can relist it.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-1">Pricing</h4>
                  <p className="text-blue-700">
                    <strong className="text-green-700">Free to list!</strong> All domains sell for a fixed <strong>$99</strong>. We deduct <strong>$2</strong> from the sale before transferring to you.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-1">Listing Limit</h4>
                  <p className="text-blue-700">
                    Maximum of <strong>{MAX_ACTIVE_LISTINGS} active listings</strong> per account.
                    {activeListingCount > 0 && ` You currently have ${activeListingCount} listing${activeListingCount === 1 ? '' : 's'}.`}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-1">Use-Case / Pitch</h4>
                  <p className="text-blue-700">
                    Each domain gets an <strong>AI-generated use-case</strong> to help buyers understand its potential. You can edit or customize this from your dashboard after submission.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-1">Quality Standards</h4>
                  <p className="text-blue-700">
                    We reserve the right to remove any listing at any time for any reason. We curate our marketplace to maintain quality and ensure buyers find valuable domains.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

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
        </>
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
                  <span className="text-gray-600">Listing fee ({validCount} domain{validCount === 1 ? '' : 's'})</span>
                  <span className="text-xl font-bold text-green-600">
                    FREE
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-4">
                  Free to list! $2 is deducted from the sale. You&apos;ll need to verify ownership via DNS TXT record.
                </p>
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setStep('input')}>
                Back
              </Button>
              {validCount > 0 && (
                <Button onClick={handleSubmit} isLoading={loading}>
                  Submit Domains
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
