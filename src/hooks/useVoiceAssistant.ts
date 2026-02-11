import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

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
            setIsSpeaking(true);
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.onend = () => setIsSpeaking(false);
            // Select a nice voice if available
            const voices = window.speechSynthesis.getVoices();
            const preferredVoice = voices.find(voice => voice.name.includes('Google') || voice.name.includes('Female'));
            if (preferredVoice) utterance.voice = preferredVoice;

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

            return {
                intent: 'ADD_DOCUMENT',
                data: {
                    name,
                    category: ['Personal', 'Financial', 'Medical', 'Legal', 'Education', 'Vehicle'].includes(category) ? category : 'Custom',
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

    const processCommand = useCallback((command: string) => {
        const lowerCmd = command.toLowerCase();
        const smartAction = parseSmartCommand(command);
        const isAddressedToJarvis = lowerCmd.includes('jarvis');

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

        if (lowerCmd.includes('dashboard') || lowerCmd.includes('home')) {
            navigate('/dashboard');
            speak(isAddressedToJarvis ? "Right away, sir. Navigating to Dashboard." : "Navigating to Dashboard.");
        } else if (lowerCmd.includes('calendar')) {
            navigate('/calendar');
            speak(isAddressedToJarvis ? "Opening your Calendar, sir." : "Opening Calendar.");
        } else if (lowerCmd.includes('profile') || lowerCmd.includes('settings')) {
            navigate('/profile');
            speak("Accessing user profile.");
        } else if (lowerCmd.includes('add') && lowerCmd.includes('document')) {
            navigate('/add-document');
            speak(isAddressedToJarvis ? "Preparing new document form, sir." : "Opening new document form.");
        } else if (lowerCmd.includes('summary') || lowerCmd.includes('status')) {
            const summary = `You have ${stats.total} total documents. ${stats.expiringSoon} are expiring soon and ${stats.expired} have expired.`;
            speak(summary);
        } else if (lowerCmd.includes('alert') || lowerCmd.includes('notification')) {
            navigate('/alerts');
            speak("Displaying recent alerts.");
        } else if (lowerCmd.includes('hello') || lowerCmd.includes('hi') || lowerCmd.includes('hey')) {
            speak("Hello, sir. Jarvis here. I am ready to assist you.");
        } else if (lowerCmd.includes('thank')) {
            speak("You are most welcome, sir.");
        } else {
            // Fallback
            if (isAddressedToJarvis) {
                speak("I am afraid I do not know how to do that yet, sir.");
            }
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

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onresult = (event: any) => {
            const last = event.results.length - 1;
            const text = event.results[last][0].transcript;
            setTranscript(text);
            processCommand(text);
        };

        if (isListening) {
            try {
                recognition.start();
            } catch (e) {
                // Already started
            }
        } else {
            recognition.stop();
        }

        return () => {
            recognition.stop();
        };
    }, [isListening, processCommand]);

    const toggleListening = () => setIsListening(!isListening);

    return { isListening, isSpeaking, transcript, toggleListening };
};
