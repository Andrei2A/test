/**
 * AudioManager - Handles game audio
 * Manages sound effects using Web Audio API
 */

export class AudioManager {
    constructor() {
        this.audioContext = null;
        this.sounds = {};
        this.masterVolume = 0.5;
    }

    /**
     * Initialize audio context (must be called after user interaction)
     */
    init() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        this.createSounds();
        return this;
    }

    /**
     * Create synthesized sound effects
     */
    createSounds() {
        // Pistol shot sound parameters
        this.sounds.pistol = {
            play: () => this.playGunshot(0.1, 800, 0.5)
        };

        // Shotgun shot sound parameters
        this.sounds.shotgun = {
            play: () => this.playGunshot(0.15, 400, 0.7)
        };

        // Empty click
        this.sounds.empty = {
            play: () => this.playClick()
        };
    }

    /**
     * Play a gunshot sound (synthesized)
     * @param {number} duration - Sound duration
     * @param {number} frequency - Base frequency
     * @param {number} volume - Volume (0-1)
     */
    playGunshot(duration, frequency, volume) {
        if (!this.audioContext) return;

        const now = this.audioContext.currentTime;

        // Create noise for gunshot
        const bufferSize = this.audioContext.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        // Generate noise with decay
        for (let i = 0; i < bufferSize; i++) {
            const decay = Math.exp(-i / (bufferSize * 0.1));
            data[i] = (Math.random() * 2 - 1) * decay;
        }

        const noiseSource = this.audioContext.createBufferSource();
        noiseSource.buffer = buffer;

        // Low-pass filter for "boom" effect
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(frequency, now);
        filter.frequency.exponentialRampToValueAtTime(100, now + duration);

        // Gain for volume control
        const gainNode = this.audioContext.createGain();
        gainNode.gain.setValueAtTime(volume * this.masterVolume, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

        // Connect nodes
        noiseSource.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        // Play
        noiseSource.start(now);
        noiseSource.stop(now + duration);
    }

    /**
     * Play empty click sound
     */
    playClick() {
        if (!this.audioContext) return;

        const now = this.audioContext.currentTime;
        const duration = 0.05;

        const oscillator = this.audioContext.createOscillator();
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(1000, now);
        oscillator.frequency.exponentialRampToValueAtTime(500, now + duration);

        const gainNode = this.audioContext.createGain();
        gainNode.gain.setValueAtTime(0.2 * this.masterVolume, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.start(now);
        oscillator.stop(now + duration);
    }

    /**
     * Play a sound by name
     * @param {string} name - Sound name (pistol, shotgun, empty)
     */
    play(name) {
        if (this.sounds[name]) {
            this.sounds[name].play();
        }
    }

    /**
     * Set master volume
     * @param {number} volume - Volume (0-1)
     */
    setVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
    }

    /**
     * Resume audio context (needed after user gesture)
     */
    resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    /**
     * Dispose audio resources
     */
    dispose() {
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
    }
}

export default AudioManager;
