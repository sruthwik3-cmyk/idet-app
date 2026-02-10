/**
 * Plays a pleasant musical melody using the Web Audio API.
 * This function creates a sequence of oscillators to generate a short, happy tune.
 */
export const playAlertSound = () => {
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) {
            console.warn("AudioContext not found on window");
            return;
        }
        console.log("AudioContext found, creating instance");
        const ctx = new AudioContext();
        console.log("AudioContext instance created");

        // Tune: C5, E5, G5, A5, C6 (Major 6th Arpeggio with high C) -> Happy/Success feel
        const playMelody = () => {
            console.log("playMelody called");
            try {
                const now = ctx.currentTime;
                const melody = [
                    { note: 523.25, duration: 0.1, time: 0 },    // C5
                    { note: 659.25, duration: 0.1, time: 0.1 },  // E5
                    { note: 783.99, duration: 0.1, time: 0.2 },  // G5
                    { note: 880.00, duration: 0.1, time: 0.3 },  // A5
                    { note: 1046.50, duration: 0.4, time: 0.4 }  // C6 (Longer final note)
                ];

                melody.forEach(({ note, duration, time }) => {
                    console.log(`Creating oscillator for note ${note}`);
                    const osc = ctx.createOscillator();
                    if (!osc) {
                        console.error("osc creation failed (returned null/undefined)");
                        return;
                    }
                    const gain = ctx.createGain();

                    osc.type = 'triangle'; // 'triangle' gives a slightly softer, flute-like tone than 'sine'
                    osc.frequency.setValueAtTime(note, now + time);

                    // Envelope for each note to make it sound musical (attack and release)
                    gain.gain.setValueAtTime(0, now + time);
                    gain.gain.linearRampToValueAtTime(0.15, now + time + 0.05); // Attack
                    gain.gain.exponentialRampToValueAtTime(0.001, now + time + duration); // Release

                    osc.connect(gain);
                    gain.connect(ctx.destination);

                    osc.start(now + time);
                    osc.stop(now + time + duration);
                });
            } catch (err) {
                console.error("Error in playMelody:", err);
            }
        };

        // Play immediately
        playMelody();

        // Loop every 1 second for 15 seconds
        const intervalId = setInterval(() => {
            console.log("Interval triggered");
            playMelody();
        }, 1000);

        // Stop after 15 seconds
        setTimeout(() => {
            console.log("Stopping alert sound");
            clearInterval(intervalId);
            // Close context to free resources
            setTimeout(() => {
                console.log("Closing AudioContext");
                ctx.close()
            }, 1000);
        }, 15000);

    } catch (error) {
        console.error('Failed to play alert sound:', error);
    }
};
