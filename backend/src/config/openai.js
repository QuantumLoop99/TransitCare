import OpenAI from 'openai';

export function createOpenAIClient(apiKey) {
  if (!apiKey || apiKey === 'sk-your_openai_api_key') {
    console.warn('OPENAI_API_KEY not set or is placeholder; AI features disabled.');
    return null;
  }

  try {
    return new OpenAI({ apiKey });
  } catch (err) {
    console.warn('Failed to initialize OpenAI client:', err.message);
    return null;
  }
}

export const openaiClient = createOpenAIClient(process.env.OPENAI_API_KEY);
