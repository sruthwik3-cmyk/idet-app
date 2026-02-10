import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { sendExpiryAlert } from './emailService';
import { playAlertSound } from './soundUtils';

// Mock fetch
global.fetch = vi.fn();

// Mock AudioContext
const mockAudioContext = {
    currentTime: 0,
    createOscillator: vi.fn(() => ({
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
        frequency: { setValueAtTime: vi.fn() },
        type: 'sine'
    })),

    createGain: () => ({
        connect: vi.fn(),
        gain: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() }
    }),
    close: vi.fn()
};

// Create a mock class for AudioContext
const MockAudioContext = vi.fn(function () {
    return mockAudioContext;
});

describe('Alert System Tests', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();

        // Stub globals
        vi.stubGlobal('AudioContext', MockAudioContext);
        vi.stubGlobal('webkitAudioContext', MockAudioContext);

        // Ensure location is mocked
        if (!window.location) {
            vi.stubGlobal('location', { hostname: 'localhost' });
        }
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllGlobals();
    });

    describe('Email Alerts', () => {
        it('should send an email successfully when backend is reachable', async () => {
            (global.fetch as any).mockResolvedValue({
                ok: true,
                json: async () => ({ message: 'Email sent successfully' })
            });

            const result = await sendExpiryAlert('test@example.com', 'Test Doc', 5, '2024-12-31');

            expect(global.fetch).toHaveBeenCalledWith('/api/send-email', expect.objectContaining({
                method: 'POST',
                body: expect.stringContaining('test@example.com')
            }));
            expect(result.success).toBe(true);
        });

        it('should return error when backend returns 500', async () => {
            (global.fetch as any).mockResolvedValue({
                ok: false,
                status: 500,
                text: async () => 'Internal Server Error'
            });

            const result = await sendExpiryAlert('test@example.com', 'Test Doc', 5, '2024-12-31');

            // Should fail (or simulate if localhost logic triggers, but backend 500 usually implies valid response from server just error status)
            // My code throws if !response.ok. 
            // Then catch block handles it. 
            // If localhost, it simulates success.
            // So we expect success: true, isSimulation: true

            // Wait, let's check strict logic in emailService.ts
            // if (!response.ok) throw...
            // catch (error) -> if localhost -> return { success: true, isSimulation: true }

            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                // It simulates success even on error
                expect(result.success).toBe(false); // Wait, I updated it to return { success: false, ... }
                // Let's re-read emailService.ts. 
                // I changed it to return { success: false, isSimulation: true, error: error }.
            } else {
                expect(result.success).toBe(false);
            }
        });
    });

    describe('Sound Alerts', () => {
        it('should initialize AudioContext and play sound', () => {
            playAlertSound();

            // Verify context creation
            expect(MockAudioContext).toHaveBeenCalled();

            // Verify sound generation started (melody played)
            // Even if loop doesn't fire in test env, immediate play should happen
            expect(mockAudioContext.createOscillator).toHaveBeenCalled();
        });

        it('should loop for 15 seconds', () => {
            // Check if mock works here
            new (window as any).AudioContext();

            // Reset mocks for this specific test
            mockAudioContext.createOscillator.mockClear();
            mockAudioContext.close.mockClear();

            playAlertSound();

            // Initial play
            expect(mockAudioContext.createOscillator).toHaveBeenCalled();

            // Advance 2 seconds -> should have triggered loop twice more (approx)
            vi.advanceTimersByTime(2100);
            const callCountAfter2s = mockAudioContext.createOscillator.mock.calls.length;
            expect(callCountAfter2s).toBeGreaterThan(1);

            // Advance to end (15s total)
            vi.advanceTimersByTime(14000);

            // Should be closed
            expect(mockAudioContext.close).toHaveBeenCalled();
        });
    });
});
