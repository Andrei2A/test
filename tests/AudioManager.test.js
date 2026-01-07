/**
 * AudioManager Unit Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AudioManager } from '../src/systems/AudioManager.js';

// Mock Web Audio API
const mockGainNode = {
    gain: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn()
    },
    connect: vi.fn()
};

const mockOscillator = {
    type: '',
    frequency: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn()
    },
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn()
};

const mockFilter = {
    type: '',
    frequency: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn()
    },
    connect: vi.fn()
};

const mockBufferSource = {
    buffer: null,
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn()
};

const mockAudioContext = {
    currentTime: 0,
    sampleRate: 44100,
    state: 'running',
    createGain: vi.fn(() => mockGainNode),
    createOscillator: vi.fn(() => mockOscillator),
    createBiquadFilter: vi.fn(() => mockFilter),
    createBuffer: vi.fn(() => ({
        getChannelData: vi.fn(() => new Float32Array(1000))
    })),
    createBufferSource: vi.fn(() => mockBufferSource),
    destination: {},
    resume: vi.fn(),
    close: vi.fn()
};

// Mock global AudioContext
global.AudioContext = vi.fn(() => mockAudioContext);
global.webkitAudioContext = vi.fn(() => mockAudioContext);

describe('AudioManager', () => {
    let audio;

    beforeEach(() => {
        vi.clearAllMocks();
        audio = new AudioManager();
    });

    describe('constructor', () => {
        it('should create with default values', () => {
            expect(audio.audioContext).toBeNull();
            expect(audio.masterVolume).toBe(0.5);
        });
    });

    describe('init()', () => {
        it('should create audio context', () => {
            audio.init();

            expect(audio.audioContext).toBe(mockAudioContext);
        });

        it('should create sounds', () => {
            audio.init();

            expect(audio.sounds.pistol).toBeDefined();
            expect(audio.sounds.shotgun).toBeDefined();
            expect(audio.sounds.empty).toBeDefined();
        });

        it('should return this for chaining', () => {
            const result = audio.init();

            expect(result).toBe(audio);
        });
    });

    describe('play()', () => {
        it('should play pistol sound', () => {
            audio.init();
            const spy = vi.spyOn(audio.sounds.pistol, 'play');

            audio.play('pistol');

            expect(spy).toHaveBeenCalled();
        });

        it('should play shotgun sound', () => {
            audio.init();
            const spy = vi.spyOn(audio.sounds.shotgun, 'play');

            audio.play('shotgun');

            expect(spy).toHaveBeenCalled();
        });

        it('should not throw for unknown sound', () => {
            audio.init();

            expect(() => audio.play('unknown')).not.toThrow();
        });
    });

    describe('setVolume()', () => {
        it('should set master volume', () => {
            audio.setVolume(0.8);

            expect(audio.masterVolume).toBe(0.8);
        });

        it('should clamp volume to 0-1 range', () => {
            audio.setVolume(1.5);
            expect(audio.masterVolume).toBe(1);

            audio.setVolume(-0.5);
            expect(audio.masterVolume).toBe(0);
        });
    });

    describe('resume()', () => {
        it('should resume suspended context', () => {
            audio.init();
            mockAudioContext.state = 'suspended';

            audio.resume();

            expect(mockAudioContext.resume).toHaveBeenCalled();
        });

        it('should not resume running context', () => {
            audio.init();
            mockAudioContext.state = 'running';
            mockAudioContext.resume.mockClear();

            audio.resume();

            expect(mockAudioContext.resume).not.toHaveBeenCalled();
        });
    });

    describe('dispose()', () => {
        it('should close audio context', () => {
            audio.init();

            audio.dispose();

            expect(mockAudioContext.close).toHaveBeenCalled();
            expect(audio.audioContext).toBeNull();
        });

        it('should handle null context', () => {
            expect(() => audio.dispose()).not.toThrow();
        });
    });

    describe('playGunshot()', () => {
        it('should create and play gunshot sound', () => {
            audio.init();

            audio.playGunshot(0.1, 800, 0.5);

            expect(mockAudioContext.createBuffer).toHaveBeenCalled();
            expect(mockAudioContext.createBufferSource).toHaveBeenCalled();
            expect(mockAudioContext.createBiquadFilter).toHaveBeenCalled();
            expect(mockAudioContext.createGain).toHaveBeenCalled();
        });

        it('should not throw without context', () => {
            expect(() => audio.playGunshot(0.1, 800, 0.5)).not.toThrow();
        });
    });

    describe('playClick()', () => {
        it('should create and play click sound', () => {
            audio.init();

            audio.playClick();

            expect(mockAudioContext.createOscillator).toHaveBeenCalled();
            expect(mockAudioContext.createGain).toHaveBeenCalled();
        });

        it('should not throw without context', () => {
            expect(() => audio.playClick()).not.toThrow();
        });
    });
});
