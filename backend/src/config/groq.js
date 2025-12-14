import Groq from 'groq-sdk';

export function createGroqClient(apiKey) {
  if (!apiKey || apiKey === 'gsk-your_groq_api_key' || apiKey.startsWith('gsk-your_')) {
    console.warn('GROQ_API_KEY not set or is placeholder; AI features disabled.');
    return null;
  }

  try {
    return new Groq({ apiKey });
  } catch (err) {
    console.warn('Failed to initialize Groq client:', err.message);
    return null;
  }
}

export const groqClient = createGroqClient(process.env.GROQ_API_KEY);

// Supported Groq models for different use cases
export const GROQ_MODELS = {
  // Fast and efficient for most tasks
  LLAMA3_8B: 'llama3-8b-8192',
  
  // High quality for complex analysis  
  LLAMA3_70B: 'llama3-70b-8192',
  
  // Latest model variants
  LLAMA3_1_8B: 'llama-3.1-8b-instant',
  LLAMA3_1_70B: 'llama-3.1-70b-versatile',
  
  // Default model for complaint analysis (fast and reliable)
  DEFAULT: 'llama-3.1-8b-instant'
};