import OpenAI from 'openai';

// Toggle between FREE (Option 1) and AI-POWERED (Option 2)
export const AI_MODE_ENABLED = true; // Set to true to enable OpenAI

// Initialize OpenAI client (only if API key is provided)
let openai: OpenAI | null = null;

if (AI_MODE_ENABLED && import.meta.env.VITE_OPENAI_API_KEY) {
    openai = new OpenAI({
        apiKey: import.meta.env.VITE_OPENAI_API_KEY,
        dangerouslyAllowBrowser: true // Note: In production, use a backend proxy
    });
}

export const getAIResponse = async (userMessage: string, stats: any): Promise<string | null> => {
    if (!AI_MODE_ENABLED || !openai) {
        return null; // Fall back to smart responses
    }

    try {
        const systemPrompt = `You are Jarvis, an intelligent AI assistant for IDET (Intelligent Document Expiry Tracker).

Your personality:
- Professional, polite, and helpful
- Address the user as "sir" when appropriate
- Speak like Tony Stark's Jarvis from Iron Man
- Keep responses VERY concise (1-2 sentences max)
- Be witty but respectful
- Respond INSTANTLY - no delays

Current user stats:
- Total documents: ${stats.total}
- Active documents: ${stats.active}
- Expiring soon: ${stats.expiringSoon}
- Expired: ${stats.expired}

You can help with:
1. Answering questions about the app
2. Providing document management advice
3. General knowledge questions
4. Calculations and conversions
5. Time and date information
6. Motivational quotes
7. Light conversation

CRITICAL: Keep responses brief and natural for voice output. Maximum 2 sentences.`;

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userMessage }
            ],
            max_tokens: 100, // Reduced from 150 for faster response
            temperature: 0.7,
            stream: false // Ensure we get complete response quickly
        });

        const response = completion.choices[0]?.message?.content || null;
        console.log('[AI Service] Response generated:', response);
        return response;
    } catch (error) {
        console.error('[AI Service] Error:', error);
        return null; // Fall back to smart responses
    }
};

export const isAIModeEnabled = () => AI_MODE_ENABLED && !!openai;
