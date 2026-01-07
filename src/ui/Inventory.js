/**
 * Inventory - Weapon inventory UI
 * Handles weapon slots and switching
 */

import { eventBus } from '../state/EventBus.js';
import { gameState } from '../state/GameState.js';
import { EVENTS } from '../config/constants.js';

export class Inventory {
    constructor() {
        this.slots = [];
        this.onWeaponSelect = null;
    }

    /**
     * Initialize inventory
     * @param {Function} onSelect - Called when weapon selected
     */
    init(onSelect = null) {
        this.onWeaponSelect = onSelect;

        this.slots = [
            { element: document.getElementById('slot1'), weapon: 'pistol' },
            { element: document.getElementById('slot2'), weapon: 'shotgun' }
        ];

        this.setupEventListeners();
        this.update();

        return this;
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Click listeners for slots
        this.slots.forEach(slot => {
            if (slot.element) {
                slot.element.addEventListener('click', () => {
                    this.selectWeapon(slot.weapon);
                });
            }
        });

        // State change listener
        eventBus.on(EVENTS.STATE_CHANGED, () => this.update());
        eventBus.on(EVENTS.WEAPON_SWITCHED, () => this.update());
        eventBus.on(EVENTS.ITEM_PURCHASED, () => this.update());
    }

    /**
     * Select a weapon
     * @param {string} weaponId
     */
    selectWeapon(weaponId) {
        const state = gameState.getState();

        if (state.weapons.owned.includes(weaponId)) {
            gameState.switchWeapon(weaponId);

            if (this.onWeaponSelect) {
                this.onWeaponSelect(weaponId);
            }
        }
    }

    /**
     * Update inventory display
     */
    update() {
        const state = gameState.getState();

        this.slots.forEach(slot => {
            if (!slot.element) return;

            const isOwned = state.weapons.owned.includes(slot.weapon);
            const isActive = state.weapons.current === slot.weapon;

            // Update active state
            slot.element.classList.toggle('active', isActive);

            // Update owned state
            const icon = slot.element.querySelector('.item-icon');
            const name = slot.element.querySelector('span:last-child');

            if (icon) {
                icon.classList.toggle('inactive', !isOwned);
            }
            if (name) {
                name.classList.toggle('inactive', !isOwned);
            }
        });
    }

    /**
     * Get current weapon
     * @returns {string}
     */
    getCurrentWeapon() {
        return gameState.getState().weapons.current;
    }

    /**
     * Check if weapon is owned
     * @param {string} weaponId
     * @returns {boolean}
     */
    isWeaponOwned(weaponId) {
        return gameState.getState().weapons.owned.includes(weaponId);
    }

    /**
     * Dispose of inventory
     */
    dispose() {
        eventBus.off(EVENTS.STATE_CHANGED, this.update);
        eventBus.off(EVENTS.WEAPON_SWITCHED, this.update);
        eventBus.off(EVENTS.ITEM_PURCHASED, this.update);
    }
}

export default Inventory;
