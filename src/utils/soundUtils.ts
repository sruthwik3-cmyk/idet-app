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
 * Stops any currently playing alert sound immediately.
 */
export const stopAlertSound = () => {
    if ((window as any).alertSoundInterval) {
        clearInterval((window as any).alertSoundInterval);
        (window as any).alertSoundInterval = null;
    }
};

/**
 * Plays a pleasant musical melody (Alert Song).
 * Loops for approx 15 seconds.
 * Returns true if sound started, false otherwise.
 */
export const playAlertSound = (): boolean => {
    const ctx = getAudioContext();
    if (!ctx) {
        console.error("[Sound] AudioContext NOT supported");
        return false;
    }

    console.log(`[Sound] playAlertSound called. Current state: ${ctx.state}`);

    if (ctx.state === 'suspended') {
        console.log("[Sound] Attempting to resume suspended context...");
        ctx.resume().then(() => {
            console.log(`[Sound] Context resumed successfully. New state: ${ctx.state}`);
            if (ctx.state === 'running') {
                _playMelody(ctx);
            } else {
                console.warn("[Sound] Context still suspended after resume attempt. Likely browser block.");
            }
        }).catch(err => {
            console.error("[Sound] Context resume failed:", err);
        });
        return false;
    }

    stopAlertSound();
    _playMelody(ctx);
    return true;
};

function _playMelody(ctx: AudioContext) {
    // Extended Melody: "Success" Arpeggio + Descending Run
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
        try {
            const now = ctx.currentTime;
            melody.forEach(({ note, duration, time }) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(note, now + time);

                // Envelope
                gain.gain.setValueAtTime(0, now + time);
                gain.gain.linearRampToValueAtTime(0.25, now + time + 0.05);
                gain.gain.exponentialRampToValueAtTime(0.001, now + time + duration);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(now + time);
                osc.stop(now + time + duration + 0.1);
            });
            console.log("[Sound] Melody playing");
        } catch (e) {
            console.error("[Sound] Error playing tune:", e);
        }
    };

    // Play immediately
    playTune();

    // Loop: repeat 5 times (~15 seconds total)
    let loopCount = 0;
    const maxLoops = 5;

    const intervalId = setInterval(() => {
        loopCount++;
        if (loopCount >= maxLoops) {
            clearInterval(intervalId);
            (window as any).alertSoundInterval = null;
            return;
        }
        playTune();
    }, 2800);

    (window as any).alertSoundInterval = intervalId;

    // Failsafe stop after 15 seconds
    setTimeout(() => {
        if ((window as any).alertSoundInterval === intervalId) {
            clearInterval(intervalId);
            (window as any).alertSoundInterval = null;
        }
    }, 15000);
}
