import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export interface DomainScore {
  score: number; // 0-100
  tier: 'high' | 'medium' | 'low';
  reasoning: string;
}

const SCORING_PROMPT = `You are a domain name evaluator for a marketplace. Your job is to score domain names based on their likelihood to attract buyer interest. This is NOT a valuation - you're predicting buyer appeal at a fixed $99 price point.

Score from 0-100 based on these factors:

POSITIVE SIGNALS (increase score):
- Short length (under 10 chars is great, under 15 is good)
- Easy to spell and pronounce
- Memorable and brandable
- Contains common business words (app, tech, hub, etc.)
- .com extension (highest value)
- Single dictionary word
- Two-word combinations that flow well
- Industry relevance (finance, health, tech, etc.)
- No hyphens
- No numbers

NEGATIVE SIGNALS (decrease score):
- Hyphens (significant penalty)
- Numbers (penalty unless meaningful like "24" or "360")
- Hard to spell or pronounce
- Very long (over 20 chars)
- Random letter combinations
- Looks like spam or typosquatting
- Potential trademark issues (contains brand names)
- Unusual TLDs for the domain type

SCORING GUIDELINES:
- 80-100: Exceptional - Short, memorable, brandable, premium TLD
- 60-79: Good - Solid domain with clear appeal
- 40-59: Average - Functional but not remarkable
- 20-39: Below average - Limited appeal
- 0-19: Poor - Spam-like or serious issues

Respond with ONLY a JSON object in this exact format:
{"score": <number>, "tier": "<high|medium|low>", "reasoning": "<brief 1-2 sentence explanation>"}

Tier assignment:
- high: score >= 70
- medium: score >= 40 and < 70
- low: score < 40`;

export async function scoreDomain(domainName: string): Promise<DomainScore> {
  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 256,
      messages: [
        {
          role: 'user',
          content: `${SCORING_PROMPT}\n\nDomain to evaluate: ${domainName}`,
        },
      ],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

    // Parse the JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const result = JSON.parse(jsonMatch[0]);

    // Validate and normalize the result
    const score = Math.max(0, Math.min(100, Math.round(result.score)));
    const tier = score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low';

    return {
      score,
      tier,
      reasoning: result.reasoning || 'No reasoning provided',
    };
  } catch (error) {
    console.error('AI scoring error:', error);
    // Return a default score on error
    return {
      score: 50,
      tier: 'medium',
      reasoning: 'Unable to score - default applied',
    };
  }
}

export async function scoreDomainBatch(domainNames: string[]): Promise<Map<string, DomainScore>> {
  const results = new Map<string, DomainScore>();

  // Process in parallel with a concurrency limit
  const concurrencyLimit = 5;
  const chunks: string[][] = [];

  for (let i = 0; i < domainNames.length; i += concurrencyLimit) {
    chunks.push(domainNames.slice(i, i + concurrencyLimit));
  }

  for (const chunk of chunks) {
    const promises = chunk.map(async (domain) => {
      const score = await scoreDomain(domain);
      results.set(domain, score);
    });

    await Promise.all(promises);
  }

  return results;
}
