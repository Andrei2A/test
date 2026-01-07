/**
 * CollisionSystem Unit Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as THREE from 'three';
import CollisionSystem from '../src/systems/CollisionSystem.js';

describe('CollisionSystem', () => {
    let collision;

    beforeEach(() => {
        collision = new CollisionSystem();
    });

    describe('checkSphereCollision()', () => {
        it('should detect collision when spheres overlap', () => {
            const pos1 = new THREE.Vector3(0, 0, 0);
            const pos2 = new THREE.Vector3(1, 0, 0);

            const result = collision.checkSphereCollision(pos1, 1, pos2, 1);

            expect(result).toBe(true);
        });

        it('should not detect collision when spheres are apart', () => {
            const pos1 = new THREE.Vector3(0, 0, 0);
            const pos2 = new THREE.Vector3(5, 0, 0);

            const result = collision.checkSphereCollision(pos1, 1, pos2, 1);

            expect(result).toBe(false);
        });

        it('should not detect collision when spheres just touch', () => {
            const pos1 = new THREE.Vector3(0, 0, 0);
            const pos2 = new THREE.Vector3(2, 0, 0);

            // Distance equals sum of radii - no overlap
            const result = collision.checkSphereCollision(pos1, 1, pos2, 1);

            expect(result).toBe(false);
        });
    });

    describe('checkRotatedBoxCollision()', () => {
        it('should detect collision with axis-aligned box', () => {
            const position = new THREE.Vector3(0, 0, 0);
            const barrier = {
                position: new THREE.Vector3(0, 0, 0),
                rotation: 0,
                width: 4,
                depth: 1
            };

            const result = collision.checkRotatedBoxCollision(position, 0.5, barrier);

            expect(result).toBe(true);
        });

        it('should not detect collision when outside box', () => {
            const position = new THREE.Vector3(10, 0, 0);
            const barrier = {
                position: new THREE.Vector3(0, 0, 0),
                rotation: 0,
                width: 4,
                depth: 1
            };

            const result = collision.checkRotatedBoxCollision(position, 0.5, barrier);

            expect(result).toBe(false);
        });

        it('should handle rotated box collision', () => {
            const position = new THREE.Vector3(2, 0, 2);
            const barrier = {
                position: new THREE.Vector3(0, 0, 0),
                rotation: Math.PI / 4, // 45 degrees
                width: 8,
                depth: 1
            };

            const result = collision.checkRotatedBoxCollision(position, 0.5, barrier);

            expect(result).toBe(true);
        });
    });

    describe('checkBarrierCollision()', () => {
        it('should check all barriers', () => {
            collision.setBarriers([
                { position: new THREE.Vector3(0, 0, 0), rotation: 0, width: 2, depth: 1 },
                { position: new THREE.Vector3(10, 0, 10), rotation: 0, width: 2, depth: 1 }
            ]);

            expect(collision.checkBarrierCollision(new THREE.Vector3(0, 0, 0))).toBe(true);
            expect(collision.checkBarrierCollision(new THREE.Vector3(10, 0, 10))).toBe(true);
            expect(collision.checkBarrierCollision(new THREE.Vector3(50, 0, 50))).toBe(false);
        });
    });

    describe('pointInSphere()', () => {
        it('should detect point inside sphere', () => {
            const point = new THREE.Vector3(0.5, 0, 0);
            const center = new THREE.Vector3(0, 0, 0);

            const result = collision.pointInSphere(point, center, 1);

            expect(result).toBe(true);
        });

        it('should detect point outside sphere', () => {
            const point = new THREE.Vector3(2, 0, 0);
            const center = new THREE.Vector3(0, 0, 0);

            const result = collision.pointInSphere(point, center, 1);

            expect(result).toBe(false);
        });
    });

    describe('raycastSphere()', () => {
        it('should detect ray hitting sphere', () => {
            const origin = new THREE.Vector3(0, 0, -5);
            const direction = new THREE.Vector3(0, 0, 1).normalize();
            const center = new THREE.Vector3(0, 0, 0);

            const result = collision.raycastSphere(origin, direction, center, 1);

            expect(result).not.toBeNull();
            expect(result.distance).toBeCloseTo(4, 1);
        });

        it('should return null for ray missing sphere', () => {
            const origin = new THREE.Vector3(10, 0, -5);
            const direction = new THREE.Vector3(0, 0, 1).normalize();
            const center = new THREE.Vector3(0, 0, 0);

            const result = collision.raycastSphere(origin, direction, center, 1);

            expect(result).toBeNull();
        });

        it('should return null for ray behind sphere', () => {
            const origin = new THREE.Vector3(0, 0, 5);
            const direction = new THREE.Vector3(0, 0, 1).normalize();
            const center = new THREE.Vector3(0, 0, 0);

            const result = collision.raycastSphere(origin, direction, center, 1);

            expect(result).toBeNull();
        });
    });

    describe('isWithinBounds()', () => {
        it('should return true for position within bounds', () => {
            const position = new THREE.Vector3(50, 0, 50);

            expect(collision.isWithinBounds(position, 100)).toBe(true);
        });

        it('should return false for position outside bounds', () => {
            const position = new THREE.Vector3(150, 0, 0);

            expect(collision.isWithinBounds(position, 100)).toBe(false);
        });
    });

    describe('clampToBounds()', () => {
        it('should clamp position to bounds', () => {
            const position = new THREE.Vector3(150, 0, -150);

            collision.clampToBounds(position, 100);

            expect(position.x).toBe(100);
            expect(position.z).toBe(-100);
        });

        it('should not modify position within bounds', () => {
            const position = new THREE.Vector3(50, 0, -50);

            collision.clampToBounds(position, 100);

            expect(position.x).toBe(50);
            expect(position.z).toBe(-50);
        });
    });

    describe('closestPointOnLine()', () => {
        it('should find closest point on line segment', () => {
            const point = new THREE.Vector3(1, 1, 0);
            const lineStart = new THREE.Vector3(0, 0, 0);
            const lineEnd = new THREE.Vector3(2, 0, 0);

            const closest = collision.closestPointOnLine(point, lineStart, lineEnd);

            expect(closest.x).toBeCloseTo(1, 5);
            expect(closest.y).toBeCloseTo(0, 5);
            expect(closest.z).toBeCloseTo(0, 5);
        });

        it('should clamp to line segment start', () => {
            const point = new THREE.Vector3(-5, 0, 0);
            const lineStart = new THREE.Vector3(0, 0, 0);
            const lineEnd = new THREE.Vector3(2, 0, 0);

            const closest = collision.closestPointOnLine(point, lineStart, lineEnd);

            expect(closest.x).toBeCloseTo(0, 5);
        });

        it('should clamp to line segment end', () => {
            const point = new THREE.Vector3(10, 0, 0);
            const lineStart = new THREE.Vector3(0, 0, 0);
            const lineEnd = new THREE.Vector3(2, 0, 0);

            const closest = collision.closestPointOnLine(point, lineStart, lineEnd);

            expect(closest.x).toBeCloseTo(2, 5);
        });
    });
});
