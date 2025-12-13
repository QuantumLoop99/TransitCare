import { openaiClient } from '../config/openai.js';

export async function prioritizeComplaint(complaint, client = openaiClient) {
  const prompt = `
    Analyze this public transport complaint and determine its priority level:

    Title: ${complaint.title}
    Description: ${complaint.description}
    Category: ${complaint.category}
    Date: ${complaint.dateTime}
    Location: ${complaint.location || 'Not specified'}
    Vehicle: ${complaint.vehicleNumber || 'Not specified'}

    Consider factors like:
    - Safety implications
    - Service disruption impact
    - Number of affected passengers
    - Urgency of resolution needed
    - Emotional sentiment of the complaint

    Respond with JSON only:
    {
      "priority": "high|medium|low",
      "reasoning": "brief explanation",
      "sentiment": -1 to 1,
      "confidence": 0 to 1,
      "suggestedCategory": "suggested category if different"
    }
  `;

  try {
    if (!client) {
      return {
        priority: 'medium',
        reasoning: 'AI disabled or misconfigured, defaulting to medium',
        sentiment: 0,
        confidence: 0,
      };
    }

    const completion = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an AI assistant specialized in analyzing public transport complaints. Always respond with valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        }
      ],
      max_tokens: 300,
      temperature: 0.3,
    });

    const analysis = JSON.parse(completion.choices[0].message.content);
    return analysis;
  } catch (error) {
    if (error.code === 'insufficient_quota' || error.status === 429) {
      console.warn('OpenAI API quota exceeded, using default priority');
    } else {
      console.error('OpenAI API error:', error.message || error);
    }
    return {
      priority: 'medium',
      reasoning: 'AI analysis unavailable, using default priority',
      sentiment: 0,
      confidence: 0,
    };
  }
}
