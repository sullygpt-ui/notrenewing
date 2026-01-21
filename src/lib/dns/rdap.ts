interface RDAPResponse {
  events?: Array<{
    eventAction: string;
    eventDate: string;
  }>;
  entities?: Array<{
    roles?: string[];
    vcardArray?: any[];
  }>;
}

interface DomainInfo {
  registrationDate: Date | null;
  expirationDate: Date | null;
  registrar: string | null;
  ageInMonths: number | null;
}

const RDAP_SERVERS: Record<string, string> = {
  com: 'https://rdap.verisign.com/com/v1/domain/',
  net: 'https://rdap.verisign.com/net/v1/domain/',
  org: 'https://rdap.publicinterestregistry.org/rdap/domain/',
  io: 'https://rdap.nic.io/domain/',
  ai: 'https://rdap.nic.ai/domain/',
};

export async function lookupDomain(domainName: string): Promise<DomainInfo> {
  const tld = domainName.split('.').pop()?.toLowerCase();

  if (!tld || !RDAP_SERVERS[tld]) {
    return {
      registrationDate: null,
      expirationDate: null,
      registrar: null,
      ageInMonths: null,
    };
  }

  try {
    const response = await fetch(`${RDAP_SERVERS[tld]}${domainName}`, {
      headers: {
        Accept: 'application/rdap+json',
      },
    });

    if (!response.ok) {
      throw new Error(`RDAP lookup failed: ${response.status}`);
    }

    const data: RDAPResponse = await response.json();

    let registrationDate: Date | null = null;
    let expirationDate: Date | null = null;
    let registrar: string | null = null;

    // Extract dates from events
    if (data.events) {
      for (const event of data.events) {
        if (event.eventAction === 'registration') {
          registrationDate = new Date(event.eventDate);
        } else if (event.eventAction === 'expiration') {
          expirationDate = new Date(event.eventDate);
        }
      }
    }

    // Extract registrar from entities
    if (data.entities) {
      for (const entity of data.entities) {
        if (entity.roles?.includes('registrar') && entity.vcardArray) {
          // vCard format: ['vcard', [['fn', {}, 'text', 'Registrar Name'], ...]]
          const vcard = entity.vcardArray;
          if (Array.isArray(vcard) && vcard.length > 1) {
            for (const item of vcard[1]) {
              if (item[0] === 'fn' && typeof item[3] === 'string') {
                registrar = item[3];
                break;
              }
            }
          }
        }
      }
    }

    // Calculate age in months
    let ageInMonths: number | null = null;
    if (registrationDate) {
      const now = new Date();
      const diffMs = now.getTime() - registrationDate.getTime();
      ageInMonths = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30.44));
    }

    return {
      registrationDate,
      expirationDate,
      registrar,
      ageInMonths,
    };
  } catch (error) {
    console.error('RDAP lookup error:', error);
    return {
      registrationDate: null,
      expirationDate: null,
      registrar: null,
      ageInMonths: null,
    };
  }
}

export function isEligibleForListing(domainInfo: DomainInfo): {
  eligible: boolean;
  reason?: string;
} {
  const now = new Date();

  // Check domain age (minimum 12 months)
  if (domainInfo.ageInMonths !== null && domainInfo.ageInMonths < 12) {
    return {
      eligible: false,
      reason: `Domain must be at least 12 months old. Current age: ${domainInfo.ageInMonths} months.`,
    };
  }

  // Check expiration (must be within 12 months)
  if (domainInfo.expirationDate) {
    const monthsUntilExpiration = Math.floor(
      (domainInfo.expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30.44)
    );

    if (monthsUntilExpiration < 0) {
      return {
        eligible: false,
        reason: 'Domain has already expired.',
      };
    }

    if (monthsUntilExpiration > 12) {
      return {
        eligible: false,
        reason: `Domain must expire within 12 months. Current expiration: ${monthsUntilExpiration} months away.`,
      };
    }

    // Warn if too close to expiration
    if (monthsUntilExpiration < 1) {
      return {
        eligible: false,
        reason: 'Domain expires too soon to safely complete a transaction.',
      };
    }
  }

  return { eligible: true };
}
