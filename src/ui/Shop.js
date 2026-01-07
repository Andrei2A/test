/**
 * Shop - In-game shop system
 * Handles weapon, armor, and ammo purchases
 */

import { eventBus } from '../state/EventBus.js';
import { gameState } from '../state/GameState.js';
import { EVENTS, WEAPONS, ARMOR, AMMO } from '../config/constants.js';

export class Shop {
    constructor() {
        this.element = null;
        this.itemsContainer = null;
        this.onPurchase = null;
        this.onClose = null;
    }

    /**
     * Initialize shop
     * @param {Function} onPurchaseCallback - Called when item purchased
     * @param {Function} onCloseCallback - Called when shop closes
     */
    init(onPurchaseCallback = null, onCloseCallback = null) {
        this.element = document.getElementById('shop');
        this.itemsContainer = document.getElementById('shopItems');
        this.onPurchase = onPurchaseCallback;
        this.onClose = onCloseCallback;

        this.setupCloseButton();
        this.renderItems();

        return this;
    }

    /**
     * Setup close button
     */
    setupCloseButton() {
        const closeBtn = document.getElementById('shopClose');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }
    }

    /**
     * Render shop items
     */
    renderItems() {
        if (!this.itemsContainer) return;

        this.itemsContainer.innerHTML = '';

        // Weapons
        this.addSectionHeader('Оружие');
        this.addItem(WEAPONS.SHOTGUN, 'weapon');

        // Armor
        this.addSectionHeader('Броня');
        this.addItem(ARMOR.CAMOUFLAGE, 'armor');
        this.addItem(ARMOR.VEST, 'armor');
        this.addItem(ARMOR.ASSAULT, 'armor');

        // Ammo
        this.addSectionHeader('Патроны');
        this.addItem(AMMO.PISTOL, 'ammo');
        this.addItem(AMMO.SHOTGUN, 'ammo');
    }

    /**
     * Add section header
     * @param {string} title
     */
    addSectionHeader(title) {
        const header = document.createElement('div');
        header.style.cssText = `
            color: #666;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin: 15px 0 10px;
            padding-bottom: 5px;
            border-bottom: 1px solid #2a2a2a;
        `;
        header.textContent = title;
        this.itemsContainer.appendChild(header);
    }

    /**
     * Add shop item
     * @param {Object} item - Item config
     * @param {string} type - Item type (weapon, armor, ammo)
     */
    addItem(item, type) {
        const state = gameState.getState();
        const canAfford = state.player.coins >= item.price;

        // Check if already owned (for weapons)
        const isOwned = type === 'weapon' && state.weapons.owned.includes(item.id);

        const itemEl = document.createElement('div');
        itemEl.className = 'shop-item';
        itemEl.innerHTML = `
            <div class="shop-item-info">
                <div class="shop-item-icon">${item.icon}</div>
                <div>
                    <div class="shop-item-name">${item.name}</div>
                    <div class="shop-item-desc">${item.description || ''}</div>
                </div>
            </div>
            <div class="shop-item-price">
                <span class="price-tag">🪙 ${item.price}</span>
                <button class="shop-btn" ${!canAfford || isOwned ? 'disabled' : ''}>
                    ${isOwned ? 'Куплено' : 'Купить'}
                </button>
            </div>
        `;

        const buyBtn = itemEl.querySelector('.shop-btn');
        if (buyBtn && !isOwned) {
            buyBtn.addEventListener('click', () => this.purchaseItem(item, type));
        }

        this.itemsContainer.appendChild(itemEl);
    }

    /**
     * Purchase an item
     * @param {Object} item - Item to purchase
     * @param {string} type - Item type
     */
    purchaseItem(item, type) {
        const success = gameState.spendCoins(item.price);

        if (!success) {
            eventBus.emit(EVENTS.PURCHASE_FAILED, { item, reason: 'insufficient_funds' });
            return;
        }

        switch (type) {
            case 'weapon':
                gameState.addWeapon(item.id);
                gameState.reloadWeapon(item.id);
                break;

            case 'armor':
                gameState.addArmor(item.armorPoints, item.healthBonus);
                break;

            case 'ammo':
                const weaponId = item.id === 'ammo' ? 'pistol' : 'shotgun';
                gameState.reloadWeapon(weaponId);
                break;
        }

        eventBus.emit(EVENTS.ITEM_PURCHASED, { item, type });

        // Call callback if set
        if (this.onPurchase) {
            this.onPurchase(item, type);
        }

        // Refresh shop
        this.renderItems();
    }

    /**
     * Open shop
     */
    open() {
        if (!this.element) return;

        gameState.setState('shopOpen', true);
        this.element.classList.remove('hidden');
        this.renderItems(); // Refresh items
        document.exitPointerLock();
    }

    /**
     * Close shop
     */
    close() {
        if (!this.element) return;

        gameState.setState('shopOpen', false);
        this.element.classList.add('hidden');

        // Call close callback to restore pointer lock
        if (this.onClose) {
            this.onClose();
        }
    }

    /**
     * Toggle shop
     */
    toggle() {
        const state = gameState.getState();
        if (state.shopOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    /**
     * Check if shop is open
     * @returns {boolean}
     */
    isOpen() {
        return gameState.getState().shopOpen;
    }

    /**
     * Dispose of shop
     */
    dispose() {
        // Remove event listeners if needed
    }
}

export default Shop;
