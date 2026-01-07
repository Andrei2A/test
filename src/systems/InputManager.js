/**
 * InputManager - Centralized input handling
 * Manages keyboard, mouse, and pointer lock
 */

import { eventBus } from '../state/EventBus.js';
import { gameState } from '../state/GameState.js';
import { EVENTS } from '../config/constants.js';

export class InputManager {
    constructor() {
        this.keys = new Map();
        this.mouseButtons = new Map();
        this.isPointerLocked = false;
        this.onShoot = null;
        this.onWeaponSwitch = null;
        this.onShopToggle = null;
        this.onCameraToggle = null;
    }

    /**
     * Initialize input listeners
     * @param {HTMLElement} canvas - Canvas element for pointer lock
     */
    init(canvas) {
        this.canvas = canvas;

        document.addEventListener('keydown', this.onKeyDown.bind(this));
        document.addEventListener('keyup', this.onKeyUp.bind(this));
        document.addEventListener('mousedown', this.onMouseDown.bind(this));
        document.addEventListener('mouseup', this.onMouseUp.bind(this));
        document.addEventListener('pointerlockchange', this.onPointerLockChange.bind(this));

        return this;
    }

    /**
     * Request pointer lock
     */
    requestPointerLock() {
        if (this.canvas) {
            this.canvas.requestPointerLock();
        }
    }

    /**
     * Exit pointer lock
     */
    exitPointerLock() {
        document.exitPointerLock();
    }

    /**
     * Handle key down
     * @param {KeyboardEvent} e
     */
    onKeyDown(e) {
        this.keys.set(e.code, true);

        const state = gameState.getState();

        // Always handle these keys
        switch (e.code) {
            case 'KeyB':
                if (state.isPlaying) {
                    this.onShopToggle?.();
                }
                break;

            case 'Escape':
                if (state.shopOpen) {
                    this.onShopToggle?.();
                }
                break;
        }

        // Only handle these when playing and shop is closed
        if (state.isPlaying && !state.shopOpen) {
            switch (e.code) {
                case 'Digit1':
                    this.onWeaponSwitch?.('pistol');
                    break;

                case 'Digit2':
                    this.onWeaponSwitch?.('shotgun');
                    break;

                case 'KeyV':
                    this.onCameraToggle?.();
                    break;
            }
        }
    }

    /**
     * Handle key up
     * @param {KeyboardEvent} e
     */
    onKeyUp(e) {
        this.keys.set(e.code, false);
    }

    /**
     * Handle mouse down
     * @param {MouseEvent} e
     */
    onMouseDown(e) {
        this.mouseButtons.set(e.button, true);

        const state = gameState.getState();

        if (e.button === 0 && state.isPlaying && !state.shopOpen && this.isPointerLocked) {
            this.onShoot?.();
        }
    }

    /**
     * Handle mouse up
     * @param {MouseEvent} e
     */
    onMouseUp(e) {
        this.mouseButtons.set(e.button, false);
    }

    /**
     * Handle pointer lock change
     */
    onPointerLockChange() {
        this.isPointerLocked = document.pointerLockElement === this.canvas;
    }

    /**
     * Check if key is pressed
     * @param {string} code - Key code
     * @returns {boolean}
     */
    isKeyPressed(code) {
        return this.keys.get(code) || false;
    }

    /**
     * Check if mouse button is pressed
     * @param {number} button - Mouse button (0 = left, 1 = middle, 2 = right)
     * @returns {boolean}
     */
    isMousePressed(button) {
        return this.mouseButtons.get(button) || false;
    }

    /**
     * Set shoot callback
     * @param {Function} callback
     */
    setShootCallback(callback) {
        this.onShoot = callback;
    }

    /**
     * Set weapon switch callback
     * @param {Function} callback
     */
    setWeaponSwitchCallback(callback) {
        this.onWeaponSwitch = callback;
    }

    /**
     * Set shop toggle callback
     * @param {Function} callback
     */
    setShopToggleCallback(callback) {
        this.onShopToggle = callback;
    }

    /**
     * Set camera toggle callback
     * @param {Function} callback
     */
    setCameraToggleCallback(callback) {
        this.onCameraToggle = callback;
    }

    /**
     * Dispose of listeners
     */
    dispose() {
        document.removeEventListener('keydown', this.onKeyDown.bind(this));
        document.removeEventListener('keyup', this.onKeyUp.bind(this));
        document.removeEventListener('mousedown', this.onMouseDown.bind(this));
        document.removeEventListener('mouseup', this.onMouseUp.bind(this));
        document.removeEventListener('pointerlockchange', this.onPointerLockChange.bind(this));
    }
}

export default InputManager;
