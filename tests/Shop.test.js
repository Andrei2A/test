/**
 * Shop Unit Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Shop } from '../src/ui/Shop.js';
import { gameState } from '../src/state/GameState.js';
import { eventBus } from '../src/state/EventBus.js';
import { EVENTS, WEAPONS, ARMOR, AMMO } from '../src/config/constants.js';

// Mock DOM with proper chaining support
const createMockElement = () => ({
    classList: {
        add: vi.fn(),
        remove: vi.fn()
    },
    innerHTML: '',
    appendChild: vi.fn(),
    addEventListener: vi.fn(),
    querySelector: vi.fn(() => ({ addEventListener: vi.fn() })),
    textContent: '',
    style: { cssText: '' }
});

const mockElement = createMockElement();

vi.stubGlobal('document', {
    getElementById: vi.fn((id) => {
        if (id === 'shop' || id === 'shopItems' || id === 'shopClose') {
            return mockElement;
        }
        return null;
    }),
    createElement: vi.fn(() => createMockElement()),
    exitPointerLock: vi.fn()
});

describe('Shop', () => {
    let shop;

    beforeEach(() => {
        vi.clearAllMocks();
        gameState.reset();
        eventBus.clear();
        shop = new Shop();
        // Mock renderItems to avoid complex DOM manipulation
        shop.renderItems = vi.fn();
    });

    describe('constructor', () => {
        it('should create with null properties', () => {
            const newShop = new Shop();
            expect(newShop.element).toBeNull();
            expect(newShop.itemsContainer).toBeNull();
            expect(newShop.onPurchase).toBeNull();
            expect(newShop.onClose).toBeNull();
        });
    });

    describe('init()', () => {
        it('should initialize with DOM elements', () => {
            shop.init();

            expect(shop.element).toBe(mockElement);
            expect(shop.itemsContainer).toBe(mockElement);
        });

        it('should accept purchase callback', () => {
            const callback = vi.fn();

            shop.init(callback);

            expect(shop.onPurchase).toBe(callback);
        });

        it('should accept close callback', () => {
            const onClose = vi.fn();

            shop.init(null, onClose);

            expect(shop.onClose).toBe(onClose);
        });

        it('should return this for chaining', () => {
            const result = shop.init();

            expect(result).toBe(shop);
        });

        it('should call renderItems', () => {
            shop.init();

            expect(shop.renderItems).toHaveBeenCalled();
        });
    });

    describe('open()', () => {
        it('should set shopOpen state to true', () => {
            shop.init();

            shop.open();

            expect(gameState.get('shopOpen')).toBe(true);
        });

        it('should remove hidden class', () => {
            shop.init();

            shop.open();

            expect(mockElement.classList.remove).toHaveBeenCalledWith('hidden');
        });

        it('should exit pointer lock', () => {
            shop.init();

            shop.open();

            expect(document.exitPointerLock).toHaveBeenCalled();
        });
    });

    describe('close()', () => {
        it('should set shopOpen state to false', () => {
            shop.init();
            gameState.setState('shopOpen', true);

            shop.close();

            expect(gameState.get('shopOpen')).toBe(false);
        });

        it('should add hidden class', () => {
            shop.init();

            shop.close();

            expect(mockElement.classList.add).toHaveBeenCalledWith('hidden');
        });

        it('should call onClose callback', () => {
            const onClose = vi.fn();
            shop.init(null, onClose);

            shop.close();

            expect(onClose).toHaveBeenCalled();
        });
    });

    describe('toggle()', () => {
        it('should open when closed', () => {
            shop.init();
            gameState.setState('shopOpen', false);

            shop.toggle();

            expect(gameState.get('shopOpen')).toBe(true);
        });

        it('should close when open', () => {
            shop.init();
            gameState.setState('shopOpen', true);

            shop.toggle();

            expect(gameState.get('shopOpen')).toBe(false);
        });
    });

    describe('isOpen()', () => {
        it('should return shop state', () => {
            shop.init();
            gameState.setState('shopOpen', true);

            expect(shop.isOpen()).toBe(true);

            gameState.setState('shopOpen', false);

            expect(shop.isOpen()).toBe(false);
        });
    });

    describe('purchaseItem()', () => {
        beforeEach(() => {
            shop.init();
            gameState.addCoins(500);
        });

        it('should spend coins on purchase', () => {
            shop.purchaseItem(WEAPONS.SHOTGUN, 'weapon');

            expect(gameState.get('player.coins')).toBe(450);
        });

        it('should add weapon when buying weapon', () => {
            shop.purchaseItem(WEAPONS.SHOTGUN, 'weapon');

            expect(gameState.get('weapons.owned')).toContain('shotgun');
        });

        it('should add armor when buying armor', () => {
            shop.purchaseItem(ARMOR.CAMOUFLAGE, 'armor');

            expect(gameState.get('player.armor')).toBe(25);
        });

        it('should reload ammo when buying ammo', () => {
            gameState.setState('weapons.ammo.pistol', 0);

            shop.purchaseItem(AMMO.PISTOL, 'ammo');

            expect(gameState.get('weapons.ammo.pistol')).toBe(12);
        });

        it('should emit ITEM_PURCHASED event', () => {
            const callback = vi.fn();
            eventBus.on(EVENTS.ITEM_PURCHASED, callback);

            shop.purchaseItem(WEAPONS.SHOTGUN, 'weapon');

            expect(callback).toHaveBeenCalled();
        });

        it('should call onPurchase callback', () => {
            const onPurchase = vi.fn();
            shop.onPurchase = onPurchase;

            shop.purchaseItem(WEAPONS.SHOTGUN, 'weapon');

            expect(onPurchase).toHaveBeenCalledWith(WEAPONS.SHOTGUN, 'weapon');
        });

        it('should fail if insufficient coins', () => {
            gameState.setState('player.coins', 0);
            const callback = vi.fn();
            eventBus.on(EVENTS.PURCHASE_FAILED, callback);

            shop.purchaseItem(WEAPONS.SHOTGUN, 'weapon');

            expect(callback).toHaveBeenCalled();
        });

    });
});
