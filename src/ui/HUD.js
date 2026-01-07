/**
 * HUD - Heads-Up Display management
 * Handles health, armor, ammo, kills, and coins display
 */

import { eventBus } from '../state/EventBus.js';
import { gameState } from '../state/GameState.js';
import { EVENTS } from '../config/constants.js';

export class HUD {
    constructor() {
        this.elements = {};
    }

    /**
     * Initialize HUD elements
     */
    init() {
        this.elements = {
            health: {
                fill: document.getElementById('healthFill'),
                value: document.getElementById('healthValue')
            },
            armor: {
                bar: document.getElementById('armorBar'),
                fill: document.getElementById('armorFill'),
                value: document.getElementById('armorValue')
            },
            ammo: document.getElementById('ammoValue'),
            kills: document.getElementById('killsValue'),
            coins: document.getElementById('coinsValue'),
            message: document.getElementById('message')
        };

        this.setupEventListeners();
        this.update();

        return this;
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        eventBus.on(EVENTS.STATE_CHANGED, () => this.update());
        eventBus.on(EVENTS.PLAYER_DAMAGED, () => this.flashDamage());
        eventBus.on(EVENTS.ENEMY_KILLED, (data) => this.showKillMessage(data));
        eventBus.on(EVENTS.ENEMY_HEADSHOT, (data) => this.showHeadshotMessage(data));
        eventBus.on(EVENTS.WEAPON_EMPTY, () => this.showMessage('Нет патронов!'));
        eventBus.on(EVENTS.ARMOR_BROKEN, () => this.showMessage('Броня разрушена!'));
    }

    /**
     * Update all HUD elements
     */
    update() {
        const state = gameState.getState();

        // Health
        if (this.elements.health.fill) {
            const healthPercent = (state.player.health / state.player.maxHealth) * 100;
            this.elements.health.fill.style.width = `${healthPercent}%`;
        }
        if (this.elements.health.value) {
            this.elements.health.value.textContent = Math.round(state.player.health);
        }

        // Armor
        if (this.elements.armor.bar) {
            if (state.player.maxArmor > 0) {
                this.elements.armor.bar.style.display = 'flex';
                const armorPercent = (state.player.armor / state.player.maxArmor) * 100;
                this.elements.armor.fill.style.width = `${armorPercent}%`;
                this.elements.armor.value.textContent = Math.round(state.player.armor);
            } else {
                this.elements.armor.bar.style.display = 'none';
            }
        }

        // Ammo
        if (this.elements.ammo) {
            const ammo = gameState.getCurrentAmmo();
            this.elements.ammo.textContent = `${ammo.current}/${ammo.max}`;
        }

        // Kills
        if (this.elements.kills) {
            this.elements.kills.textContent = state.player.kills;
        }

        // Coins
        if (this.elements.coins) {
            this.elements.coins.textContent = state.player.coins;
        }
    }

    /**
     * Show a temporary message
     * @param {string} text - Message text
     * @param {number} duration - Duration in ms
     */
    showMessage(text, duration = 2000) {
        if (!this.elements.message) return;

        this.elements.message.textContent = text;
        this.elements.message.classList.add('visible');

        setTimeout(() => {
            this.elements.message.classList.remove('visible');
        }, duration);
    }

    /**
     * Show kill message
     * @param {Object} data - Kill data
     */
    showKillMessage(data) {
        this.showMessage(`+${data.reward} 💀`);
    }

    /**
     * Show headshot message
     * @param {Object} data - Headshot data
     */
    showHeadshotMessage(data) {
        this.showMessage(`+${data.reward} 🎯 HEADSHOT!`);
    }

    /**
     * Flash screen red on damage
     */
    flashDamage() {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 0, 0, 0.3);
            pointer-events: none;
            z-index: 1000;
            animation: damageFlash 0.2s ease-out forwards;
        `;

        document.body.appendChild(overlay);

        setTimeout(() => {
            overlay.remove();
        }, 200);
    }

    /**
     * Show/hide HUD
     * @param {boolean} visible
     */
    setVisible(visible) {
        const hud = document.getElementById('hud');
        const crosshair = document.getElementById('crosshair');
        const inventory = document.getElementById('inventory');
        const shopButton = document.getElementById('shopButton');
        const controlsPanel = document.getElementById('controlsPanel');

        const display = visible ? 'block' : 'none';

        if (hud) hud.style.display = display;
        if (crosshair) crosshair.style.display = display;
        if (inventory) inventory.style.display = visible ? 'flex' : 'none';
        if (shopButton) shopButton.style.display = display;
        if (controlsPanel) controlsPanel.style.display = visible ? 'flex' : 'none';
    }

    /**
     * Dispose of HUD
     */
    dispose() {
        eventBus.off(EVENTS.STATE_CHANGED, this.update);
    }
}

export default HUD;
