/**
 * Scene - Three.js scene setup and management
 * Creates and manages the game world
 */

import * as THREE from 'three';
import { MAP } from '../config/constants.js';

export class Scene {
    constructor() {
        this.scene = new THREE.Scene();
        this.entities = new Map();
    }

    /**
     * Initialize the scene with environment
     */
    init() {
        this.setupSky();
        this.setupGround();
        this.setupEnvironment();
        return this;
    }

    /**
     * Setup sky/fog
     */
    setupSky() {
        this.scene.background = new THREE.Color(0x87CEEB);
        this.scene.fog = new THREE.Fog(0x87CEEB, 50, 150);
    }

    /**
     * Create the ground plane
     */
    setupGround() {
        const groundGeometry = new THREE.PlaneGeometry(MAP.SIZE, MAP.SIZE);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x3d5c3d,
            roughness: 0.8
        });

        this.ground = new THREE.Mesh(groundGeometry, groundMaterial);
        this.ground.rotation.x = -Math.PI / 2;
        this.ground.receiveShadow = true;
        this.scene.add(this.ground);
    }

    /**
     * Setup environment objects (barriers, decorations)
     */
    setupEnvironment() {
        this.barriers = [];
        this.createBarriers();
        this.createDecorations();
    }

    /**
     * Create barrier objects
     */
    createBarriers() {
        const barrierPositions = [
            { x: 15, z: 10, rotation: 0 },
            { x: -20, z: 15, rotation: Math.PI / 4 },
            { x: 25, z: -20, rotation: -Math.PI / 6 },
            { x: -15, z: -25, rotation: Math.PI / 3 },
            { x: 0, z: 30, rotation: 0 },
            { x: 30, z: 0, rotation: Math.PI / 2 },
            { x: -30, z: 5, rotation: -Math.PI / 4 },
            { x: 10, z: -35, rotation: Math.PI / 5 }
        ];

        barrierPositions.forEach(pos => {
            const barrier = this.createBarrier();
            barrier.position.set(pos.x, 1, pos.z);
            barrier.rotation.y = pos.rotation;
            this.scene.add(barrier);
            this.barriers.push({
                mesh: barrier,
                position: new THREE.Vector3(pos.x, 1, pos.z),
                rotation: pos.rotation,
                width: 4,
                depth: 1
            });
        });
    }

    /**
     * Create a single barrier mesh
     * @returns {THREE.Mesh}
     */
    createBarrier() {
        const geometry = new THREE.BoxGeometry(4, 2, 1);
        const material = new THREE.MeshStandardMaterial({
            color: 0x8B4513,
            roughness: 0.9
        });
        const barrier = new THREE.Mesh(geometry, material);
        barrier.castShadow = true;
        barrier.receiveShadow = true;
        return barrier;
    }

    /**
     * Create decoration objects (trees, rocks)
     */
    createDecorations() {
        // Trees
        for (let i = 0; i < 30; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = 40 + Math.random() * 50;
            const x = Math.cos(angle) * distance;
            const z = Math.sin(angle) * distance;

            const tree = this.createTree();
            tree.position.set(x, 0, z);
            this.scene.add(tree);
        }

        // Rocks
        for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = 20 + Math.random() * 70;
            const x = Math.cos(angle) * distance;
            const z = Math.sin(angle) * distance;

            const rock = this.createRock();
            rock.position.set(x, 0.3, z);
            this.scene.add(rock);
        }
    }

    /**
     * Create a tree mesh
     * @returns {THREE.Group}
     */
    createTree() {
        const tree = new THREE.Group();

        // Trunk
        const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.7, 4, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x4a3728 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 2;
        trunk.castShadow = true;
        tree.add(trunk);

        // Foliage
        const foliageGeometry = new THREE.ConeGeometry(3, 6, 8);
        const foliageMaterial = new THREE.MeshStandardMaterial({ color: 0x2d5a27 });
        const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
        foliage.position.y = 6;
        foliage.castShadow = true;
        tree.add(foliage);

        return tree;
    }

    /**
     * Create a rock mesh
     * @returns {THREE.Mesh}
     */
    createRock() {
        const geometry = new THREE.DodecahedronGeometry(0.5 + Math.random() * 0.5, 0);
        const material = new THREE.MeshStandardMaterial({
            color: 0x666666,
            roughness: 0.9
        });
        const rock = new THREE.Mesh(geometry, material);
        rock.castShadow = true;
        rock.scale.y = 0.6;
        return rock;
    }

    /**
     * Add an entity to the scene
     * @param {string} id - Entity identifier
     * @param {THREE.Object3D} object - The 3D object
     */
    addEntity(id, object) {
        this.entities.set(id, object);
        this.scene.add(object);
    }

    /**
     * Remove an entity from the scene
     * @param {string} id - Entity identifier
     */
    removeEntity(id) {
        const object = this.entities.get(id);
        if (object) {
            this.scene.remove(object);
            this.entities.delete(id);
        }
    }

    /**
     * Get an entity by ID
     * @param {string} id - Entity identifier
     * @returns {THREE.Object3D|undefined}
     */
    getEntity(id) {
        return this.entities.get(id);
    }

    /**
     * Get the Three.js scene
     * @returns {THREE.Scene}
     */
    getScene() {
        return this.scene;
    }

    /**
     * Get barriers for collision detection
     * @returns {Array}
     */
    getBarriers() {
        return this.barriers;
    }

    /**
     * Dispose of all scene resources
     */
    dispose() {
        this.scene.traverse(object => {
            if (object.geometry) {
                object.geometry.dispose();
            }
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(m => m.dispose());
                } else {
                    object.material.dispose();
                }
            }
        });

        this.entities.clear();
    }
}

export default Scene;
