/**
 * Enemy Unit Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Enemy } from '../src/entities/Enemy.js';
import { ZOMBIE } from '../src/config/constants.js';

// Mock Three.js
vi.mock('three', () => {
    const mockMaterial = {
        color: { setHex: vi.fn() },
        clone: vi.fn(() => ({ color: { setHex: vi.fn() } }))
    };

    const mockMesh = () => ({
        position: { set: vi.fn(), y: 0 },
        rotation: { x: 0, y: 0 },
        castShadow: false,
        material: mockMaterial,
        getWorldPosition: vi.fn((v) => v),
        add: vi.fn(),
        remove: vi.fn(),
        traverse: vi.fn((callback) => {
            callback({ material: { color: { setHex: vi.fn() } } });
        })
    });

    return {
        Group: vi.fn(() => ({
            add: vi.fn(),
            remove: vi.fn(),
            position: { x: 0, y: 0, z: 0, copy: vi.fn(), set: vi.fn(), distanceTo: vi.fn(() => 5) },
            rotation: { x: 0, y: 0, z: 0 },
            traverse: vi.fn((cb) => cb({ geometry: { dispose: vi.fn() }, material: { dispose: vi.fn() } }))
        })),
        Mesh: vi.fn(() => mockMesh()),
        BoxGeometry: vi.fn(),
        MeshStandardMaterial: vi.fn(() => mockMaterial),
        Vector3: vi.fn(() => ({
            x: 0, y: 0, z: 0,
            copy: vi.fn().mockReturnThis(),
            subVectors: vi.fn().mockReturnThis(),
            normalize: vi.fn().mockReturnThis(),
            set: vi.fn()
        }))
    };
});

describe('Enemy', () => {
    let enemy;
    const mockPosition = { x: 0, y: 0, z: 10, copy: vi.fn() };

    beforeEach(() => {
        enemy = new Enemy('test_enemy_1');
        enemy.init(mockPosition);
    });

    describe('constructor', () => {
        it('should create enemy with ID', () => {
            const newEnemy = new Enemy('test_enemy_2');
            expect(newEnemy.id).toBe('test_enemy_2');
            expect(newEnemy.health).toBe(ZOMBIE.HEALTH);
            expect(newEnemy.isDead).toBe(false);
        });
    });

    describe('init()', () => {
        it('should return this for chaining', () => {
            const newEnemy = new Enemy('test_enemy_3');
            const result = newEnemy.init(mockPosition);
            expect(result).toBe(newEnemy);
        });

        it('should create mesh', () => {
            expect(enemy.mesh).toBeDefined();
        });
    });

    describe('takeDamage()', () => {
        it('should reduce health', () => {
            enemy.takeDamage(30);

            expect(enemy.health).toBe(70);
            expect(enemy.isDead).toBe(false);
        });

        it('should kill enemy when health reaches 0', () => {
            const killed = enemy.takeDamage(100);

            expect(killed).toBe(true);
            expect(enemy.isDead).toBe(true);
        });

        it('should return false if already dead', () => {
            enemy.isDead = true;

            const killed = enemy.takeDamage(50);

            expect(killed).toBe(false);
        });

        it('should handle overkill damage', () => {
            enemy.takeDamage(200);

            expect(enemy.health).toBe(-100);
            expect(enemy.isDead).toBe(true);
        });
    });

    describe('canAttack()', () => {
        it('should return true when not dead and off cooldown', () => {
            enemy.lastAttackTime = 0;

            expect(enemy.canAttack()).toBe(true);
        });

        it('should return false when dead', () => {
            enemy.isDead = true;

            expect(enemy.canAttack()).toBe(false);
        });

        it('should return false during cooldown', () => {
            enemy.lastAttackTime = Date.now();

            expect(enemy.canAttack()).toBe(false);
        });
    });

    describe('attack()', () => {
        it('should return damage when can attack', () => {
            enemy.lastAttackTime = 0;

            const damage = enemy.attack();

            expect(damage).toBe(ZOMBIE.DAMAGE);
        });

        it('should return 0 when cannot attack', () => {
            enemy.lastAttackTime = Date.now();

            const damage = enemy.attack();

            expect(damage).toBe(0);
        });

        it('should update lastAttackTime', () => {
            enemy.lastAttackTime = 0;
            const before = Date.now();

            enemy.attack();

            expect(enemy.lastAttackTime).toBeGreaterThanOrEqual(before);
        });
    });

    describe('die()', () => {
        it('should set isDead to true', () => {
            enemy.die();

            expect(enemy.isDead).toBe(true);
        });

        it('should record death time', () => {
            const before = Date.now();

            enemy.die();

            expect(enemy.deathTime).toBeGreaterThanOrEqual(before);
        });
    });

    describe('getGroup()', () => {
        it('should return the group', () => {
            expect(enemy.getGroup()).toBe(enemy.group);
        });
    });

    describe('getPosition()', () => {
        it('should return group position', () => {
            expect(enemy.getPosition()).toBe(enemy.group.position);
        });
    });

    describe('isInAttackRange()', () => {
        it('should use group position distanceTo', () => {
            const target = { x: 0, y: 0, z: 0 };

            // Mock returns 5, ZOMBIE.ATTACK_RANGE is typically 1.5
            expect(enemy.isInAttackRange(target)).toBe(false);
        });
    });
});
