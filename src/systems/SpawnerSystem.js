/**
 * SpawnerSystem - Handles enemy spawning
 * Manages zombie wave spawning logic
 */

import * as THREE from 'three';
import { ZOMBIE, MAP } from '../config/constants.js';
import { Enemy } from '../entities/Enemy.js';

export class SpawnerSystem {
    constructor(scene) {
        this.scene = scene;
        this.enemies = [];
        this.deadEnemies = [];
        this.spawnTimer = 0;
        this.enemyIdCounter = 0;
        this.isActive = false;
        this.playerPosition = new THREE.Vector3();
    }

    /**
     * Start spawning
     */
    start() {
        this.isActive = true;
    }

    /**
     * Stop spawning
     */
    stop() {
        this.isActive = false;
    }

    /**
     * Update player position for spawn calculations
     * @param {THREE.Vector3} position
     */
    setPlayerPosition(position) {
        this.playerPosition.copy(position);
    }

    /**
     * Update spawner
     * @param {number} deltaTime - Time since last frame
     */
    update(deltaTime) {
        if (!this.isActive) return;

        // Spawn timer
        this.spawnTimer += deltaTime * 1000;

        if (this.spawnTimer >= ZOMBIE.SPAWN_INTERVAL) {
            this.spawnTimer = 0;
            this.spawnEnemy();
        }

        // Update enemies
        this.updateEnemies(deltaTime);

        // Clean up dead enemies
        this.cleanupDeadEnemies();
    }

    /**
     * Spawn a new enemy
     */
    spawnEnemy() {
        const position = this.getSpawnPosition();
        const enemy = new Enemy(`enemy_${this.enemyIdCounter++}`);
        enemy.init(position);

        this.enemies.push(enemy);
        this.scene.add(enemy.getGroup());
    }

    /**
     * Get a valid spawn position
     * @returns {THREE.Vector3}
     */
    getSpawnPosition() {
        const angle = Math.random() * Math.PI * 2;
        const distance = ZOMBIE.SPAWN_DISTANCE_MIN +
            Math.random() * (ZOMBIE.SPAWN_DISTANCE_MAX - ZOMBIE.SPAWN_DISTANCE_MIN);

        const x = this.playerPosition.x + Math.cos(angle) * distance;
        const z = this.playerPosition.z + Math.sin(angle) * distance;

        // Clamp to map bounds
        const clampedX = Math.max(-MAP.BOUNDARY, Math.min(MAP.BOUNDARY, x));
        const clampedZ = Math.max(-MAP.BOUNDARY, Math.min(MAP.BOUNDARY, z));

        return new THREE.Vector3(clampedX, 0, clampedZ);
    }

    /**
     * Update all enemies
     * @param {number} deltaTime
     */
    updateEnemies(deltaTime) {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            const shouldRemove = enemy.update(deltaTime, this.playerPosition);

            if (shouldRemove) {
                this.removeEnemy(i);
            } else if (enemy.isDead && !this.deadEnemies.includes(enemy)) {
                this.deadEnemies.push(enemy);
            }
        }
    }

    /**
     * Remove enemy at index
     * @param {number} index
     */
    removeEnemy(index) {
        const enemy = this.enemies[index];
        this.scene.remove(enemy.getGroup());
        enemy.dispose();
        this.enemies.splice(index, 1);

        // Remove from dead list if present
        const deadIndex = this.deadEnemies.indexOf(enemy);
        if (deadIndex > -1) {
            this.deadEnemies.splice(deadIndex, 1);
        }
    }

    /**
     * Clean up dead enemies after timeout
     */
    cleanupDeadEnemies() {
        const now = Date.now();

        for (let i = this.deadEnemies.length - 1; i >= 0; i--) {
            const enemy = this.deadEnemies[i];

            if (now - enemy.deathTime > ZOMBIE.BODY_DESPAWN_TIME) {
                const enemyIndex = this.enemies.indexOf(enemy);
                if (enemyIndex > -1) {
                    this.removeEnemy(enemyIndex);
                }
            }
        }
    }

    /**
     * Get all living enemies
     * @returns {Array}
     */
    getLivingEnemies() {
        return this.enemies.filter(e => !e.isDead);
    }

    /**
     * Get all enemies (including dead)
     * @returns {Array}
     */
    getAllEnemies() {
        return this.enemies;
    }

    /**
     * Get enemy count
     * @returns {number}
     */
    getEnemyCount() {
        return this.enemies.length;
    }

    /**
     * Get living enemy count
     * @returns {number}
     */
    getLivingCount() {
        return this.enemies.filter(e => !e.isDead).length;
    }

    /**
     * Clear all enemies
     */
    clear() {
        for (const enemy of this.enemies) {
            this.scene.remove(enemy.getGroup());
            enemy.dispose();
        }
        this.enemies = [];
        this.deadEnemies = [];
    }

    /**
     * Dispose of resources
     */
    dispose() {
        this.clear();
    }
}

export default SpawnerSystem;
