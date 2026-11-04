const leChat = { label: 'Mistral AI · Le Chat inference results, July 2025', url: 'https://mistral.ai/news/our-contribution-to-a-global-environmental-standard-for-ai/' };
const chatGPT = { label: 'Sam Altman · The Gentle Singularity, June 2025', url: 'https://blog.samaltman.com/the-gentle-singularity' };

export const chatGroup = {
  id: 'ai-chat-reports', label: 'AI chat · provider reports', category: 'Digital',
  unit: 'per reported response', singular: 'response', plural: 'responses', defaultAmount: 1,
  sourceNote: 'The two providers describe different workloads and report different system boundaries. Each record links its original disclosure.',
  sources: [],
  options: [
    {
      id: 'mistral-le-chat-400', label: 'Mistral Le Chat · 400-token response', categoryPath: ['Digital', 'AI', 'Chat responses'],
      evidenceLabel: 'Provider study', replacementBasis: 'mistral-le-chat-400',
      values: { carbon: 1.14 / 1000, inferenceWater: 45 / 1000, mineralResources: 0.16 },
      reasoning: 'Mistral reports 1.14 g CO₂e, 45 mL of water and 0.16 mg of antimony equivalent for one 400-token response. Grams and millilitres are divided by 1,000 to give kilograms and litres. The mineral indicator is already in mg Sb eq.',
      note: 'The July 2025 life-cycle study models marginal inference for Le Chat, including upstream impacts such as server manufacture. The user’s device is excluded. The study reports model training separately.',
      defaultUsage: { amount: 5, times: 1, period: 'daily', description: 'Assumes five Le Chat responses of 400 tokens each per day, using the July 2025 study.' },
      sources: [leChat]
    },
    {
      id: 'chatgpt-query-2025', label: 'ChatGPT · June 2025 average query', categoryPath: ['Digital', 'AI', 'Chat responses'],
      evidenceLabel: 'Limited disclosure', replacementBasis: 'chatgpt-query-2025',
      energyScope: 'Scope undisclosed',
      values: { energy: 0.34 / 1000, unspecifiedWater: 0.000085 * 3.785411784 },
      reasoning: 'Sam Altman reported 0.34 Wh and 0.000085 gallons per average ChatGPT query. We divide Wh by 1,000 for kWh and assume US liquid gallons at 3.785411784 L each. The post gives no model mix, response length, sampling method or water boundary.',
      defaultUsage: { amount: 5, times: 1, period: 'daily', description: 'Assumes five ChatGPT queries per day at the average reported in June 2025.' },
      sources: [chatGPT]
    }
  ]
};
