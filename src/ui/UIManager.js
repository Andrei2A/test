/**
 * UIManager - Central UI coordination
 * Manages all UI components and screens
 */

import { HUD } from './HUD.js';
import { Shop } from './Shop.js';
import { Inventory } from './Inventory.js';
import { eventBus } from '../state/EventBus.js';
import { gameState } from '../state/GameState.js';
import { EVENTS } from '../config/constants.js';

export class UIManager {
    constructor() {
        this.hud = null;
        this.shop = null;
        this.inventory = null;

        this.screens = {
            lockScreen: null,
            gameOver: null
        };

        this.onStart = null;
        this.onRestart = null;
    }

    /**
     * Initialize all UI components
     * @param {Object} callbacks - Callback functions
     */
    init(callbacks = {}) {
        this.onStart = callbacks.onStart;
        this.onRestart = callbacks.onRestart;

        // Initialize components
        this.hud = new HUD().init();
        this.shop = new Shop().init(callbacks.onPurchase, callbacks.onShopClose);
        this.inventory = new Inventory().init(callbacks.onWeaponSelect);

        // Get screen elements
        this.screens.lockScreen = document.getElementById('lockScreen');
        this.screens.gameOver = document.getElementById('gameOver');

        // Setup buttons
        this.setupButtons();

        // Setup event listeners
        this.setupEventListeners();

        return this;
    }

    /**
     * Setup button click handlers
     */
    setupButtons() {
        const startBtn = document.getElementById('startBtn');
        const restartBtn = document.getElementById('restartBtn');
        const shopBtn = document.getElementById('shopButton');

        if (startBtn) {
            startBtn.addEventListener('click', () => {
                this.hideLockScreen();
                if (this.onStart) this.onStart();
            });
        }

        if (restartBtn) {
            restartBtn.addEventListener('click', () => {
                this.hideGameOver();
                if (this.onRestart) this.onRestart();
            });
        }

        if (shopBtn) {
            shopBtn.addEventListener('click', () => {
                this.shop.toggle();
            });
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        eventBus.on(EVENTS.PLAYER_DIED, () => this.showGameOver());
        eventBus.on(EVENTS.GAME_RESTARTED, () => this.hideGameOver());
    }

    /**
     * Show lock screen
     */
    showLockScreen() {
        if (this.screens.lockScreen) {
            this.screens.lockScreen.classList.remove('hidden');
        }
        this.hud.setVisible(false);
    }

    /**
     * Hide lock screen
     */
    hideLockScreen() {
        if (this.screens.lockScreen) {
            this.screens.lockScreen.classList.add('hidden');
        }
        this.hud.setVisible(true);
    }

    /**
     * Show game over screen
     */
    showGameOver() {
        const state = gameState.getState();

        if (this.screens.gameOver) {
            const finalKills = document.getElementById('finalKills');
            if (finalKills) {
                finalKills.textContent = state.player.kills;
            }
            this.screens.gameOver.classList.remove('hidden');
        }

        this.hud.setVisible(false);
    }

    /**
     * Hide game over screen
     */
    hideGameOver() {
        if (this.screens.gameOver) {
            this.screens.gameOver.classList.add('hidden');
        }
        this.hud.setVisible(true);
    }

    /**
     * Toggle shop
     */
    toggleShop() {
        this.shop.toggle();
    }

    /**
     * Close shop
     */
    closeShop() {
        this.shop.close();
    }

    /**
     * Show message
     * @param {string} text
     * @param {number} duration
     */
    showMessage(text, duration = 2000) {
        this.hud.showMessage(text, duration);
    }

    /**
     * Update all UI
     */
    update() {
        this.hud.update();
        this.inventory.update();
    }

    /**
     * Get HUD component
     * @returns {HUD}
     */
    getHUD() {
        return this.hud;
    }

    /**
     * Get Shop component
     * @returns {Shop}
     */
    getShop() {
        return this.shop;
    }

    /**
     * Get Inventory component
     * @returns {Inventory}
     */
    getInventory() {
        return this.inventory;
    }

    /**
     * Dispose of all UI components
     */
    dispose() {
        if (this.hud) this.hud.dispose();
        if (this.shop) this.shop.dispose();
        if (this.inventory) this.inventory.dispose();
    }
}

export default UIManager;
