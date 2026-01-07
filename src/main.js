/**
 * SWAT Tactical 3D - Main Entry Point
 * Initializes and coordinates all game systems
 */

import { Engine } from './core/Engine.js';
import { Scene } from './core/Scene.js';
import { Lighting } from './core/Lighting.js';
import { Player } from './entities/Player.js';
import { Weapon } from './entities/Weapon.js';
import { GoreEffect } from './entities/GoreEffect.js';
import { CollisionSystem } from './systems/CollisionSystem.js';
import { RaycastSystem } from './systems/RaycastSystem.js';
import { SpawnerSystem } from './systems/SpawnerSystem.js';
import { InputManager } from './systems/InputManager.js';
import { AudioManager } from './systems/AudioManager.js';
import { UIManager } from './ui/UIManager.js';
import { eventBus } from './state/EventBus.js';
import { gameState } from './state/GameState.js';
import { EVENTS, ZOMBIE, ARMOR } from './config/constants.js';

class Game {
    constructor() {
        this.engine = null;
        this.scene = null;
        this.lighting = null;
        this.player = null;
        this.weapons = {};
        this.goreEffect = null;

        this.collisionSystem = null;
        this.raycastSystem = null;
        this.spawnerSystem = null;
        this.inputManager = null;
        this.audioManager = null;
        this.uiManager = null;
    }

    /**
     * Initialize the game
     */
    async init() {
        // Create core systems
        this.engine = new Engine();
        this.engine.init(document.body);

        this.scene = new Scene();
        this.scene.init();

        this.lighting = new Lighting(this.scene.getScene());
        this.lighting.init();

        // Create player
        this.player = new Player();
        this.player.init();
        this.scene.addEntity('player', this.player.getGroup());

        // Create weapons
        this.weapons.pistol = new Weapon('pistol').init();
        this.weapons.shotgun = new Weapon('shotgun').init();

        // Create gore effect system
        this.goreEffect = new GoreEffect(this.scene.getScene());

        // Create game systems
        this.collisionSystem = new CollisionSystem();
        this.collisionSystem.setBarriers(this.scene.getBarriers());

        this.raycastSystem = new RaycastSystem(this.player.getCamera(), this.scene.getScene());
        this.raycastSystem.setGoreEffect(this.goreEffect);

        this.spawnerSystem = new SpawnerSystem(this.scene.getScene());

        // Create input manager
        this.inputManager = new InputManager();
        this.inputManager.init(this.engine.getCanvas());

        // Create audio manager
        this.audioManager = new AudioManager();

        // Create UI
        this.uiManager = new UIManager();
        this.uiManager.init({
            onStart: () => this.startGame(),
            onRestart: () => this.restartGame(),
            onPurchase: (item, type) => this.handlePurchase(item, type),
            onWeaponSelect: (weaponId) => this.switchWeapon(weaponId),
            onShopClose: () => this.inputManager.requestPointerLock()
        });

        // Setup input callbacks
        this.setupInputCallbacks();

        // Setup event listeners
        this.setupEventListeners();

        // Configure engine
        this.engine.setScene(this.scene.getScene());
        this.engine.setCamera(this.player.getCamera());

        // Add update systems
        this.engine.addSystem({
            update: (deltaTime) => this.update(deltaTime)
        });

        // Start engine (rendering only, game not started yet)
        this.engine.start();
    }

    /**
     * Setup input callbacks
     */
    setupInputCallbacks() {
        this.inputManager.setShootCallback(() => this.shoot());
        this.inputManager.setWeaponSwitchCallback((weaponId) => this.switchWeapon(weaponId));
        this.inputManager.setShopToggleCallback(() => this.uiManager.toggleShop());
        this.inputManager.setCameraToggleCallback(() => this.toggleCamera());
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        eventBus.on(EVENTS.PLAYER_DIED, () => this.onPlayerDied());
    }

