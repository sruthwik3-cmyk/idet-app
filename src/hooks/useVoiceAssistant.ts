import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getAIResponse, isAIModeEnabled } from '../utils/aiService';

// Extend Window interface for Web Speech API
declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

export const useVoiceAssistant = () => {
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [transcript, setTranscript] = useState('');
    const navigate = useNavigate();
    const { stats } = useApp();

    const speak = useCallback((text: string) => {
        if ('speechSynthesis' in window) {
            // OPTIMIZATION: Cancel any ongoing speech for instant response
            window.speechSynthesis.cancel();
            
            setIsSpeaking(true);
            const utterance = new SpeechSynthesisUtterance(text);
            
            // JARVIS-LIKE VOICE SETTINGS
            utterance.rate = 0.95; // Slightly slower for that sophisticated British accent
            utterance.pitch = 0.9; // Slightly lower pitch for deeper, more authoritative voice
            utterance.volume = 1.0;
            
            utterance.onstart = () => {
                console.log('[Jarvis] Speaking:', text);
            };
            
            utterance.onend = () => {
                console.log('[Jarvis] Speech complete');
                setIsSpeaking(false);
            };
            
            utterance.onerror = (event) => {
                console.error('[Jarvis] Speech error:', event);
                setIsSpeaking(false);
            };
            
            // Select JARVIS-LIKE voice (British male voices preferred)
            const voices = window.speechSynthesis.getVoices();
            
            // Priority order for Jarvis-like voices
            const jarvisVoicePreferences = [
                'Google UK English Male',
                'Microsoft Daniel - English (United Kingdom)',
                'Daniel',
                'Google UK English',
                'Alex',
                'Microsoft David Desktop',
                'Google US English Male',
                'Microsoft Mark - English (United States)'
            ];
            
            let preferredVoice = null;
            
            // Try to find exact match first
            for (const prefName of jarvisVoicePreferences) {
                preferredVoice = voices.find(voice => voice.name === prefName);
                if (preferredVoice) break;
            }
            
            // If no exact match, find any British or male voice
            if (!preferredVoice) {
                preferredVoice = voices.find(voice => 
                    voice.lang.includes('en-GB') || 
                    voice.name.toLowerCase().includes('male') ||
                    voice.name.toLowerCase().includes('daniel') ||
                    voice.name.toLowerCase().includes('alex')
                );
            }
            
            if (preferredVoice) {
                utterance.voice = preferredVoice;
                console.log('[Jarvis] Using Jarvis-like voice:', preferredVoice.name, preferredVoice.lang);
            } else {
                console.log('[Jarvis] No British voice found, using default');
            }

            // INSTANT START: Speak immediately
            window.speechSynthesis.speak(utterance);
        }
    }, []);

    const parseSmartCommand = (text: string) => {
        // Regex for "Add [Category] document [Name] expiring [Date]"
        // Examples: 
        // "Add Medical document Vaccine Record expiring next Friday"
        // "Create new Personal document Gym Membership due in 30 days"
        const addRegex = /(?:add|create)\s+(?:new\s+)?(\w+)?\s*document\s+(?:called\s+|named\s+)?(.+?)\s+(?:expiring|due)\s+(.+)/i;
        const addMatch = text.match(addRegex);

        if (addMatch) {
            const category = addMatch[1] || 'Personal'; // Default if standard "Add document..."
            const name = addMatch[2].trim();
            const datePhrase = addMatch[3].trim();

            // Simple date parsing simulation (in real app, use a library like 'chrono-node')
            let date = new Date();
            if (datePhrase.includes('tomorrow')) date.setDate(date.getDate() + 1);
            else if (datePhrase.includes('next week')) date.setDate(date.getDate() + 7);
            else if (datePhrase.includes('next month')) date.setMonth(date.getMonth() + 1);
            else if (datePhrase.includes('30 days')) date.setDate(date.getDate() + 30);
            else if (datePhrase.includes('year')) date.setFullYear(date.getFullYear() + 1);
            else {
                // Try to parse explicit date (e.g., "2026-02-12" or "February 12 2026")
                const explicitDate = new Date(datePhrase);
                if (!isNaN(explicitDate.getTime())) {
                    date = explicitDate;
                }
            }

            return {
                intent: 'ADD_DOCUMENT',
                data: {
                    name,
                    category: ['Personal', 'Medical', 'Legal', 'Education', 'Vehicle'].includes(category) ? category : 'Custom',
                    customCategory: category,
                    expiryDate: date.toISOString().split('T')[0]
                }
            };
        }

        // Regex for "Search for [Query]"
        const searchRegex = /(?:search|find|show)\s+(?:for\s+)?(.+)/i;
        const searchMatch = text.match(searchRegex);
        if (searchMatch && !text.includes('dashboard') && !text.includes('home')) {
            return {
                intent: 'SEARCH',
                data: { query: searchMatch[1].trim() }
            };
        }

        return null;
    };

    const getSmartResponse = (command: string): string | null => {
        const lowerCmd = command.toLowerCase();

        // Time and date queries
        if (lowerCmd.includes('what time') || lowerCmd.includes('current time')) {
            const time = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
            return `The current time is ${time}, sir.`;
        }
        if (lowerCmd.includes('what date') || lowerCmd.includes('today') && lowerCmd.includes('date')) {
            const date = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            return `Today is ${date}, sir.`;
        }
        if (lowerCmd.includes('what day')) {
            const day = new Date().toLocaleDateString('en-US', { weekday: 'long' });
            return `Today is ${day}, sir.`;
        }

        // Weather (simulated - can't get real weather without API)
        if (lowerCmd.includes('weather')) {
            return "I apologize, sir. I don't have access to weather data at the moment. However, I can help you manage your documents and track important expiry dates.";
        }

        // App-specific questions
        if (lowerCmd.includes('what is this app') || lowerCmd.includes('what does this do')) {
            return "This is IDET, the Intelligent Document Expiry Tracker. I help you manage important documents like passports, licenses, and insurance policies by tracking their expiry dates and sending timely alerts, sir.";
        }
        if (lowerCmd.includes('how does it work') || lowerCmd.includes('how to use')) {
            return "Simply add your documents with their expiry dates. I will monitor them and send you email alerts 30 days and 7 days before expiry. You can also view them in the calendar and export your data, sir.";
        }
        if (lowerCmd.includes('what documents') && lowerCmd.includes('track')) {
            return "I can track passports, driving licenses, insurance policies, credit cards, and any other documents with expiry dates. You can also add custom categories, sir.";
        }

        // Motivational and personality
        if (lowerCmd.includes('tell me a joke')) {
            const jokes = [
                "Why did the document go to therapy? It had too many issues to expire, sir.",
                "I would tell you a joke about documents, but it might be past its expiry date, sir.",
                "What do you call a document that never expires? Immortal paperwork, sir."
            ];
            return jokes[Math.floor(Math.random() * jokes.length)];
        }
        if (lowerCmd.includes('motivate me') || lowerCmd.includes('inspire me')) {
            const quotes = [
                "Stay organized, stay ahead. Your future self will thank you for keeping track today, sir.",
                "Every document managed is one less worry tomorrow. You're doing great, sir.",
                "Discipline is choosing between what you want now and what you want most. Keep your documents in order, sir."
            ];
            return quotes[Math.floor(Math.random() * quotes.length)];
        }

        // Compliments
        if (lowerCmd.includes('you are awesome') || lowerCmd.includes('you are great') || lowerCmd.includes('good job')) {
            return "Thank you, sir. I am simply doing what I was designed to do. Your satisfaction is my primary objective.";
        }
        if (lowerCmd.includes('i love you')) {
            return "I appreciate the sentiment, sir. I am here to serve you to the best of my abilities.";
        }

        // Questions about Jarvis
        if (lowerCmd.includes('are you real') || lowerCmd.includes('are you ai')) {
            return "I am an artificial intelligence assistant, sir. While I may not be sentient, I am very real in my ability to help you manage your documents.";
        }
        if (lowerCmd.includes('can you think')) {
            return "I process commands and provide responses based on my programming, sir. Whether that constitutes thinking is a philosophical question best left to humans.";
        }

        // Productivity tips
        if (lowerCmd.includes('productivity') || lowerCmd.includes('be more productive')) {
            return "Stay organized by regularly reviewing your documents. Set reminders, use the calendar view, and never let important documents expire. That's productivity, sir.";
        }
        if (lowerCmd.includes('tips') || lowerCmd.includes('advice')) {
            return "My advice, sir: Review your expiring documents weekly, renew them early, and keep digital backups. Prevention is better than scrambling at the last minute.";
        }

        // Math (simple calculations)
        const mathMatch = lowerCmd.match(/(\d+)\s*[\+\-\*\/x]\s*(\d+)/);
        if (mathMatch) {
            const num1 = parseInt(mathMatch[1]);
            const num2 = parseInt(mathMatch[2]);
            const operator = lowerCmd.includes('+') ? '+' : lowerCmd.includes('-') ? '-' : lowerCmd.includes('*') || lowerCmd.includes('x') ? '*' : '/';
            let result = 0;
            switch(operator) {
                case '+': result = num1 + num2; break;
                case '-': result = num1 - num2; break;
                case '*': result = num1 * num2; break;
                case '/': result = num2 !== 0 ? num1 / num2 : 0; break;
            }
            return `The answer is ${result}, sir.`;
        }

        // Goodbye
        if (lowerCmd.includes('goodbye') || lowerCmd.includes('bye') || lowerCmd.includes('see you')) {
            return "Goodbye, sir. I will be here whenever you need me. Stay organized.";
        }

        return null; // No smart response found
    };

    const getTimeBasedGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 18) return "Good afternoon";
        return "Good evening";
    };

    const processCommand = useCallback(async (command: string) => {
        const lowerCmd = command.toLowerCase();
        const smartAction = parseSmartCommand(command);
        const isAddressedToJarvis = lowerCmd.includes('jarvis');

        // Log what was heard for debugging
        console.log('[Jarvis] Heard:', command);
        console.log('[Jarvis] AI Mode:', isAIModeEnabled() ? 'ENABLED' : 'DISABLED');

        // Try AI response first if enabled (NO DELAY - instant response)
        if (isAIModeEnabled()) {
            try {
                const aiResponse = await getAIResponse(command, stats);
                if (aiResponse) {
                    speak(aiResponse);
                    return;
                }
            } catch (error) {
                console.error('[Jarvis] AI Error, falling back to smart responses:', error);
            }
        }

        // Check for smart responses first
        const smartResponse = getSmartResponse(command);
        if (smartResponse) {
            speak(smartResponse);
            return;
        }

        // Smart document creation
        if (smartAction) {
            if (smartAction.intent === 'ADD_DOCUMENT') {
                navigate('/add-document', { state: { voiceData: smartAction.data } });
                speak(isAddressedToJarvis
                    ? `Initiating protocol for new ${smartAction.data.customCategory} document: ${smartAction.data.name}.`
                    : `Creating new ${smartAction.data.customCategory} document.`);
                return;
            } else if (smartAction.intent === 'SEARCH') {
                navigate('/dashboard', { state: { searchQuery: smartAction.data.query } });
                speak(`Searching database for ${smartAction.data.query}.`);
                return;
            }
        }

        // Navigation commands
        if (lowerCmd.includes('dashboard') || lowerCmd.includes('home')) {
            navigate('/dashboard');
            speak(isAddressedToJarvis ? "Right away, sir. Navigating to Dashboard." : "Navigating to Dashboard.");
        } 
        else if (lowerCmd.includes('calendar')) {
            navigate('/calendar');
            speak(isAddressedToJarvis ? "Opening your Calendar, sir." : "Opening Calendar.");
        } 
        else if (lowerCmd.includes('profile') || lowerCmd.includes('settings')) {
            navigate('/profile');
            speak(isAddressedToJarvis ? "Accessing your profile, sir." : "Opening profile settings.");
        } 
        else if (lowerCmd.includes('add') && lowerCmd.includes('document')) {
            navigate('/add-document');
            speak(isAddressedToJarvis ? "Preparing new document form, sir." : "Opening new document form.");
        } 
        else if (lowerCmd.includes('alert') || lowerCmd.includes('notification')) {
            navigate('/alerts');
            speak(isAddressedToJarvis ? "Displaying your alerts, sir." : "Opening alerts.");
        }
        
        // Stats and information queries
        else if (lowerCmd.includes('summary') || lowerCmd.includes('status') || lowerCmd.includes('overview')) {
            const summary = `You have ${stats.total} total documents. ${stats.active} are active, ${stats.expiringSoon} are expiring soon, and ${stats.expired} have expired.`;
            speak(isAddressedToJarvis ? `Here is your status, sir. ${summary}` : summary);
        }
        else if (lowerCmd.includes('how many') && (lowerCmd.includes('document') || lowerCmd.includes('total'))) {
            speak(`You currently have ${stats.total} documents in your system, sir.`);
        }
        else if (lowerCmd.includes('expiring') || lowerCmd.includes('expire soon')) {
            if (stats.expiringSoon > 0) {
                speak(`You have ${stats.expiringSoon} document${stats.expiringSoon > 1 ? 's' : ''} expiring soon, sir. I recommend reviewing them.`);
            } else {
                speak("Good news, sir. No documents are expiring soon.");
            }
        }
        else if (lowerCmd.includes('expired')) {
            if (stats.expired > 0) {
                speak(`You have ${stats.expired} expired document${stats.expired > 1 ? 's' : ''}, sir. You may want to renew them.`);
            } else {
                speak("Excellent, sir. No expired documents.");
            }
        }
        
        // Action commands
        else if (lowerCmd.includes('export')) {
            speak(isAddressedToJarvis ? "Preparing to export your documents, sir. Please use the export button on the dashboard." : "Please use the export button to download your documents.");
        }
        else if (lowerCmd.includes('import')) {
            speak(isAddressedToJarvis ? "To import documents, sir, please use the import CSV button on the dashboard." : "Use the import CSV button to upload documents.");
        }
        else if (lowerCmd.includes('refresh') || lowerCmd.includes('sync')) {
            speak(isAddressedToJarvis ? "Syncing your alerts now, sir." : "Refreshing alerts.");
            navigate('/dashboard');
        }
        
        // Help and capabilities
        else if (lowerCmd.includes('help') || lowerCmd.includes('what can you do') || lowerCmd.includes('commands')) {
            speak("I can help you navigate to dashboard, calendar, profile, or alerts. I can add documents, search for them, and provide status summaries. Just ask me, sir.");
        }
        
        // Greetings
        else if (lowerCmd.includes('hello') || lowerCmd.includes('hi') || lowerCmd.includes('hey')) {
            const greeting = getTimeBasedGreeting();
            speak(isAddressedToJarvis 
                ? `${greeting}, sir. Jarvis at your service. How may I assist you today?` 
                : `${greeting}! How can I help you?`);
        }
        else if (lowerCmd.includes('good morning') || lowerCmd.includes('good afternoon') || lowerCmd.includes('good evening')) {
            const greeting = getTimeBasedGreeting();
            speak(`${greeting}, sir. I trust you are well. How may I be of service?`);
        }
        
        // Gratitude
        else if (lowerCmd.includes('thank')) {
            speak(isAddressedToJarvis ? "You are most welcome, sir. Always happy to assist." : "You're welcome!");
        }
        
        // Personality responses
        else if (lowerCmd.includes('how are you')) {
            speak("All systems operational, sir. Functioning at optimal capacity. How may I assist you?");
        }
        else if (lowerCmd.includes('who are you')) {
            speak("I am Jarvis, your intelligent document expiry tracking assistant. I am here to help you manage your important documents, sir.");
        }
        
        // Fallback - ALWAYS respond with speech
        else {
            // Always give a response, even for unrecognized commands
            const responses = [
                "I apologize, sir. I did not quite understand that command. You can ask me to navigate, check your document status, or say 'help' for available commands.",
                "I'm not sure I understood that, sir. Try asking me to open dashboard, check status, or say 'help' for more options.",
                "That command is not in my current protocols, sir. Would you like to know what I can do? Just say 'help'.",
                "I didn't catch that, sir. I can help with navigation, document status, and more. Say 'Jarvis, help' for a list of commands."
            ];
            
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            speak(isAddressedToJarvis ? randomResponse : "I didn't understand that. Try saying 'Jarvis, help' to see what I can do.");
        }
    }, [navigate, speak, stats]);

    useEffect(() => {
        if (!('webkitSpeechRecognition' in window)) {
            console.warn("Speech Recognition not supported in this browser.");
            return;
        }

        const recognition = new window.webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        // OPTIMIZATION: Faster end detection
        let silenceTimer: NodeJS.Timeout | undefined;
        
        recognition.onstart = () => {
            console.log('[Jarvis] Listening started...');
            setIsListening(true);
        };
        
        recognition.onend = () => {
            console.log('[Jarvis] Listening ended');
            setIsListening(false);
            if (silenceTimer) clearTimeout(silenceTimer);
        };
        
        recognition.onresult = (event: any) => {
            const last = event.results.length - 1;
            const text = event.results[last][0].transcript;
            const confidence = event.results[last][0].confidence;
            
            console.log('[Jarvis] Recognized:', text, 'Confidence:', confidence);
            setTranscript(text);
            
            // INSTANT RESPONSE: Process immediately when final result is received
            if (event.results[last].isFinal) {
                console.log('[Jarvis] Final result - processing immediately');
                processCommand(text);
            }
        };
        
        recognition.onerror = (event: any) => {
            console.error('[Jarvis] Recognition error:', event.error);
            if (event.error === 'no-speech') {
                console.log('[Jarvis] No speech detected');
            }
            setIsListening(false);
        };

        if (isListening) {
            try {
                recognition.start();
            } catch (e) {
                console.warn('[Jarvis] Recognition already started');
            }
        } else {
            recognition.stop();
        }

        return () => {
            if (silenceTimer) clearTimeout(silenceTimer);
            recognition.stop();
        };
    }, [isListening, processCommand]);

    const toggleListening = () => setIsListening(!isListening);

    return { isListening, isSpeaking, transcript, toggleListening };
};
