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

    const processCommand = useCallback((command: string) => {
        const lowerCmd = command.toLowerCase();
        console.log('Voice Command:', lowerCmd);

        // Optional: Check if addressed as Jarvis
        const isAddressedToJarvis = lowerCmd.includes('jarvis');

        // If strict mode is desired, we could return here if !isAddressedToJarvis
        // But for better UX, we'll process anyway, just changing the response tone maybe.

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
