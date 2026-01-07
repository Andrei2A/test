/**
 * Engine - Main game engine class
 * Handles initialization, game loop, and coordination
 */

import * as THREE from 'three';
import { eventBus } from '../state/EventBus.js';
import { gameState } from '../state/GameState.js';
import { EVENTS } from '../config/constants.js';

export class Engine {
    constructor() {
        this.renderer = null;
        this.clock = new THREE.Clock();
        this.isRunning = false;
        this.systems = [];
        this.scene = null;
        this.camera = null;
    }

    /**
     * Initialize the engine
     * @param {HTMLElement} container - Container element for renderer
     */
    init(container) {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(this.renderer.domElement);

        window.addEventListener('resize', this.onResize.bind(this));

        return this;
    }

    /**
     * Set the scene to render
     * @param {THREE.Scene} scene - The scene
     */
    setScene(scene) {
        this.scene = scene;
        return this;
    }

    /**
     * Set the camera
     * @param {THREE.Camera} camera - The camera
     */
    setCamera(camera) {
        this.camera = camera;
        return this;
    }

    /**
     * Register a system for updates
     * @param {Object} system - System with update(deltaTime) method
     */
    addSystem(system) {
        this.systems.push(system);
        return this;
    }

    /**
     * Remove a system
     * @param {Object} system - System to remove
     */
    removeSystem(system) {
        const index = this.systems.indexOf(system);
        if (index > -1) {
            this.systems.splice(index, 1);
        }
        return this;
    }

    /**
     * Start the game loop
     */
    start() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.clock.start();
        eventBus.emit(EVENTS.GAME_STARTED);
        this.loop();
    }

    /**
     * Stop the game loop
     */
    stop() {
        this.isRunning = false;
        this.clock.stop();
    }

    /**
     * Pause the game
     */
    pause() {
        gameState.setState('isPaused', true);
    }

    /**
     * Resume the game
     */
    resume() {
        gameState.setState('isPaused', false);
    }

    /**
     * Main game loop
     */
    loop() {
        if (!this.isRunning) return;

        requestAnimationFrame(this.loop.bind(this));

        const deltaTime = this.clock.getDelta();
        const state = gameState.getState();

        if (state.isPlaying && !state.isPaused && !state.shopOpen) {
            // Update all systems
            for (const system of this.systems) {
                if (system.update) {
                    system.update(deltaTime);
                }
            }
        }

        // Always render
        if (this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    /**
     * Handle window resize
     */
    onResize() {
        if (this.camera) {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
        }

        if (this.renderer) {
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        }
    }

    /**
     * Get the renderer DOM element
     * @returns {HTMLCanvasElement}
     */
    getCanvas() {
        return this.renderer?.domElement;
    }

    /**
     * Dispose of all resources
     */
    dispose() {
        this.stop();
        this.systems = [];

        if (this.renderer) {
            this.renderer.dispose();
        }

        window.removeEventListener('resize', this.onResize.bind(this));
    }
}

export default Engine;
