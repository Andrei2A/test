/**
 * SpawnerSystem Unit Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SpawnerSystem } from '../src/systems/SpawnerSystem.js';
import { ZOMBIE, MAP } from '../src/config/constants.js';

// Mock Three.js
vi.mock('three', () => ({
    Vector3: vi.fn(() => ({
        x: 0, y: 0, z: 0,
        copy: vi.fn().mockReturnThis(),
        set: vi.fn()
    })),
    Group: vi.fn(() => ({
        add: vi.fn(),
        position: { x: 0, y: 0, z: 0, copy: vi.fn(), set: vi.fn() }
    })),
    Mesh: vi.fn(() => ({
        position: { set: vi.fn() },
        castShadow: false
    })),
    BoxGeometry: vi.fn(),
    MeshStandardMaterial: vi.fn(() => ({
        clone: vi.fn().mockReturnThis()
    }))
}));

// Mock Enemy
vi.mock('../src/entities/Enemy.js', () => ({
    Enemy: vi.fn(() => ({
        init: vi.fn().mockReturnThis(),
        getGroup: vi.fn(() => ({
            position: { x: 0, y: 0, z: 0, copy: vi.fn() }
        })),
        getPosition: vi.fn(() => ({ x: 0, y: 0, z: 0, distanceTo: vi.fn(() => 5) })),
        update: vi.fn(() => false),
        isDead: false,
        deathTime: 0,
        dispose: vi.fn()
    }))
}));

describe('SpawnerSystem', () => {
    let spawner;
    let mockScene;

    beforeEach(() => {
        mockScene = {
            add: vi.fn(),
            remove: vi.fn()
        };
        spawner = new SpawnerSystem(mockScene);
    });

    describe('constructor', () => {
        it('should initialize with empty enemies array', () => {
            expect(spawner.enemies).toEqual([]);
            expect(spawner.isActive).toBe(false);
        });
    });

    describe('start()', () => {
        it('should set isActive to true', () => {
            spawner.start();

            expect(spawner.isActive).toBe(true);
        });
    });

    describe('stop()', () => {
        it('should set isActive to false', () => {
            spawner.start();
            spawner.stop();

            expect(spawner.isActive).toBe(false);
        });
    });

    describe('setPlayerPosition()', () => {
        it('should update player position', () => {
            const pos = { x: 10, y: 0, z: 20, copy: vi.fn() };

            spawner.setPlayerPosition(pos);

            expect(spawner.playerPosition.copy).toHaveBeenCalled();
        });
    });

    describe('getSpawnPosition()', () => {
        it('should return a Vector3 position', () => {
            const position = spawner.getSpawnPosition();

            expect(position).toBeDefined();
        });
    });

    describe('spawnEnemy()', () => {
        it('should add enemy to scene', () => {
            spawner.spawnEnemy();

            expect(mockScene.add).toHaveBeenCalled();
            expect(spawner.enemies.length).toBe(1);
        });

        it('should increment enemy ID counter', () => {
            const initialId = spawner.enemyIdCounter;

            spawner.spawnEnemy();

            expect(spawner.enemyIdCounter).toBe(initialId + 1);
        });
    });

    describe('getLivingEnemies()', () => {
        it('should return only living enemies', () => {
            spawner.spawnEnemy();
            spawner.spawnEnemy();
            spawner.enemies[0].isDead = true;

            const living = spawner.getLivingEnemies();

            expect(living.length).toBe(1);
        });
    });

    describe('getAllEnemies()', () => {
        it('should return all enemies', () => {
            spawner.spawnEnemy();
            spawner.spawnEnemy();
            spawner.enemies[0].isDead = true;

            const all = spawner.getAllEnemies();

            expect(all.length).toBe(2);
        });
    });

    describe('getEnemyCount()', () => {
        it('should return total enemy count', () => {
            spawner.spawnEnemy();
            spawner.spawnEnemy();

            expect(spawner.getEnemyCount()).toBe(2);
        });
    });

    describe('getLivingCount()', () => {
        it('should return living enemy count', () => {
            spawner.spawnEnemy();
            spawner.spawnEnemy();
            spawner.enemies[0].isDead = true;

            expect(spawner.getLivingCount()).toBe(1);
        });
    });

    describe('clear()', () => {
        it('should remove all enemies', () => {
            spawner.spawnEnemy();
            spawner.spawnEnemy();

            spawner.clear();

            expect(spawner.enemies.length).toBe(0);
            expect(mockScene.remove).toHaveBeenCalledTimes(2);
        });
    });

    describe('update()', () => {
        it('should not spawn when inactive', () => {
            spawner.update(1);

            expect(spawner.enemies.length).toBe(0);
        });

        it('should spawn after interval when active', () => {
            spawner.start();
            spawner.spawnTimer = ZOMBIE.SPAWN_INTERVAL;

            spawner.update(0.001);

            expect(spawner.enemies.length).toBe(1);
        });
    });
});
