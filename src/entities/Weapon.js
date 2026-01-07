/**
 * Weapon - Weapon entity class
 * Handles weapon properties and behavior
 */

import * as THREE from 'three';
import { WEAPONS } from '../config/constants.js';
import { eventBus } from '../state/EventBus.js';
import { gameState } from '../state/GameState.js';
import { EVENTS } from '../config/constants.js';

export class Weapon {
    constructor(type) {
        this.type = type;
        this.config = WEAPONS[type.toUpperCase()];
        this.mesh = null;
        this.lastFireTime = 0;
        this.fireRate = type === 'shotgun' ? 800 : 300; // ms between shots
    }

    /**
     * Initialize the weapon
     * @returns {Weapon}
     */
    init() {
        this.createMesh();
        return this;
    }

    /**
     * Create weapon mesh
     */
    createMesh() {
        this.mesh = new THREE.Group();

        if (this.type === 'pistol') {
            this.createPistolMesh();
        } else if (this.type === 'shotgun') {
            this.createShotgunMesh();
        }
    }

    /**
     * Create pistol mesh
     */
    createPistolMesh() {
        const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
        const handleMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });

        const body = new THREE.Mesh(
            new THREE.BoxGeometry(0.15, 0.15, 0.5),
            bodyMaterial
        );

        const handle = new THREE.Mesh(
            new THREE.BoxGeometry(0.12, 0.25, 0.15),
            handleMaterial
        );
        handle.position.set(0, -0.15, -0.1);

        this.mesh.add(body);
        this.mesh.add(handle);
    }

    /**
     * Create shotgun mesh
     */
    createShotgunMesh() {
        const metalMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });
        const woodMaterial = new THREE.MeshStandardMaterial({ color: 0x5c4033 });

        // Barrel
        const barrel = new THREE.Mesh(
            new THREE.BoxGeometry(0.12, 0.12, 0.9),
            metalMaterial
        );
        barrel.position.z = 0.2;

        // Stock
        const stock = new THREE.Mesh(
            new THREE.BoxGeometry(0.15, 0.2, 0.4),
            woodMaterial
        );
        stock.position.set(0, -0.05, -0.35);

        // Pump
        const pump = new THREE.Mesh(
            new THREE.BoxGeometry(0.14, 0.14, 0.2),
            woodMaterial
        );
        pump.position.z = 0.1;

        this.mesh.add(barrel);
        this.mesh.add(stock);
        this.mesh.add(pump);
    }

    /**
     * Check if can fire
     * @returns {boolean}
     */
    canFire() {
        const now = Date.now();
        const ammo = gameState.get(`weapons.ammo.${this.type}`);
        return ammo > 0 && now - this.lastFireTime >= this.fireRate;
    }

    /**
     * Fire the weapon
     * @returns {boolean} True if fired successfully
     */
    fire() {
        if (!this.canFire()) {
            if (gameState.get(`weapons.ammo.${this.type}`) <= 0) {
                eventBus.emit(EVENTS.WEAPON_EMPTY, { weapon: this.type });
            }
            return false;
        }

        this.lastFireTime = Date.now();
        gameState.useAmmo();

        // Recoil animation
        this.playRecoil();

        return true;
    }

    /**
     * Play recoil animation
     */
    playRecoil() {
        if (!this.mesh) return;

        const originalZ = this.mesh.position.z;
        this.mesh.position.z -= 0.1;

        setTimeout(() => {
            if (this.mesh) {
                this.mesh.position.z = originalZ;
            }
        }, 50);
    }

    /**
     * Get damage value
     * @returns {number}
     */
    getDamage() {
        return this.config.damage;
    }

    /**
     * Check if this is a shotgun (for spread calculation)
     * @returns {boolean}
     */
    isShotgun() {
        return this.type === 'shotgun';
    }

    /**
     * Get pellet count for shotgun
     * @returns {number}
     */
    getPelletCount() {
        return this.isShotgun() ? 8 : 1;
    }

    /**
     * Get spread angle for shotgun
     * @returns {number}
     */
    getSpreadAngle() {
        return this.isShotgun() ? 0.1 : 0;
    }

    /**
     * Get the mesh
     * @returns {THREE.Group}
     */
    getMesh() {
        return this.mesh;
    }

    /**
     * Dispose of resources
     */
    dispose() {
        if (this.mesh) {
            this.mesh.traverse(child => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) child.material.dispose();
            });
        }
    }
}

export default Weapon;
