/**
 * Player - Main player character entity
 * Handles player mesh, movement, and camera
 */

import * as THREE from 'three';
import { PLAYER, CAMERA, ARMOR } from '../config/constants.js';
import { eventBus } from '../state/EventBus.js';
import { gameState } from '../state/GameState.js';
import { EVENTS } from '../config/constants.js';

export class Player {
    constructor() {
        this.group = new THREE.Group();
        this.mesh = null;
        this.camera = null;
        this.velocity = new THREE.Vector3();
        this.isJumping = false;
        this.armorLevel = 0;
        this.rightArmGroup = null;
        this.gun = null;

        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            jump: false
        };

        this.rotation = { x: 0, y: 0 };

        // First-person view model (arms + gun visible to player)
        this.fpsViewModel = null;
    }

    /**
     * Initialize the player
     * @returns {Player}
     */
    init() {
        this.createMesh();
        this.createCamera();
        this.createFPSViewModel();
        this.setupControls();
        return this;
    }

    /**
     * Create player mesh with body parts
     */
    createMesh() {
        this.mesh = new THREE.Group();

        // Materials
        const skinMaterial = new THREE.MeshStandardMaterial({ color: 0xffdbac });
        const clothMaterial = new THREE.MeshStandardMaterial({ color: 0x2d2d2d });
        const pantsMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });

        // Torso
        this.torso = new THREE.Mesh(
            new THREE.BoxGeometry(1, 1.2, 0.5),
            clothMaterial.clone()
        );
        this.torso.position.y = 1.4;
        this.torso.castShadow = true;
        this.mesh.add(this.torso);

        // Head (as group with eyes)
        this.head = new THREE.Group();
        this.head.position.y = 2.3;

        const headMesh = new THREE.Mesh(
            new THREE.BoxGeometry(0.6, 0.6, 0.6),
            skinMaterial
        );
        headMesh.castShadow = true;
        this.head.add(headMesh);

        // Eyes (facing -Z direction) - added to head group
        const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
        const leftEye = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.05), eyeMaterial);
        leftEye.position.set(-0.15, 0.05, -0.3);
        this.head.add(leftEye);

        const rightEye = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.05), eyeMaterial);
        rightEye.position.set(0.15, 0.05, -0.3);
        this.head.add(rightEye);

        this.mesh.add(this.head);

        // Left arm
        this.leftArm = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, 0.8, 0.3),
            clothMaterial.clone()
        );
        this.leftArm.position.set(-0.65, 1.4, 0);
        this.leftArm.castShadow = true;
        this.mesh.add(this.leftArm);

        // Right arm with gun - extended FORWARD for aiming
        this.rightArmGroup = new THREE.Group();
        this.rightArmGroup.position.set(0.7, 1.9, 0); // Shoulder position

        this.rightArm = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, 0.8, 0.3),
            clothMaterial.clone()
        );
        this.rightArm.position.set(0, -0.6, 0); // Arm hangs from shoulder
        this.rightArm.castShadow = true;
        this.rightArmGroup.add(this.rightArm);

        // Gun at end of extended arm - pointing FORWARD
        this.gun = new THREE.Group();
        const gunBody = new THREE.Mesh(
            new THREE.BoxGeometry(0.15, 0.15, 0.5),
            new THREE.MeshStandardMaterial({ color: 0x333333 })
        );
        const gunHandle = new THREE.Mesh(
            new THREE.BoxGeometry(0.12, 0.25, 0.15),
            new THREE.MeshStandardMaterial({ color: 0x222222 })
        );
        gunHandle.position.set(0, -0.15, -0.1);
        this.gun.add(gunBody);
        this.gun.add(gunHandle);
        this.gun.position.set(0, -1.1, 0); // At end of arm
        this.gun.rotation.x = -Math.PI / 2.5; // Compensate arm rotation
        this.gun.rotation.y = Math.PI; // Barrel points forward
        this.rightArmGroup.add(this.gun);

        // Positive rotation.x = arm forward (towards -Z)
        this.rightArmGroup.rotation.x = Math.PI / 2.5;
        this.mesh.add(this.rightArmGroup);

        // Legs
        this.leftLeg = new THREE.Mesh(
            new THREE.BoxGeometry(0.35, 0.8, 0.35),
            pantsMaterial.clone()
        );
        this.leftLeg.position.set(-0.2, 0.4, 0);
        this.leftLeg.castShadow = true;
        this.mesh.add(this.leftLeg);

        this.rightLeg = new THREE.Mesh(
            new THREE.BoxGeometry(0.35, 0.8, 0.35),
            pantsMaterial.clone()
        );
        this.rightLeg.position.set(0.2, 0.4, 0);
        this.rightLeg.castShadow = true;
        this.mesh.add(this.rightLeg);

        this.group.add(this.mesh);
    }

    /**
     * Create the camera
     */
    createCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.updateCameraPosition();
    }

    /**
     * Create first-person view model (arms + gun)
     */
    createFPSViewModel() {
        this.fpsViewModel = new THREE.Group();

        const skinMaterial = new THREE.MeshStandardMaterial({ color: 0xffdbac });
        const clothMaterial = new THREE.MeshStandardMaterial({ color: 0x2d2d2d });

        // Right arm (holding gun)
        const rightArm = new THREE.Mesh(
            new THREE.BoxGeometry(0.15, 0.5, 0.15),
            clothMaterial
        );
        rightArm.position.set(0.25, -0.25, -0.3);
        rightArm.rotation.x = 0.3;
        this.fpsViewModel.add(rightArm);

        // Right hand
        const rightHand = new THREE.Mesh(
            new THREE.BoxGeometry(0.12, 0.15, 0.12),
            skinMaterial
        );
        rightHand.position.set(0.25, -0.45, -0.45);
        this.fpsViewModel.add(rightHand);

        // Left arm
        const leftArm = new THREE.Mesh(
            new THREE.BoxGeometry(0.15, 0.5, 0.15),
            clothMaterial
        );
        leftArm.position.set(-0.35, -0.3, -0.4);
        leftArm.rotation.x = 0.5;
        this.fpsViewModel.add(leftArm);

        // Left hand (supporting gun)
        const leftHand = new THREE.Mesh(
            new THREE.BoxGeometry(0.12, 0.15, 0.12),
            skinMaterial
        );
        leftHand.position.set(-0.2, -0.4, -0.6);
        this.fpsViewModel.add(leftHand);

        // Gun body
        const gunBody = new THREE.Mesh(
            new THREE.BoxGeometry(0.1, 0.12, 0.4),
            new THREE.MeshStandardMaterial({ color: 0x333333 })
        );
        gunBody.position.set(0.2, -0.35, -0.55);
        this.fpsViewModel.add(gunBody);

        // Gun barrel
        const gunBarrel = new THREE.Mesh(
            new THREE.BoxGeometry(0.06, 0.06, 0.25),
            new THREE.MeshStandardMaterial({ color: 0x222222 })
        );
        gunBarrel.position.set(0.2, -0.33, -0.8);
        this.fpsViewModel.add(gunBarrel);

        // Gun handle
        const gunHandle = new THREE.Mesh(
            new THREE.BoxGeometry(0.08, 0.18, 0.1),
            new THREE.MeshStandardMaterial({ color: 0x222222 })
        );
        gunHandle.position.set(0.2, -0.48, -0.5);
        this.fpsViewModel.add(gunHandle);

        // Initially hidden (will show in first-person mode)
        this.fpsViewModel.visible = false;
        this.camera.add(this.fpsViewModel);
    }

    /**
     * Setup input controls
     */
    setupControls() {
        document.addEventListener('keydown', this.onKeyDown.bind(this));
        document.addEventListener('keyup', this.onKeyUp.bind(this));
        document.addEventListener('mousemove', this.onMouseMove.bind(this));
    }

    onKeyDown(e) {
        const state = gameState.getState();
        if (!state.isPlaying || state.shopOpen) return;

        switch (e.code) {
            case 'KeyW': this.keys.forward = true; break;
            case 'KeyS': this.keys.backward = true; break;
            case 'KeyA': this.keys.left = true; break;
            case 'KeyD': this.keys.right = true; break;
            case 'Space':
                if (!this.isJumping) {
                    this.velocity.y = PLAYER.JUMP_FORCE;
                    this.isJumping = true;
                }
                break;
        }
    }

    onKeyUp(e) {
        switch (e.code) {
            case 'KeyW': this.keys.forward = false; break;
            case 'KeyS': this.keys.backward = false; break;
            case 'KeyA': this.keys.left = false; break;
            case 'KeyD': this.keys.right = false; break;
        }
    }

    onMouseMove(e) {
        const state = gameState.getState();
        if (!state.isPlaying || state.shopOpen) return;

        if (document.pointerLockElement) {
            this.rotation.y -= e.movementX * 0.002;
            this.rotation.x -= e.movementY * 0.002;
            this.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.rotation.x));
        }
    }

    /**
     * Update player state
     * @param {number} deltaTime - Time since last frame
     * @param {Array} barriers - Collision barriers
     */
    update(deltaTime, barriers = []) {
        // Movement
        const moveDirection = new THREE.Vector3();

        if (this.keys.forward) moveDirection.z -= 1;
        if (this.keys.backward) moveDirection.z += 1;
        if (this.keys.left) moveDirection.x -= 1;
        if (this.keys.right) moveDirection.x += 1;

        if (moveDirection.length() > 0) {
            moveDirection.normalize();
            moveDirection.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotation.y);

            const newPosition = this.group.position.clone();
            newPosition.x += moveDirection.x * PLAYER.SPEED * deltaTime;
            newPosition.z += moveDirection.z * PLAYER.SPEED * deltaTime;

            // Collision check
            if (!this.checkCollision(newPosition, barriers)) {
                this.group.position.copy(newPosition);
            }

            // Walking animation
            this.animateWalk(deltaTime);
        }

        // Gravity and jumping
        this.velocity.y += PLAYER.PHYSICS?.GRAVITY || -25 * deltaTime;
        this.group.position.y += this.velocity.y * deltaTime;

        if (this.group.position.y <= 0) {
            this.group.position.y = 0;
            this.velocity.y = 0;
            this.isJumping = false;
        }

        // Rotation
        this.mesh.rotation.y = this.rotation.y;

        // Camera
        this.updateCameraPosition();
    }

    /**
     * Check collision with barriers
     * @param {THREE.Vector3} position - Position to check
     * @param {Array} barriers - Barrier objects
     * @returns {boolean} True if collision
     */
    checkCollision(position, barriers) {
        for (const barrier of barriers) {
            const dx = position.x - barrier.position.x;
            const dz = position.z - barrier.position.z;

            const cos = Math.cos(-barrier.rotation);
            const sin = Math.sin(-barrier.rotation);
            const localX = dx * cos - dz * sin;
            const localZ = dx * sin + dz * cos;

            const halfWidth = barrier.width / 2 + PLAYER.COLLISION_RADIUS;
            const halfDepth = barrier.depth / 2 + PLAYER.COLLISION_RADIUS;

            if (Math.abs(localX) < halfWidth && Math.abs(localZ) < halfDepth) {
                return true;
            }
        }
        return false;
    }

    /**
     * Animate walking
     * @param {number} deltaTime - Time since last frame
     */
    animateWalk(deltaTime) {
        const time = performance.now() * 0.01;
        const swing = Math.sin(time) * 0.3;

        if (this.leftLeg) this.leftLeg.rotation.x = swing;
        if (this.rightLeg) this.rightLeg.rotation.x = -swing;
        if (this.leftArm) this.leftArm.rotation.x = -swing * 0.5;
    }

    /**
     * Update camera position based on view mode
     */
    updateCameraPosition() {
        const state = gameState.getState();
        const config = state.isFirstPerson ? CAMERA.FIRST_PERSON : CAMERA.THIRD_PERSON;

        if (state.isFirstPerson) {
            this.camera.position.copy(this.group.position);
            this.camera.position.y += config.eyeHeight;
            this.camera.rotation.order = 'YXZ';
            this.camera.rotation.y = this.rotation.y;
            this.camera.rotation.x = this.rotation.x;

            // Show FPS view model (arms + gun)
            if (this.fpsViewModel) {
                this.fpsViewModel.visible = true;
            }

            // Hide head but show body and legs
            if (this.head) this.head.visible = false;
            if (this.torso) this.torso.visible = true;
            if (this.leftArm) this.leftArm.visible = false; // Hide 3rd person arms
            if (this.rightArmGroup) this.rightArmGroup.visible = false;
            if (this.leftLeg) this.leftLeg.visible = true;
            if (this.rightLeg) this.rightLeg.visible = true;
            this.mesh.visible = true;
        } else {
            const offset = new THREE.Vector3(0, config.height, config.distance);
            offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotation.y);
            this.camera.position.copy(this.group.position).add(offset);
            this.camera.lookAt(
                this.group.position.x,
                this.group.position.y + PLAYER.HEIGHT,
                this.group.position.z
            );

            // Hide FPS view model
            if (this.fpsViewModel) {
                this.fpsViewModel.visible = false;
            }

            // Show full 3rd person model
            if (this.head) this.head.visible = true;
            if (this.torso) this.torso.visible = true;
            if (this.leftArm) this.leftArm.visible = true;
            if (this.rightArmGroup) this.rightArmGroup.visible = true;
            if (this.leftLeg) this.leftLeg.visible = true;
            if (this.rightLeg) this.rightLeg.visible = true;
            this.mesh.visible = true;
        }
    }

    /**
     * Apply armor visuals
     * @param {number} level - Armor level (1-3)
     */
    applyArmor(level) {
        this.armorLevel = level;
        this.updateArmorVisuals();
    }

    /**
     * Update armor visual appearance
     */
    updateArmorVisuals() {
        const camoColors = [0x4a5d23, 0x3d4f1f, 0x5c6b2f, 0x6b7a3d];

        // Apply camouflage pattern
        const applyCamo = (mesh) => {
            if (!mesh || !mesh.material) return;
            mesh.material.color.setHex(camoColors[Math.floor(Math.random() * camoColors.length)]);
        };

        if (this.armorLevel >= 1) {
            applyCamo(this.torso);
            applyCamo(this.leftArm);
            applyCamo(this.rightArm);
            applyCamo(this.leftLeg);
            applyCamo(this.rightLeg);
        }

        if (this.armorLevel >= 2) {
            // Add vest
            if (!this.vest) {
                this.vest = new THREE.Mesh(
                    new THREE.BoxGeometry(1.1, 0.8, 0.6),
                    new THREE.MeshStandardMaterial({ color: 0x3d3d3d })
                );
                this.vest.position.y = 1.5;
                this.vest.position.z = 0.05;
                this.mesh.add(this.vest);
            }
        }

        if (this.armorLevel >= 3) {
            // Add helmet
            if (!this.helmet) {
                this.helmet = new THREE.Mesh(
                    new THREE.BoxGeometry(0.7, 0.4, 0.7),
                    new THREE.MeshStandardMaterial({ color: 0x4a5d23 })
                );
                this.helmet.position.y = 2.6;
                this.mesh.add(this.helmet);
            }
        }
    }

    /**
     * Get the Three.js group
     * @returns {THREE.Group}
     */
    getGroup() {
        return this.group;
    }

    /**
     * Get the camera
     * @returns {THREE.PerspectiveCamera}
     */
    getCamera() {
        return this.camera;
    }

    /**
     * Get position
     * @returns {THREE.Vector3}
     */
    getPosition() {
        return this.group.position;
    }

    /**
     * Get direction player is facing
     * @returns {THREE.Vector3}
     */
    getDirection() {
        const direction = new THREE.Vector3(0, 0, -1);
        direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotation.y);
        return direction;
    }

    /**
     * Dispose of resources
     */
    dispose() {
        document.removeEventListener('keydown', this.onKeyDown.bind(this));
        document.removeEventListener('keyup', this.onKeyUp.bind(this));
        document.removeEventListener('mousemove', this.onMouseMove.bind(this));
    }
}

export default Player;
