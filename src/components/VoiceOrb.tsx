import React from 'react';
import { Mic, MicOff } from 'lucide-react';

interface VoiceOrbProps {
    isListening: boolean;
    isSpeaking: boolean;
    toggleListening: () => void;
}

const VoiceOrb: React.FC<VoiceOrbProps> = ({ isListening, isSpeaking, toggleListening }) => {
    return (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 1000 }} className="voice-orb-wrapper">
            <style>{`
                @keyframes pulse-ring {
                    0% { transform: scale(0.8); opacity: 0.5; }
                    100% { transform: scale(2); opacity: 0; }
                }
                @keyframes wave {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                    100% { transform: scale(1); }
                }
                .orb-container {
                    position: relative;
                    width: 60px;
                    height: 60px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                .orb-circle {
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
                    box-shadow: 0 10px 25px rgba(99, 102, 241, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    z-index: 2;
                }
                .orb-ring {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    border: 2px solid #818cf8;
                    box-sizing: border-box;
                    animation: pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
                }
                .orb-speaking {
                    animation: wave 1s infinite ease-in-out;
                }
                /* On mobile, move voice orb above the FAB button */
                @media (max-width: 768px) {
                    .voice-orb-wrapper {
                        bottom: 1.5rem !important;
                        right: 1.25rem !important;
                    }
                }
            `}</style>

            <div className={`orb-container ${isSpeaking ? 'orb-speaking' : ''}`} onClick={toggleListening}>
                {isListening && <div className="orb-ring" style={{ animationDelay: '0s' }}></div>}
                {isListening && <div className="orb-ring" style={{ animationDelay: '0.5s' }}></div>}

                <div className="orb-circle" style={{
                    transform: isListening ? 'scale(1.1)' : 'scale(1)',
                    background: isListening
                        ? 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)' // Red/Orange when listening 
                        : 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)' // Purple/Blue when idle
                }}>
                    {isListening ? <Mic color="white" size={24} /> : <MicOff color="white" size={24} />}
                </div>
            </div>
            {isListening && (
                <div style={{
                    position: 'absolute',
                    top: '-40px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(0,0,0,0.8)',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    whiteSpace: 'nowrap',
                    fontSize: '12px',
                    pointerEvents: 'none'
                }}>
                    Listening...
                </div>
            )}
        </div>
    );
};

export default VoiceOrb;
