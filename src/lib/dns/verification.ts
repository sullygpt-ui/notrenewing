import dns from 'dns';
import { promisify } from 'util';

const resolveTxt = promisify(dns.resolveTxt);

const VERIFICATION_PREFIX = 'notrenewing-verify=';

export interface VerificationResult {
  verified: boolean;
  token?: string;
  error?: string;
}

export async function verifyDomainOwnership(
  domainName: string,
  expectedToken: string
): Promise<VerificationResult> {
  try {
    // Check for TXT record at _notrenewing.domain.com
    const verificationDomain = `_notrenewing.${domainName}`;

    const txtRecords = await resolveTxt(verificationDomain);

    // TXT records come as arrays of arrays
    const flatRecords = txtRecords.flat();

    // Look for our verification token
    for (const record of flatRecords) {
      if (record.startsWith(VERIFICATION_PREFIX)) {
        const token = record.substring(VERIFICATION_PREFIX.length);
        if (token === expectedToken) {
          return { verified: true, token };
        }
      }
    }

    return {
      verified: false,
      error: 'Verification token not found. Please add the TXT record and try again.',
    };
  } catch (error: any) {
    if (error.code === 'ENOTFOUND' || error.code === 'ENODATA') {
      return {
        verified: false,
        error: 'No TXT record found. Please add the verification record.',
      };
    }

    console.error('DNS verification error:', error);
    return {
      verified: false,
      error: 'DNS lookup failed. Please try again later.',
    };
  }
}

export function generateVerificationToken(): string {
  return crypto.randomUUID().split('-')[0].toUpperCase();
}

export function getVerificationInstructions(domainName: string, token: string): string {
  return `To verify ownership of ${domainName}, add the following DNS TXT record:

Host/Name: _notrenewing.${domainName}
Type: TXT
Value: ${VERIFICATION_PREFIX}${token}

Note: DNS changes can take up to 48 hours to propagate, but usually complete within a few minutes.`;
}
