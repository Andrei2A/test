/**
 * Weapon Unit Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Weapon } from '../src/entities/Weapon.js';
import { gameState } from '../src/state/GameState.js';
import { eventBus } from '../src/state/EventBus.js';
import { EVENTS } from '../src/config/constants.js';

// Mock Three.js
vi.mock('three', () => ({
    Group: vi.fn(() => ({
        add: vi.fn(),
        position: { z: 0 }
    })),
    Mesh: vi.fn(() => ({
        position: { set: vi.fn(), z: 0 }
    })),
    BoxGeometry: vi.fn(),
    MeshStandardMaterial: vi.fn()
}));

describe('Weapon', () => {
    beforeEach(() => {
        gameState.reset();
        eventBus.clear();
    });

    describe('constructor', () => {
        it('should create pistol weapon', () => {
            const pistol = new Weapon('pistol');

            expect(pistol.type).toBe('pistol');
            expect(pistol.config.id).toBe('pistol');
            expect(pistol.fireRate).toBe(300);
        });

        it('should create shotgun weapon', () => {
            const shotgun = new Weapon('shotgun');

            expect(shotgun.type).toBe('shotgun');
            expect(shotgun.config.id).toBe('shotgun');
            expect(shotgun.fireRate).toBe(800);
        });
    });

    describe('canFire()', () => {
        it('should return true when has ammo and not on cooldown', () => {
            const pistol = new Weapon('pistol');

            expect(pistol.canFire()).toBe(true);
        });

        it('should return false when no ammo', () => {
            const pistol = new Weapon('pistol');
            gameState.setState('weapons.ammo.pistol', 0);

            expect(pistol.canFire()).toBe(false);
        });

        it('should return false during cooldown', () => {
            const pistol = new Weapon('pistol');
            pistol.lastFireTime = Date.now();

            expect(pistol.canFire()).toBe(false);
        });
    });

    describe('fire()', () => {
        it('should fire and return true when can fire', () => {
            const pistol = new Weapon('pistol');

            const result = pistol.fire();

            expect(result).toBe(true);
            expect(gameState.get('weapons.ammo.pistol')).toBe(11);
        });

        it('should emit WEAPON_EMPTY when no ammo', () => {
            const pistol = new Weapon('pistol');
            gameState.setState('weapons.ammo.pistol', 0);

            const callback = vi.fn();
            eventBus.on(EVENTS.WEAPON_EMPTY, callback);

            const result = pistol.fire();

            expect(result).toBe(false);
            expect(callback).toHaveBeenCalled();
        });

        it('should not fire during cooldown', () => {
            const pistol = new Weapon('pistol');
            pistol.lastFireTime = Date.now();

            const result = pistol.fire();

            expect(result).toBe(false);
        });
    });

    describe('getDamage()', () => {
        it('should return pistol damage', () => {
            const pistol = new Weapon('pistol');

            expect(pistol.getDamage()).toBe(50);
        });

        it('should return shotgun damage', () => {
            const shotgun = new Weapon('shotgun');

            expect(shotgun.getDamage()).toBe(100);
        });
    });

    describe('isShotgun()', () => {
        it('should return false for pistol', () => {
            const pistol = new Weapon('pistol');

            expect(pistol.isShotgun()).toBe(false);
        });

        it('should return true for shotgun', () => {
            const shotgun = new Weapon('shotgun');

            expect(shotgun.isShotgun()).toBe(true);
        });
    });

    describe('getPelletCount()', () => {
        it('should return 1 for pistol', () => {
            const pistol = new Weapon('pistol');

            expect(pistol.getPelletCount()).toBe(1);
        });

        it('should return 8 for shotgun', () => {
            const shotgun = new Weapon('shotgun');

            expect(shotgun.getPelletCount()).toBe(8);
        });
    });

    describe('getSpreadAngle()', () => {
        it('should return 0 for pistol', () => {
            const pistol = new Weapon('pistol');

            expect(pistol.getSpreadAngle()).toBe(0);
        });

        it('should return 0.1 for shotgun', () => {
            const shotgun = new Weapon('shotgun');

            expect(shotgun.getSpreadAngle()).toBe(0.1);
        });
    });
});
