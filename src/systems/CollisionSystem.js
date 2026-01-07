/**
 * CollisionSystem - Handles all collision detection
 * Manages player-barrier, player-enemy, and projectile collisions
 */

import * as THREE from 'three';
import { PLAYER, ZOMBIE } from '../config/constants.js';

export class CollisionSystem {
    constructor() {
        this.barriers = [];
    }

    /**
     * Set barriers for collision detection
     * @param {Array} barriers - Array of barrier objects
     */
    setBarriers(barriers) {
        this.barriers = barriers;
    }

    /**
     * Check if position collides with any barrier
     * @param {THREE.Vector3} position - Position to check
     * @param {number} radius - Collision radius
     * @returns {boolean}
     */
    checkBarrierCollision(position, radius = PLAYER.COLLISION_RADIUS) {
        for (const barrier of this.barriers) {
            if (this.checkRotatedBoxCollision(position, radius, barrier)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Check collision with rotated box (AABB after rotation)
     * @param {THREE.Vector3} position - Position to check
     * @param {number} radius - Collision radius
     * @param {Object} barrier - Barrier object with position, rotation, width, depth
     * @returns {boolean}
     */
    checkRotatedBoxCollision(position, radius, barrier) {
        const dx = position.x - barrier.position.x;
        const dz = position.z - barrier.position.z;

        // Transform to local space
        const cos = Math.cos(-barrier.rotation);
        const sin = Math.sin(-barrier.rotation);
        const localX = dx * cos - dz * sin;
        const localZ = dx * sin + dz * cos;

        const halfWidth = barrier.width / 2 + radius;
        const halfDepth = barrier.depth / 2 + radius;

        return Math.abs(localX) < halfWidth && Math.abs(localZ) < halfDepth;
    }

    /**
     * Check if two spheres collide
     * @param {THREE.Vector3} pos1 - First position
     * @param {number} radius1 - First radius
     * @param {THREE.Vector3} pos2 - Second position
     * @param {number} radius2 - Second radius
     * @returns {boolean}
     */
    checkSphereCollision(pos1, radius1, pos2, radius2) {
        const distance = pos1.distanceTo(pos2);
        return distance < radius1 + radius2;
    }

    /**
     * Check if player is in attack range of enemy
     * @param {THREE.Vector3} playerPos - Player position
     * @param {THREE.Vector3} enemyPos - Enemy position
     * @returns {boolean}
     */
    checkAttackRange(playerPos, enemyPos) {
        const distance = playerPos.distanceTo(enemyPos);
        return distance <= ZOMBIE.ATTACK_RANGE;
    }

    /**
     * Check point in sphere
     * @param {THREE.Vector3} point - Point to check
     * @param {THREE.Vector3} sphereCenter - Sphere center
     * @param {number} radius - Sphere radius
     * @returns {boolean}
     */
    pointInSphere(point, sphereCenter, radius) {
        return point.distanceTo(sphereCenter) <= radius;
    }

    /**
     * Get closest point on line segment to a point
     * @param {THREE.Vector3} point - The point
     * @param {THREE.Vector3} lineStart - Line segment start
     * @param {THREE.Vector3} lineEnd - Line segment end
     * @returns {THREE.Vector3}
     */
    closestPointOnLine(point, lineStart, lineEnd) {
        const line = new THREE.Vector3().subVectors(lineEnd, lineStart);
        const len = line.length();
        line.normalize();

        const v = new THREE.Vector3().subVectors(point, lineStart);
        let d = v.dot(line);
        d = Math.max(0, Math.min(len, d));

        return new THREE.Vector3()
            .copy(lineStart)
            .add(line.multiplyScalar(d));
    }

    /**
     * Raycast against a sphere
     * @param {THREE.Vector3} origin - Ray origin
     * @param {THREE.Vector3} direction - Ray direction (normalized)
     * @param {THREE.Vector3} sphereCenter - Sphere center
     * @param {number} radius - Sphere radius
     * @returns {Object|null} Hit info or null
     */
    raycastSphere(origin, direction, sphereCenter, radius) {
        const oc = new THREE.Vector3().subVectors(origin, sphereCenter);

        const a = direction.dot(direction);
        const b = 2.0 * oc.dot(direction);
        const c = oc.dot(oc) - radius * radius;
        const discriminant = b * b - 4 * a * c;

        if (discriminant < 0) {
            return null;
        }

        const t = (-b - Math.sqrt(discriminant)) / (2.0 * a);

        if (t < 0) {
            return null;
        }

        const hitPoint = new THREE.Vector3()
            .copy(origin)
            .add(direction.clone().multiplyScalar(t));

        return {
            distance: t,
            point: hitPoint
        };
    }

    /**
     * Check if position is within map bounds
     * @param {THREE.Vector3} position - Position to check
     * @param {number} boundary - Map boundary
     * @returns {boolean}
     */
    isWithinBounds(position, boundary) {
        return Math.abs(position.x) < boundary && Math.abs(position.z) < boundary;
    }

    /**
     * Clamp position to map bounds
     * @param {THREE.Vector3} position - Position to clamp
     * @param {number} boundary - Map boundary
     * @returns {THREE.Vector3}
     */
    clampToBounds(position, boundary) {
        position.x = Math.max(-boundary, Math.min(boundary, position.x));
        position.z = Math.max(-boundary, Math.min(boundary, position.z));
        return position;
    }

    /**
     * Find all enemies within radius
     * @param {THREE.Vector3} center - Center position
     * @param {number} radius - Search radius
     * @param {Array} enemies - Array of enemy objects
     * @returns {Array}
     */
    findEnemiesInRadius(center, radius, enemies) {
        return enemies.filter(enemy => {
            const distance = center.distanceTo(enemy.getPosition());
            return distance <= radius;
        });
    }
}

export default CollisionSystem;
