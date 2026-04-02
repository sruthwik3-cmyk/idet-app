// Jarvis Voice Service - Iron Man Style Voice
// Uses ElevenLabs API for high-quality British AI voice

interface VoiceConfig {
    useAPI: boolean;
    apiKey: string | null;
    voiceId: string; // ElevenLabs voice ID for British male voice
}

const config: VoiceConfig = {
    useAPI: !!import.meta.env.VITE_ELEVENLABS_API_KEY,
    apiKey: import.meta.env.VITE_ELEVENLABS_API_KEY || null,
    voiceId: 'TxGEqnHWrfWFTfGW9XjX' // Josh - British male voice (Jarvis-like)
};

// Alternative voice IDs you can try:
// 'TxGEqnHWrfWFTfGW9XjX' - Josh (British, sophisticated)
// 'pNInz6obpgDQGcFmaJgB' - Adam (Deep, authoritative)
// 'VR6AewLTigWG4xSOukaG' - Arnold (British, professional)

export const speakWithJarvisVoice = async (text: string): Promise<boolean> => {
    // If API is configured, use ElevenLabs for authentic Jarvis voice
    if (config.useAPI && config.apiKey) {
        try {
            console.log('[Jarvis Voice] Using ElevenLabs API for authentic voice');
            
            const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${config.voiceId}`, {
                method: 'POST',
                headers: {
                    'Accept': 'audio/mpeg',
                    'Content-Type': 'application/json',
                    'xi-api-key': config.apiKey
                },
                body: JSON.stringify({
                    text: text,
                    model_id: 'eleven_monolingual_v1',
                    voice_settings: {
                        stability: 0.5,
                        similarity_boost: 0.75,
                        style: 0.5,
                        use_speaker_boost: true
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`ElevenLabs API error: ${response.status}`);
            }

            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            
            return new Promise((resolve) => {
                audio.onended = () => {
                    URL.revokeObjectURL(audioUrl);
                    resolve(true);
                };
                audio.onerror = () => {
                    console.error('[Jarvis Voice] Audio playback error');
                    resolve(false);
                };
                audio.play().catch(err => {
                    console.error('[Jarvis Voice] Play error:', err);
                    resolve(false);
                });
            });
        } catch (error) {
            console.error('[Jarvis Voice] ElevenLabs error:', error);
            return false;
        }
    }
    
    // Fallback to browser's best British voice
    return false;
};

export const isJarvisVoiceAvailable = (): boolean => {
    return config.useAPI && !!config.apiKey;
};

// Get best browser voice for Jarvis (fallback)
export const getBestJarvisVoice = (): SpeechSynthesisVoice | null => {
    const voices = window.speechSynthesis.getVoices();
    
    // Priority order for Jarvis-like voices
    const jarvisVoicePreferences = [
        'Google UK English Male',
        'Microsoft Daniel - English (United Kingdom)',
        'Daniel',
        'Google UK English',
        'Alex',
        'Microsoft David Desktop - English (United Kingdom)',
        'Microsoft George - English (United Kingdom)',
        'Google US English Male',
        'Microsoft Mark - English (United States)'
    ];
    
    // Try exact match first
    for (const prefName of jarvisVoicePreferences) {
        const voice = voices.find(v => v.name === prefName);
        if (voice) {
            console.log('[Jarvis Voice] Found browser voice:', voice.name);
            return voice;
        }
    }
    
    // Find any British or male voice
    const britishVoice = voices.find(voice => 
        voice.lang.includes('en-GB') || 
        voice.name.toLowerCase().includes('male') ||
        voice.name.toLowerCase().includes('daniel') ||
        voice.name.toLowerCase().includes('alex') ||
        voice.name.toLowerCase().includes('george')
    );
    
    if (britishVoice) {
        console.log('[Jarvis Voice] Found British voice:', britishVoice.name);
        return britishVoice;
    }
    
    console.log('[Jarvis Voice] No British voice found, using default');
    return null;
};
