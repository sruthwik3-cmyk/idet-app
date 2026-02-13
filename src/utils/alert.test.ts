import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { sendExpiryAlert } from './emailService';
import { playAlertSound, resetAudioContextForTest } from './soundUtils';

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

const MockAudioContext = vi.fn(function () {
    return mockAudioContext;
});

describe('Alert System Tests', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
        resetAudioContextForTest();
        vi.stubGlobal('AudioContext', MockAudioContext);
        vi.stubGlobal('webkitAudioContext', MockAudioContext);
        if (typeof window !== 'undefined' && !window.location) {
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

            expect(global.fetch).toHaveBeenCalled();
            expect(result.success).toBe(true);
        });

        it('should return error when backend returns 500', async () => {
            (global.fetch as any).mockResolvedValue({
                ok: false,
                status: 500,
                text: async () => 'Internal Server Error',
                json: async () => ({ error: 'Internal Server Error' })
            });

            const result = await sendExpiryAlert('test@example.com', 'Test Doc', 5, '2024-12-31');
            expect(result.success).toBe(false);
        });
    });

    describe('Sound Alerts', () => {
        it('should initialize AudioContext and play sound', () => {
            playAlertSound();
            expect(MockAudioContext).toHaveBeenCalled();
            expect(mockAudioContext.createOscillator).toHaveBeenCalled();
        });
    });
});
