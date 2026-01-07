/**
 * Enemy (Zombie) - Enemy entity class
 * Handles zombie mesh, AI, and behavior
 */

import * as THREE from 'three';
import { ZOMBIE } from '../config/constants.js';

export class Enemy {
    constructor(id) {
        this.id = id;
        this.group = new THREE.Group();
        this.mesh = null;
        this.health = ZOMBIE.HEALTH;
        this.isDead = false;
        this.deathTime = 0;
        this.lastAttackTime = 0;
        this.head = null;
    }

    /**
     * Initialize the enemy
     * @param {THREE.Vector3} position - Spawn position
     * @returns {Enemy}
     */
    init(position) {
        this.createMesh();
        this.group.position.copy(position);
        return this;
    }

    /**
     * Create zombie mesh
     */
    createMesh() {
        this.mesh = new THREE.Group();

        const zombieSkin = new THREE.MeshStandardMaterial({ color: 0x4a7c4a });
        const zombieClothes = new THREE.MeshStandardMaterial({ color: 0x3d3d3d });

        // Torso
        this.torso = new THREE.Mesh(
            new THREE.BoxGeometry(1, 1.2, 0.5),
            zombieClothes
        );
        this.torso.position.y = 1.4;
        this.torso.castShadow = true;
        this.mesh.add(this.torso);

        // Head
        this.head = new THREE.Mesh(
            new THREE.BoxGeometry(0.6, 0.6, 0.6),
            zombieSkin.clone()
        );
        this.head.position.y = 2.3;
        this.head.castShadow = true;
        this.mesh.add(this.head);

        // Eyes (red)
        const eyeMaterial = new THREE.MeshStandardMaterial({
            color: 0xff0000,
            emissive: 0xff0000,
            emissiveIntensity: 0.5
        });

        const leftEye = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.05), eyeMaterial);
        leftEye.position.set(-0.15, 2.35, 0.3);
        this.mesh.add(leftEye);

        const rightEye = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.05), eyeMaterial);
        rightEye.position.set(0.15, 2.35, 0.3);
        this.mesh.add(rightEye);

        // Arms
        this.leftArm = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, 0.9, 0.3),
            zombieSkin
        );
        this.leftArm.position.set(-0.65, 1.3, 0.3);
        this.leftArm.rotation.x = -0.5;
        this.leftArm.castShadow = true;
        this.mesh.add(this.leftArm);

        this.rightArm = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, 0.9, 0.3),
            zombieSkin
        );
        this.rightArm.position.set(0.65, 1.3, 0.3);
        this.rightArm.rotation.x = -0.5;
        this.rightArm.castShadow = true;
        this.mesh.add(this.rightArm);

        // Legs
        this.leftLeg = new THREE.Mesh(
            new THREE.BoxGeometry(0.35, 0.8, 0.35),
            zombieClothes
        );
        this.leftLeg.position.set(-0.2, 0.4, 0);
        this.leftLeg.castShadow = true;
        this.mesh.add(this.leftLeg);

        this.rightLeg = new THREE.Mesh(
            new THREE.BoxGeometry(0.35, 0.8, 0.35),
            zombieClothes
        );
        this.rightLeg.position.set(0.2, 0.4, 0);
        this.rightLeg.castShadow = true;
        this.mesh.add(this.rightLeg);

        this.group.add(this.mesh);
    }

    /**
     * Update enemy state
     * @param {number} deltaTime - Time since last frame
     * @param {THREE.Vector3} playerPosition - Player's position
     * @returns {boolean} True if should be removed
     */
    update(deltaTime, playerPosition) {
        if (this.isDead) {
            // Check if should despawn
            if (Date.now() - this.deathTime > ZOMBIE.BODY_DESPAWN_TIME) {
                return true; // Signal for removal
            }
            return false;
        }

        // Move towards player
        const direction = new THREE.Vector3()
            .subVectors(playerPosition, this.group.position)
            .normalize();

        this.group.position.x += direction.x * ZOMBIE.SPEED * deltaTime;
        this.group.position.z += direction.z * ZOMBIE.SPEED * deltaTime;

        // Face player
        this.mesh.rotation.y = Math.atan2(direction.x, direction.z);

        // Walking animation
        this.animateWalk();

        return false;
    }

    /**
     * Animate zombie walking
     */
    animateWalk() {
        const time = performance.now() * 0.005;
        const swing = Math.sin(time) * 0.4;

        if (this.leftLeg) this.leftLeg.rotation.x = swing;
        if (this.rightLeg) this.rightLeg.rotation.x = -swing;
        if (this.leftArm) this.leftArm.rotation.x = -0.5 + swing * 0.3;
        if (this.rightArm) this.rightArm.rotation.x = -0.5 - swing * 0.3;
    }

    /**
     * Take damage
     * @param {number} amount - Damage amount
     * @param {boolean} isHeadshot - Whether it was a headshot
     * @returns {boolean} True if killed
     */
    takeDamage(amount, isHeadshot = false) {
        if (this.isDead) return false;

        this.health -= amount;

        if (this.health <= 0) {
            this.die(isHeadshot);
            return true;
        }

        // Hit reaction
        this.flashRed();
        return false;
    }

    /**
     * Flash red on hit
     */
    flashRed() {
        const originalColor = 0x4a7c4a;
        const flashColor = 0xff0000;

        this.mesh.traverse(child => {
            if (child.material && child.material.color) {
                child.material.color.setHex(flashColor);
            }
        });

        setTimeout(() => {
            this.mesh.traverse(child => {
                if (child.material && child.material.color) {
                    child.material.color.setHex(originalColor);
                }
            });
        }, 100);
    }

    /**
     * Handle death
     * @param {boolean} isHeadshot - Whether killed by headshot
     */
    die(isHeadshot = false) {
        this.isDead = true;
        this.deathTime = Date.now();

        // Fall over animation
        this.mesh.rotation.x = Math.PI / 2;
        this.group.position.y = 0.3;

        if (isHeadshot && this.head) {
            // Remove head for headshot
            this.mesh.remove(this.head);
            this.head = null;
        }
    }

    /**
     * Check if can attack
     * @returns {boolean}
     */
    canAttack() {
        return !this.isDead && Date.now() - this.lastAttackTime >= ZOMBIE.ATTACK_COOLDOWN;
    }

    /**
     * Perform attack
     * @returns {number} Damage dealt
     */
    attack() {
        if (!this.canAttack()) return 0;

        this.lastAttackTime = Date.now();
        return ZOMBIE.DAMAGE;
    }

    /**
     * Get distance to target
     * @param {THREE.Vector3} target - Target position
     * @returns {number}
     */
    getDistanceTo(target) {
        return this.group.position.distanceTo(target);
    }

    /**
     * Check if in attack range
     * @param {THREE.Vector3} target - Target position
     * @returns {boolean}
     */
    isInAttackRange(target) {
        return this.getDistanceTo(target) <= ZOMBIE.ATTACK_RANGE;
    }

    /**
     * Get the Three.js group
     * @returns {THREE.Group}
     */
    getGroup() {
        return this.group;
    }

    /**
     * Get position
     * @returns {THREE.Vector3}
     */
    getPosition() {
        return this.group.position;
    }

    /**
     * Get head position for headshot detection
     * @returns {THREE.Vector3}
     */
    getHeadPosition() {
        if (!this.head || this.isDead) return null;
        const worldPos = new THREE.Vector3();
        this.head.getWorldPosition(worldPos);
        return worldPos;
    }

    /**
     * Dispose of resources
     */
    dispose() {
        this.mesh.traverse(child => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
        });
    }
}

export default Enemy;
