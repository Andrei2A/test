/**
 * Constants Unit Tests
 */

import { describe, it, expect } from 'vitest';
import {
    PLAYER,
    PHYSICS,
    WEAPONS,
    ARMOR,
    AMMO,
    ZOMBIE,
    REWARDS,
    CAMERA,
    MAP,
    GORE,
    EVENTS
} from '../src/config/constants.js';

describe('Constants', () => {
    describe('PLAYER', () => {
        it('should have required properties', () => {
            expect(PLAYER).toHaveProperty('SPEED');
            expect(PLAYER).toHaveProperty('HEIGHT');
            expect(PLAYER).toHaveProperty('JUMP_FORCE');
            expect(PLAYER).toHaveProperty('COLLISION_RADIUS');
        });

        it('should have positive values', () => {
            expect(PLAYER.SPEED).toBeGreaterThan(0);
            expect(PLAYER.HEIGHT).toBeGreaterThan(0);
            expect(PLAYER.JUMP_FORCE).toBeGreaterThan(0);
            expect(PLAYER.COLLISION_RADIUS).toBeGreaterThan(0);
        });
    });

    describe('PHYSICS', () => {
        it('should have negative gravity', () => {
            expect(PHYSICS.GRAVITY).toBeLessThan(0);
        });
    });

    describe('WEAPONS', () => {
        it('should have PISTOL configuration', () => {
            expect(WEAPONS.PISTOL).toHaveProperty('id', 'pistol');
            expect(WEAPONS.PISTOL).toHaveProperty('damage');
            expect(WEAPONS.PISTOL).toHaveProperty('maxAmmo');
            expect(WEAPONS.PISTOL).toHaveProperty('price', 0);
        });

        it('should have SHOTGUN configuration', () => {
            expect(WEAPONS.SHOTGUN).toHaveProperty('id', 'shotgun');
            expect(WEAPONS.SHOTGUN).toHaveProperty('damage');
            expect(WEAPONS.SHOTGUN).toHaveProperty('maxAmmo');
            expect(WEAPONS.SHOTGUN.damage).toBeGreaterThan(WEAPONS.PISTOL.damage);
        });
    });

    describe('ARMOR', () => {
        it('should have three armor levels', () => {
            expect(ARMOR).toHaveProperty('CAMOUFLAGE');
            expect(ARMOR).toHaveProperty('VEST');
            expect(ARMOR).toHaveProperty('ASSAULT');
        });

        it('should have increasing armor points', () => {
            expect(ARMOR.VEST.armorPoints).toBeGreaterThan(ARMOR.CAMOUFLAGE.armorPoints);
            expect(ARMOR.ASSAULT.armorPoints).toBeGreaterThan(ARMOR.VEST.armorPoints);
        });

        it('should have increasing prices', () => {
            expect(ARMOR.VEST.price).toBeGreaterThan(ARMOR.CAMOUFLAGE.price);
            expect(ARMOR.ASSAULT.price).toBeGreaterThan(ARMOR.VEST.price);
        });
    });

    describe('AMMO', () => {
        it('should have ammo for both weapons', () => {
            expect(AMMO).toHaveProperty('PISTOL');
            expect(AMMO).toHaveProperty('SHOTGUN');
        });

        it('should have prices', () => {
            expect(AMMO.PISTOL.price).toBeGreaterThan(0);
            expect(AMMO.SHOTGUN.price).toBeGreaterThan(0);
        });
    });

    describe('ZOMBIE', () => {
        it('should have required properties', () => {
            expect(ZOMBIE).toHaveProperty('SPEED');
            expect(ZOMBIE).toHaveProperty('HEALTH');
            expect(ZOMBIE).toHaveProperty('DAMAGE');
            expect(ZOMBIE).toHaveProperty('SPAWN_INTERVAL');
            expect(ZOMBIE).toHaveProperty('ATTACK_RANGE');
            expect(ZOMBIE).toHaveProperty('BODY_DESPAWN_TIME');
        });

        it('should have valid spawn distances', () => {
            expect(ZOMBIE.SPAWN_DISTANCE_MIN).toBeLessThan(ZOMBIE.SPAWN_DISTANCE_MAX);
        });
    });

    describe('REWARDS', () => {
        it('should have kill and headshot rewards', () => {
            expect(REWARDS).toHaveProperty('KILL');
            expect(REWARDS).toHaveProperty('HEADSHOT');
        });

        it('should reward more for headshots', () => {
            expect(REWARDS.HEADSHOT).toBeGreaterThan(REWARDS.KILL);
        });
    });

    describe('CAMERA', () => {
        it('should have third person settings', () => {
            expect(CAMERA.THIRD_PERSON).toHaveProperty('distance');
            expect(CAMERA.THIRD_PERSON).toHaveProperty('height');
        });

        it('should have first person settings', () => {
            expect(CAMERA.FIRST_PERSON).toHaveProperty('eyeHeight');
        });
    });

    describe('MAP', () => {
        it('should have size and boundary', () => {
            expect(MAP).toHaveProperty('SIZE');
            expect(MAP).toHaveProperty('BOUNDARY');
        });

        it('should have boundary less than half size', () => {
            expect(MAP.BOUNDARY).toBeLessThan(MAP.SIZE / 2);
        });
    });

    describe('GORE', () => {
        it('should have effect settings', () => {
            expect(GORE).toHaveProperty('CHUNK_COUNT');
            expect(GORE).toHaveProperty('BLOOD_COUNT');
            expect(GORE).toHaveProperty('CHUNK_LIFETIME');
            expect(GORE).toHaveProperty('BLOOD_LIFETIME');
        });
    });

    describe('EVENTS', () => {
        it('should have all game events', () => {
            expect(EVENTS).toHaveProperty('PLAYER_DAMAGED');
            expect(EVENTS).toHaveProperty('PLAYER_DIED');
            expect(EVENTS).toHaveProperty('ENEMY_KILLED');
            expect(EVENTS).toHaveProperty('ENEMY_HEADSHOT');
            expect(EVENTS).toHaveProperty('WEAPON_FIRED');
            expect(EVENTS).toHaveProperty('WEAPON_SWITCHED');
            expect(EVENTS).toHaveProperty('WEAPON_EMPTY');
            expect(EVENTS).toHaveProperty('ITEM_PURCHASED');
            expect(EVENTS).toHaveProperty('STATE_CHANGED');
            expect(EVENTS).toHaveProperty('GAME_STARTED');
            expect(EVENTS).toHaveProperty('GAME_OVER');
        });

        it('should have unique event names', () => {
            const values = Object.values(EVENTS);
            const uniqueValues = new Set(values);

            expect(values.length).toBe(uniqueValues.size);
        });
    });
});
