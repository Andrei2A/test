/**
 * GameState - Centralized state management
 * Single source of truth for all game state
 */

import { eventBus } from './EventBus.js';
import { EVENTS } from '../config/constants.js';

const initialState = {
    isPlaying: false,
    isPaused: false,
    shopOpen: false,
    isFirstPerson: false,

    player: {
        health: 100,
        maxHealth: 100,
        armor: 0,
        maxArmor: 0,
        coins: 0,
        kills: 0
    },

    weapons: {
        current: 'pistol',
        owned: ['pistol'],
        ammo: {
            pistol: 12,
            shotgun: 0
        },
        maxAmmo: {
            pistol: 12,
            shotgun: 6
        }
    }
};

class GameState {
    constructor() {
        this.state = this.deepClone(initialState);
    }

    /**
     * Deep clone an object
     * @param {Object} obj - Object to clone
     * @returns {Object} Cloned object
     */
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    /**
     * Get current state
     * @returns {Object} Current state
     */
    getState() {
        return this.state;
    }

    /**
     * Update state and emit change event
     * @param {string} path - Dot notation path (e.g., 'player.health')
     * @param {*} value - New value
     */
    setState(path, value) {
        const keys = path.split('.');
        let current = this.state;

        for (let i = 0; i < keys.length - 1; i++) {
            current = current[keys[i]];
        }

        const oldValue = current[keys[keys.length - 1]];
        current[keys[keys.length - 1]] = value;

        eventBus.emit(EVENTS.STATE_CHANGED, { path, oldValue, newValue: value });
    }

    /**
     * Get value at path
     * @param {string} path - Dot notation path
     * @returns {*} Value at path
     */
    get(path) {
        const keys = path.split('.');
        let current = this.state;

        for (const key of keys) {
            if (current === undefined) return undefined;
            current = current[key];
        }

        return current;
    }

    /**
     * Reset state to initial values
     */
    reset() {
        this.state = this.deepClone(initialState);
        eventBus.emit(EVENTS.STATE_CHANGED, { path: 'root', reset: true });
    }

    // Player methods
    addCoins(amount) {
        this.setState('player.coins', this.state.player.coins + amount);
    }

    spendCoins(amount) {
        if (this.state.player.coins >= amount) {
            this.setState('player.coins', this.state.player.coins - amount);
            return true;
        }
        return false;
    }

    damage(amount) {
        let remaining = amount;

        // Armor absorbs damage first
        if (this.state.player.armor > 0) {
            const armorDamage = Math.min(this.state.player.armor, remaining);
            this.setState('player.armor', this.state.player.armor - armorDamage);
            remaining -= armorDamage;

            if (this.state.player.armor <= 0) {
                eventBus.emit(EVENTS.ARMOR_BROKEN);
            }
        }

        // Remaining damage goes to health
        if (remaining > 0) {
            const newHealth = Math.max(0, this.state.player.health - remaining);
            this.setState('player.health', newHealth);

            if (newHealth <= 0) {
                eventBus.emit(EVENTS.PLAYER_DIED);
            }
        }

        eventBus.emit(EVENTS.PLAYER_DAMAGED, { amount, remaining: this.state.player.health });
    }

    heal(amount) {
        const newHealth = Math.min(this.state.player.maxHealth, this.state.player.health + amount);
        this.setState('player.health', newHealth);
    }

    addArmor(armorPoints, healthBonus) {
        this.setState('player.maxArmor', armorPoints);
        this.setState('player.armor', armorPoints);
        this.setState('player.maxHealth', 100 + healthBonus);
        this.setState('player.health', 100 + healthBonus);
    }

    addKill(isHeadshot = false) {
        this.setState('player.kills', this.state.player.kills + 1);
        eventBus.emit(isHeadshot ? EVENTS.ENEMY_HEADSHOT : EVENTS.ENEMY_KILLED);
    }

    // Weapon methods
    switchWeapon(weaponId) {
        if (this.state.weapons.owned.includes(weaponId)) {
            this.setState('weapons.current', weaponId);
            eventBus.emit(EVENTS.WEAPON_SWITCHED, { weapon: weaponId });
            return true;
        }
        return false;
    }

    addWeapon(weaponId) {
        if (!this.state.weapons.owned.includes(weaponId)) {
            this.state.weapons.owned.push(weaponId);
            this.setState('weapons.owned', this.state.weapons.owned);
        }
    }

    useAmmo() {
        const weapon = this.state.weapons.current;
        const currentAmmo = this.state.weapons.ammo[weapon];

        if (currentAmmo > 0) {
            this.setState(`weapons.ammo.${weapon}`, currentAmmo - 1);
            eventBus.emit(EVENTS.WEAPON_FIRED, { weapon, ammoLeft: currentAmmo - 1 });
            return true;
        }

        eventBus.emit(EVENTS.WEAPON_EMPTY, { weapon });
        return false;
    }

    reloadWeapon(weaponId) {
        const maxAmmo = this.state.weapons.maxAmmo[weaponId];
        this.setState(`weapons.ammo.${weaponId}`, maxAmmo);
    }

    getCurrentAmmo() {
        const weapon = this.state.weapons.current;
        return {
            current: this.state.weapons.ammo[weapon],
            max: this.state.weapons.maxAmmo[weapon]
        };
    }
}

// Singleton instance
export const gameState = new GameState();
export default GameState;