    /**
     * Start the game
     */
    startGame() {
        gameState.reset();
        gameState.setState('isPlaying', true);

        // Initialize audio after user interaction
        this.audioManager.init();

        this.spawnerSystem.start();
        this.inputManager.requestPointerLock();

        eventBus.emit(EVENTS.GAME_STARTED);
    }

    /**
     * Restart the game
     */
    restartGame() {
        // Reset state
        gameState.reset();
        gameState.setState('isPlaying', true);

        // Resume audio
        this.audioManager.resume();

        // Reset player position
        this.player.getGroup().position.set(0, 0, 0);

        // Clear enemies
        this.spawnerSystem.clear();
        this.spawnerSystem.start();

        // Clear gore
        this.goreEffect.clear();

        // Reset player armor visuals
        this.player.armorLevel = 0;

        this.inputManager.requestPointerLock();

        eventBus.emit(EVENTS.GAME_RESTARTED);
    }

    /**
     * Main update loop
     * @param {number} deltaTime
     */
    update(deltaTime) {
        const state = gameState.getState();

        if (!state.isPlaying || state.shopOpen) return;

        // Update player
        this.player.update(deltaTime, this.scene.getBarriers());

        // Update spawner
        this.spawnerSystem.setPlayerPosition(this.player.getPosition());
        this.spawnerSystem.update(deltaTime);

        // Update raycast system enemies
        this.raycastSystem.setEnemies(this.spawnerSystem.getAllEnemies());

        // Update gore effects
        this.goreEffect.update(deltaTime);

        // Check enemy attacks
        this.checkEnemyAttacks();
    }

    /**
     * Handle shooting
     */
    shoot() {
        const state = gameState.getState();
        const weaponType = state.weapons.current;
        const currentWeapon = this.weapons[weaponType];

        if (currentWeapon && currentWeapon.fire()) {
            const damage = currentWeapon.getDamage();
            this.raycastSystem.shoot(damage);

            // Play gunshot sound
            this.audioManager.play(weaponType);
        }
        // No sound when empty - just silent
    }

    /**
     * Switch weapon
     * @param {string} weaponId
     */
    switchWeapon(weaponId) {
        const state = gameState.getState();

        if (state.weapons.owned.includes(weaponId)) {
            gameState.switchWeapon(weaponId);
        }
    }

    /**
     * Toggle camera mode
     */
    toggleCamera() {
        const state = gameState.getState();
        gameState.setState('isFirstPerson', !state.isFirstPerson);
        this.player.updateCameraPosition();
    }

    /**
     * Check for enemy attacks on player
     */
    checkEnemyAttacks() {
        const playerPos = this.player.getPosition();
        const enemies = this.spawnerSystem.getLivingEnemies();

        for (const enemy of enemies) {
            if (enemy.isInAttackRange(playerPos) && enemy.canAttack()) {
                const damage = enemy.attack();
                gameState.damage(damage);
            }
        }
    }

    /**
     * Handle item purchase
     * @param {Object} item
     * @param {string} type
     */
    handlePurchase(item, type) {
        if (type === 'armor') {
            // Apply armor visuals
            let level = 1;
            if (item.id === ARMOR.VEST.id) level = 2;
            if (item.id === ARMOR.ASSAULT.id) level = 3;
            this.player.applyArmor(level);
        }

        this.uiManager.showMessage(`Куплено: ${item.name}`);
    }

    /**
     * Handle player death
     */
    onPlayerDied() {
        gameState.setState('isPlaying', false);
        this.spawnerSystem.stop();
        document.exitPointerLock();
    }

    /**
     * Dispose of all game resources
     */
    dispose() {
        this.engine.dispose();
        this.scene.dispose();
        this.lighting.dispose();
        this.player.dispose();
        this.goreEffect.dispose();
        this.spawnerSystem.dispose();
        this.inputManager.dispose();
        this.audioManager.dispose();
        this.uiManager.dispose();
    }
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    game.init();
});
