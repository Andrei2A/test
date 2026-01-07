/**
 * GoreEffect - Gore and blood effect system
 * Handles blood splatter and body chunks
 */

import * as THREE from 'three';
import { GORE } from '../config/constants.js';

export class GoreEffect {
    constructor(scene) {
        this.scene = scene;
        this.chunks = [];
        this.bloodPools = [];
    }

    /**
     * Create headshot explosion effect
     * @param {THREE.Vector3} position - Position of the head
     */
    createHeadExplosion(position) {
        // Create meat chunks
        for (let i = 0; i < GORE.CHUNK_COUNT; i++) {
            this.createChunk(position);
        }

        // Create blood splatter
        for (let i = 0; i < GORE.BLOOD_COUNT; i++) {
            this.createBloodDrop(position);
        }
    }

    /**
     * Create a meat chunk
     * @param {THREE.Vector3} origin - Origin position
     */
    createChunk(origin) {
        const geometry = new THREE.BoxGeometry(
            0.1 + Math.random() * 0.15,
            0.1 + Math.random() * 0.15,
            0.1 + Math.random() * 0.15
        );

        const material = new THREE.MeshStandardMaterial({
            color: new THREE.Color(
                0.5 + Math.random() * 0.3,
                0.1 + Math.random() * 0.1,
                0.1
            ),
            roughness: 0.8
        });

        const chunk = new THREE.Mesh(geometry, material);
        chunk.position.copy(origin);
        chunk.castShadow = true;

        // Random velocity
        const velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 8,
            Math.random() * 6 + 2,
            (Math.random() - 0.5) * 8
        );

        const chunkData = {
            mesh: chunk,
            velocity: velocity,
            rotationSpeed: new THREE.Vector3(
                Math.random() * 10,
                Math.random() * 10,
                Math.random() * 10
            ),
            createdAt: Date.now(),
            grounded: false
        };

        this.chunks.push(chunkData);
        this.scene.add(chunk);
    }

    /**
     * Create a blood drop
     * @param {THREE.Vector3} origin - Origin position
     */
    createBloodDrop(origin) {
        const geometry = new THREE.SphereGeometry(0.03 + Math.random() * 0.05, 6, 6);
        const material = new THREE.MeshStandardMaterial({
            color: 0x8b0000,
            roughness: 0.3
        });

        const blood = new THREE.Mesh(geometry, material);
        blood.position.copy(origin);

        const velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 6,
            Math.random() * 4 + 1,
            (Math.random() - 0.5) * 6
        );

        const bloodData = {
            mesh: blood,
            velocity: velocity,
            createdAt: Date.now(),
            grounded: false
        };

        this.chunks.push(bloodData);
        this.scene.add(blood);
    }

    /**
     * Create blood pool on ground
     * @param {THREE.Vector3} position - Position for pool
     */
    createBloodPool(position) {
        const geometry = new THREE.CircleGeometry(0.3 + Math.random() * 0.3, 8);
        const material = new THREE.MeshStandardMaterial({
            color: 0x660000,
            roughness: 1,
            transparent: true,
            opacity: 0.8
        });

        const pool = new THREE.Mesh(geometry, material);
        pool.rotation.x = -Math.PI / 2;
        pool.position.set(position.x, 0.01, position.z);

        this.scene.add(pool);
        this.bloodPools.push({
            mesh: pool,
            createdAt: Date.now()
        });
    }

    /**
     * Update all gore effects
     * @param {number} deltaTime - Time since last frame
     */
    update(deltaTime) {
        const gravity = -20;
        const now = Date.now();

        // Update chunks
        for (let i = this.chunks.length - 1; i >= 0; i--) {
            const chunk = this.chunks[i];

            // Check lifetime
            if (now - chunk.createdAt > GORE.CHUNK_LIFETIME) {
                this.scene.remove(chunk.mesh);
                chunk.mesh.geometry.dispose();
                chunk.mesh.material.dispose();
                this.chunks.splice(i, 1);
                continue;
            }

            if (!chunk.grounded) {
                // Apply gravity
                chunk.velocity.y += gravity * deltaTime;

                // Update position
                chunk.mesh.position.x += chunk.velocity.x * deltaTime;
                chunk.mesh.position.y += chunk.velocity.y * deltaTime;
                chunk.mesh.position.z += chunk.velocity.z * deltaTime;

                // Rotation
                if (chunk.rotationSpeed) {
                    chunk.mesh.rotation.x += chunk.rotationSpeed.x * deltaTime;
                    chunk.mesh.rotation.y += chunk.rotationSpeed.y * deltaTime;
                    chunk.mesh.rotation.z += chunk.rotationSpeed.z * deltaTime;
                }

                // Ground collision
                if (chunk.mesh.position.y <= 0.05) {
                    chunk.mesh.position.y = 0.05;
                    chunk.grounded = true;
                    chunk.velocity.set(0, 0, 0);

                    // Create blood pool on impact
                    if (Math.random() > 0.7) {
                        this.createBloodPool(chunk.mesh.position);
                    }
                }
            }
        }

        // Clean up old blood pools
        for (let i = this.bloodPools.length - 1; i >= 0; i--) {
            const pool = this.bloodPools[i];
            if (now - pool.createdAt > GORE.BLOOD_LIFETIME * 3) {
                this.scene.remove(pool.mesh);
                pool.mesh.geometry.dispose();
                pool.mesh.material.dispose();
                this.bloodPools.splice(i, 1);
            }
        }
    }

    /**
     * Clear all effects
     */
    clear() {
        // Remove chunks
        for (const chunk of this.chunks) {
            this.scene.remove(chunk.mesh);
            chunk.mesh.geometry.dispose();
            chunk.mesh.material.dispose();
        }
        this.chunks = [];

        // Remove blood pools
        for (const pool of this.bloodPools) {
            this.scene.remove(pool.mesh);
            pool.mesh.geometry.dispose();
            pool.mesh.material.dispose();
        }
        this.bloodPools = [];
    }

    /**
     * Dispose of resources
     */
    dispose() {
        this.clear();
    }
}

export default GoreEffect;
