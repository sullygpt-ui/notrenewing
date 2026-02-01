import { createClient } from '@supabase/supabase-js';

const RDAP_SERVERS: Record<string, string> = {
  com: 'https://rdap.verisign.com/com/v1/domain/',
  net: 'https://rdap.verisign.com/net/v1/domain/',
  org: 'https://rdap.publicinterestregistry.org/rdap/domain/',
  io: 'https://rdap.nic.io/domain/',
  ai: 'https://rdap.nic.ai/domain/',
};

interface RDAPResponse {
  events?: Array<{ eventAction: string; eventDate: string }>;
  entities?: Array<{ roles?: string[]; vcardArray?: any[] }>;
}

async function lookupDomain(domainName: string) {
  const tld = domainName.split('.').pop()?.toLowerCase();
  if (!tld || !RDAP_SERVERS[tld]) return null;

  try {
    const response = await fetch(`${RDAP_SERVERS[tld]}${domainName}`, {
      headers: { Accept: 'application/rdap+json' },
    });
    if (!response.ok) return null;

    const data: RDAPResponse = await response.json();
    let registrationDate: Date | null = null;
    let expirationDate: Date | null = null;
    let registrar: string | null = null;

    if (data.events) {
      for (const event of data.events) {
        if (event.eventAction === 'registration') registrationDate = new Date(event.eventDate);
        else if (event.eventAction === 'expiration') expirationDate = new Date(event.eventDate);
      }
    }

    if (data.entities) {
      for (const entity of data.entities) {
        if (entity.roles?.includes('registrar') && entity.vcardArray?.[1]) {
          for (const item of entity.vcardArray[1]) {
            if (item[0] === 'fn' && typeof item[3] === 'string') {
              registrar = item[3];
              break;
            }
          }
        }
      }
    }

    let ageInMonths: number | null = null;
    if (registrationDate) {
      const diffMs = Date.now() - registrationDate.getTime();
      ageInMonths = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30.44));
    }

    return { expirationDate, registrar, ageInMonths };
  } catch (e) {
    console.error(`RDAP failed for ${domainName}:`, e);
    return null;
  }
}

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get all listings missing RDAP data
  const { data: listings, error } = await supabase
    .from('listings')
    .select('id, domain_name')
    .is('domain_age_months', null);

  if (error) {
    console.error('Failed to fetch listings:', error);
    return;
  }

  console.log(`Found ${listings?.length || 0} listings to update`);

  for (const listing of listings || []) {
    console.log(`Looking up ${listing.domain_name}...`);
    const info = await lookupDomain(listing.domain_name);
    
    if (info) {
      const { error: updateError } = await supabase
        .from('listings')
        .update({
          domain_age_months: info.ageInMonths,
          expiration_date: info.expirationDate?.toISOString() || null,
          registrar: info.registrar,
        })
        .eq('id', listing.id);

      if (updateError) {
        console.error(`Failed to update ${listing.domain_name}:`, updateError);
      } else {
        console.log(`✓ ${listing.domain_name}: ${info.ageInMonths}mo, exp ${info.expirationDate?.toISOString().split('T')[0]}, ${info.registrar}`);
      }
    } else {
      console.log(`✗ ${listing.domain_name}: No RDAP data`);
    }
    
    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 500));
  }

  console.log('Done!');
}

main();
