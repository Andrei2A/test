/**
 * RaycastSystem - Handles raycasting for shooting
 * Uses Three.js intersectObjects for accurate hit detection
 */

import * as THREE from 'three';
import { ZOMBIE } from '../config/constants.js';
import { eventBus } from '../state/EventBus.js';
import { gameState } from '../state/GameState.js';
import { EVENTS, REWARDS } from '../config/constants.js';

export class RaycastSystem {
    constructor(camera, scene) {
        this.camera = camera;
        this.scene = scene;
        this.raycaster = new THREE.Raycaster();
        this.enemies = [];
        this.goreEffect = null;
    }

    /**
     * Set the camera
     * @param {THREE.Camera} camera
     */
    setCamera(camera) {
        this.camera = camera;
    }

    /**
     * Set the scene
     * @param {THREE.Scene} scene
     */
    setScene(scene) {
        this.scene = scene;
    }

    /**
     * Set enemies array
     * @param {Array} enemies
     */
    setEnemies(enemies) {
        this.enemies = enemies;
    }

    /**
     * Set gore effect system
     * @param {GoreEffect} goreEffect
     */
    setGoreEffect(goreEffect) {
        this.goreEffect = goreEffect;
    }

    /**
     * Perform a shot - returns true if shot was fired
     * @param {number} damage - Damage to deal
     * @returns {boolean}
     */
    shoot(damage) {
        // Setup raycaster from camera center (like original)
        this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);

        // Collect all zombie meshes
        const zombieMeshes = [];
        this.enemies.forEach(enemy => {
            if (enemy.isDead) return;

            const group = enemy.getGroup();
            group.traverse(child => {
                if (child.isMesh) {
                    child.userData.parentEnemy = enemy;
                    // Mark head meshes
                    const worldPos = new THREE.Vector3();
                    child.getWorldPosition(worldPos);
                    child.userData.isHead = (worldPos.y > group.position.y + ZOMBIE.HEADSHOT_Y_THRESHOLD);
                    zombieMeshes.push(child);
                }
            });
        });

        // Perform raycast
        const intersects = this.raycaster.intersectObjects(zombieMeshes);

        if (intersects.length > 0) {
            const hitMesh = intersects[0].object;
            const enemy = hitMesh.userData.parentEnemy;
            const hitPoint = intersects[0].point;

            if (enemy && !enemy.isDead) {
                // Check if headshot
                const isHeadshot = hitPoint.y > enemy.getPosition().y + ZOMBIE.HEADSHOT_Y_THRESHOLD;

                // Apply damage
                const killed = enemy.takeDamage(damage, isHeadshot);

                if (killed) {
                    const reward = isHeadshot ? REWARDS.HEADSHOT : REWARDS.KILL;
                    gameState.addCoins(reward);
                    gameState.addKill(isHeadshot);

                    // Create gore effect for headshot
                    if (isHeadshot && this.goreEffect) {
                        this.goreEffect.createHeadExplosion(hitPoint);
                    }

                    eventBus.emit(
                        isHeadshot ? EVENTS.ENEMY_HEADSHOT : EVENTS.ENEMY_KILLED,
                        { enemy, reward }
                    );
                } else {
                    // Hit effect
                    this.createHitEffect(hitPoint);
                }
            }
        }

        // Create muzzle flash
        this.createMuzzleFlash();

        return true;
    }

    /**
     * Create hit effect at point
     * @param {THREE.Vector3} point
     */
    createHitEffect(point) {
        if (!this.scene) return;

        const geometry = new THREE.SphereGeometry(0.1, 8, 8);
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const effect = new THREE.Mesh(geometry, material);
        effect.position.copy(point);
        this.scene.add(effect);

        setTimeout(() => {
            this.scene.remove(effect);
            geometry.dispose();
            material.dispose();
        }, 100);
    }

    /**
     * Create muzzle flash effect
     */
    createMuzzleFlash() {
        if (!this.scene || !this.camera) return;

        const flash = new THREE.PointLight(0xffaa00, 3, 5);
        flash.position.copy(this.camera.position);
        flash.position.y -= 0.3;

        // Move flash forward in camera direction
        const forward = new THREE.Vector3(0, 0, -1);
        forward.applyQuaternion(this.camera.quaternion);
        flash.position.add(forward.multiplyScalar(0.5));

        this.scene.add(flash);

        setTimeout(() => {
            this.scene.remove(flash);
        }, 50);
    }

    /**
     * Dispose of resources
     */
    dispose() {
        this.enemies = [];
        this.goreEffect = null;
    }
}

export default RaycastSystem;
