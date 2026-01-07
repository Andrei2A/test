/**
 * GameState Unit Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import GameState, { gameState } from '../src/state/GameState.js';
import { eventBus } from '../src/state/EventBus.js';
import { EVENTS } from '../src/config/constants.js';

describe('GameState', () => {
    let state;

    beforeEach(() => {
        state = new GameState();
        eventBus.clear();
    });

    describe('getState()', () => {
        it('should return current state', () => {
            const currentState = state.getState();

            expect(currentState).toHaveProperty('isPlaying', false);
            expect(currentState).toHaveProperty('player');
            expect(currentState).toHaveProperty('weapons');
        });
    });

    describe('setState()', () => {
        it('should update state at path', () => {
            state.setState('isPlaying', true);

            expect(state.getState().isPlaying).toBe(true);
        });

        it('should update nested state', () => {
            state.setState('player.health', 75);

            expect(state.getState().player.health).toBe(75);
        });

        it('should emit STATE_CHANGED event', () => {
            const callback = vi.fn();
            eventBus.on(EVENTS.STATE_CHANGED, callback);

            state.setState('isPlaying', true);

            expect(callback).toHaveBeenCalledWith({
                path: 'isPlaying',
                oldValue: false,
                newValue: true
            });
        });
    });

    describe('get()', () => {
        it('should return value at path', () => {
            expect(state.get('player.health')).toBe(100);
            expect(state.get('weapons.current')).toBe('pistol');
        });

        it('should return undefined for invalid path', () => {
            expect(state.get('invalid.path')).toBeUndefined();
        });
    });

    describe('reset()', () => {
        it('should reset state to initial values', () => {
            state.setState('player.health', 50);
            state.setState('player.coins', 500);

            state.reset();

            expect(state.getState().player.health).toBe(100);
            expect(state.getState().player.coins).toBe(0);
        });
    });

    describe('addCoins()', () => {
        it('should add coins', () => {
            state.addCoins(50);

            expect(state.getState().player.coins).toBe(50);
        });

        it('should accumulate coins', () => {
            state.addCoins(50);
            state.addCoins(25);

            expect(state.getState().player.coins).toBe(75);
        });
    });

    describe('spendCoins()', () => {
        it('should spend coins if sufficient', () => {
            state.addCoins(100);
            const result = state.spendCoins(50);

            expect(result).toBe(true);
            expect(state.getState().player.coins).toBe(50);
        });

        it('should not spend if insufficient', () => {
            state.addCoins(30);
            const result = state.spendCoins(50);

            expect(result).toBe(false);
            expect(state.getState().player.coins).toBe(30);
        });
    });

    describe('damage()', () => {
        it('should reduce health', () => {
            state.damage(25);

            expect(state.getState().player.health).toBe(75);
        });

        it('should absorb damage with armor first', () => {
            state.addArmor(50, 0);
            state.damage(30);

            expect(state.getState().player.armor).toBe(20);
            expect(state.getState().player.health).toBe(100);
        });

        it('should overflow damage to health after armor depleted', () => {
            state.addArmor(20, 0);
            state.damage(50);

            expect(state.getState().player.armor).toBe(0);
            expect(state.getState().player.health).toBe(70);
        });

        it('should emit ARMOR_BROKEN when armor depletes', () => {
            const callback = vi.fn();
            eventBus.on(EVENTS.ARMOR_BROKEN, callback);

            state.addArmor(10, 0);
            state.damage(15);

            expect(callback).toHaveBeenCalled();
        });

        it('should emit PLAYER_DIED when health reaches 0', () => {
            const callback = vi.fn();
            eventBus.on(EVENTS.PLAYER_DIED, callback);

            state.damage(100);

            expect(callback).toHaveBeenCalled();
            expect(state.getState().player.health).toBe(0);
        });

        it('should not go below 0 health', () => {
            state.damage(150);

            expect(state.getState().player.health).toBe(0);
        });
    });

    describe('heal()', () => {
        it('should increase health', () => {
            state.damage(50);
            state.heal(25);

            expect(state.getState().player.health).toBe(75);
        });

        it('should not exceed max health', () => {
            state.heal(50);

            expect(state.getState().player.health).toBe(100);
        });
    });

    describe('addArmor()', () => {
        it('should set armor and max armor', () => {
            state.addArmor(50, 25);

            expect(state.getState().player.armor).toBe(50);
            expect(state.getState().player.maxArmor).toBe(50);
            expect(state.getState().player.maxHealth).toBe(125);
            expect(state.getState().player.health).toBe(125);
        });
    });

    describe('addKill()', () => {
        it('should increment kills', () => {
            state.addKill();
            state.addKill();

            expect(state.getState().player.kills).toBe(2);
        });

        it('should emit ENEMY_KILLED for normal kill', () => {
            const callback = vi.fn();
            eventBus.on(EVENTS.ENEMY_KILLED, callback);

            state.addKill(false);

            expect(callback).toHaveBeenCalled();
        });

        it('should emit ENEMY_HEADSHOT for headshot', () => {
            const callback = vi.fn();
            eventBus.on(EVENTS.ENEMY_HEADSHOT, callback);

            state.addKill(true);

            expect(callback).toHaveBeenCalled();
        });
    });

    describe('weapon methods', () => {
        it('should switch weapon', () => {
            state.addWeapon('shotgun');
            const result = state.switchWeapon('shotgun');

            expect(result).toBe(true);
            expect(state.getState().weapons.current).toBe('shotgun');
        });

        it('should not switch to unowned weapon', () => {
            const result = state.switchWeapon('shotgun');

            expect(result).toBe(false);
            expect(state.getState().weapons.current).toBe('pistol');
        });

        it('should add weapon to owned list', () => {
            state.addWeapon('shotgun');

            expect(state.getState().weapons.owned).toContain('shotgun');
        });

        it('should use ammo', () => {
            const result = state.useAmmo();

            expect(result).toBe(true);
            expect(state.getState().weapons.ammo.pistol).toBe(11);
        });

        it('should emit WEAPON_EMPTY when out of ammo', () => {
            const callback = vi.fn();
            eventBus.on(EVENTS.WEAPON_EMPTY, callback);

            state.setState('weapons.ammo.pistol', 0);
            state.useAmmo();

            expect(callback).toHaveBeenCalled();
        });

        it('should reload weapon', () => {
            state.setState('weapons.ammo.pistol', 5);
            state.reloadWeapon('pistol');

            expect(state.getState().weapons.ammo.pistol).toBe(12);
        });

        it('should get current ammo', () => {
            const ammo = state.getCurrentAmmo();

            expect(ammo).toEqual({ current: 12, max: 12 });
        });
    });

    describe('singleton instance', () => {
        it('should export a singleton instance', () => {
            expect(gameState).toBeInstanceOf(GameState);
        });
    });
});
