import { NextRequest, NextResponse } from 'next/server';
import { lookupDomain, isEligibleForListing } from '@/lib/dns/rdap';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const domain = searchParams.get('domain');

  if (!domain) {
    return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
  }

  try {
    const domainInfo = await lookupDomain(domain);
    const eligibility = isEligibleForListing(domainInfo);

    return NextResponse.json({
      domain,
      registrationDate: domainInfo.registrationDate?.toISOString() || null,
      expirationDate: domainInfo.expirationDate?.toISOString() || null,
      registrar: domainInfo.registrar,
      ageInMonths: domainInfo.ageInMonths,
      eligible: eligibility.eligible,
      reason: eligibility.reason,
    });
  } catch (error) {
    console.error('Domain validation error:', error);
    return NextResponse.json(
      { error: 'Failed to validate domain' },
      { status: 500 }
    );
  }
}
