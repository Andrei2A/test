/**
 * Lighting - Scene lighting setup
 * Manages all light sources in the game
 */

import * as THREE from 'three';

export class Lighting {
    constructor(scene) {
        this.scene = scene;
        this.lights = [];
    }

    /**
     * Initialize all lights
     */
    init() {
        this.setupAmbientLight();
        this.setupDirectionalLight();
        this.setupHemisphereLight();
        return this;
    }

    /**
     * Setup ambient light for base illumination
     */
    setupAmbientLight() {
        const ambient = new THREE.AmbientLight(0x404040, 0.5);
        this.scene.add(ambient);
        this.lights.push(ambient);
    }

    /**
     * Setup directional light (sun)
     */
    setupDirectionalLight() {
        const directional = new THREE.DirectionalLight(0xffffff, 1);
        directional.position.set(50, 100, 50);
        directional.castShadow = true;

        // Shadow configuration
        directional.shadow.mapSize.width = 2048;
        directional.shadow.mapSize.height = 2048;
        directional.shadow.camera.near = 0.5;
        directional.shadow.camera.far = 500;
        directional.shadow.camera.left = -100;
        directional.shadow.camera.right = 100;
        directional.shadow.camera.top = 100;
        directional.shadow.camera.bottom = -100;

        this.scene.add(directional);
        this.lights.push(directional);
        this.directionalLight = directional;
    }

    /**
     * Setup hemisphere light for sky/ground color blending
     */
    setupHemisphereLight() {
        const hemisphere = new THREE.HemisphereLight(0x87CEEB, 0x3d5c3d, 0.3);
        this.scene.add(hemisphere);
        this.lights.push(hemisphere);
    }

    /**
     * Update light positions (for dynamic lighting)
     * @param {number} deltaTime - Time since last frame
     */
    update(deltaTime) {
        // Can be used for day/night cycle or dynamic shadows
    }

    /**
     * Set time of day (0-24)
     * @param {number} hour - Hour of day
     */
    setTimeOfDay(hour) {
        const normalizedTime = hour / 24;
        const angle = normalizedTime * Math.PI * 2 - Math.PI / 2;

        if (this.directionalLight) {
            this.directionalLight.position.x = Math.cos(angle) * 100;
            this.directionalLight.position.y = Math.sin(angle) * 100 + 50;

            // Adjust intensity based on time
            const intensity = Math.max(0.2, Math.sin(normalizedTime * Math.PI));
            this.directionalLight.intensity = intensity;
        }
    }

    /**
     * Dispose of all lights
     */
    dispose() {
        this.lights.forEach(light => {
            this.scene.remove(light);
            if (light.dispose) {
                light.dispose();
            }
        });
        this.lights = [];
    }
}

export default Lighting;
