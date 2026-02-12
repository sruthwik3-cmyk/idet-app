// Singleton AudioContext to manage browser autoplay policy
let audioContext: AudioContext | null = null;

const getAudioContext = () => {
    if (!audioContext) {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
            audioContext = new AudioContext();
        }
    }
    return audioContext;
};

// Helper for testing to reset the singleton
export const resetAudioContextForTest = () => {
    audioContext = null;
};

/**
 * Unlocks the AudioContext on first user interaction.
 * Call this function on a global click handler.
 */
export const unlockAudioContext = async () => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
        try {
            await ctx.resume();
            console.log("AudioContext resumed by user interaction");
        } catch (e) {
            console.error("Failed to unlock AudioContext:", e);
        }
    }
};

/**
 * Plays a pleasant musical melody (Alert Song).
 * Loops for approx 15 seconds.
 */
export const playAlertSound = () => {
    const ctx = getAudioContext();
    if (!ctx) {
        console.warn("AudioContext not supported");
        return;
    }

    // Ensure context is running (attempt resume if likely blocked, though unlockAudioContext should have handled it)
    if (ctx.state === 'suspended') {
        ctx.resume().catch(e => console.error("Auto-resume failed:", e));
    }

    // Extended Melody: "Success" Arpeggio + Descending Run
    // C5, E5, G5, C6, G5, E5, C5, D5, F5, A5, D6...
    const melody = [
        { note: 523.25, duration: 0.15, time: 0 },    // C5
        { note: 659.25, duration: 0.15, time: 0.15 }, // E5
        { note: 783.99, duration: 0.15, time: 0.30 }, // G5
        { note: 1046.50, duration: 0.30, time: 0.45 },// C6
        { note: 783.99, duration: 0.15, time: 0.75 }, // G5
        { note: 659.25, duration: 0.15, time: 0.90 }, // E5
        { note: 523.25, duration: 0.30, time: 1.05 }, // C5

        { note: 587.33, duration: 0.15, time: 1.50 }, // D5
        { note: 698.46, duration: 0.15, time: 1.65 }, // F5
        { note: 880.00, duration: 0.15, time: 1.80 }, // A5
        { note: 1174.66, duration: 0.40, time: 1.95 }, // D6
    ];

    const playTune = () => {
        const now = ctx.currentTime;
        melody.forEach(({ note, duration, time }) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine'; // Sine for smoother "beep" tone, or triangle for 8-bit game feel. Sine is cleaner.
            osc.frequency.setValueAtTime(note, now + time);

            // Envelope
            gain.gain.setValueAtTime(0, now + time);
            gain.gain.linearRampToValueAtTime(0.2, now + time + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, now + time + duration);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now + time);
            osc.stop(now + time + duration + 0.1);
        });
    };

    // Play immediately
    playTune();

    // Loop duration approx 2.5s -> repeat 5 times to cover ~12.5-15s
    let loopCount = 0;
    const maxLoops = 5;

    const intervalId = setInterval(() => {
        loopCount++;
        if (loopCount >= maxLoops) {
            clearInterval(intervalId);
            return;
        }
        playTune();
    }, 2800); // Wait a bit longer than the melody duration handling delays
};
