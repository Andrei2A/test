/**
 * Game configuration constants
 * Single source of truth for all game parameters
 */

export const PLAYER = {
    SPEED: 8,
    HEIGHT: 2.5,
    JUMP_FORCE: 10,
    COLLISION_RADIUS: 0.6
};

export const PHYSICS = {
    GRAVITY: -25
};

export const WEAPONS = {
    PISTOL: {
        id: 'pistol',
        name: 'Пистолет',
        icon: '🔫',
        damage: 50,
        maxAmmo: 12,
        price: 0
    },
    SHOTGUN: {
        id: 'shotgun',
        name: 'Дробовик',
        icon: '💥',
        damage: 100,
        maxAmmo: 6,
        price: 50
    }
};

export const ARMOR = {
    CAMOUFLAGE: {
        id: 'armor1',
        name: 'Камуфляж',
        icon: '👔',
        description: 'Военная форма • +25 брони • +25 HP',
        armorPoints: 25,
        healthBonus: 25,
        price: 50
    },
    VEST: {
        id: 'armor2',
        name: 'Жилет',
        icon: '🦺',
        description: 'Разгрузка • +50 брони • +50 HP',
        armorPoints: 50,
        healthBonus: 50,
        price: 100
    },
    ASSAULT: {
        id: 'armor3',
        name: 'Штурмовой комплект',
        icon: '🪖',
        description: 'Полная экипировка • +100 брони • +100 HP',
        armorPoints: 100,
        healthBonus: 100,
        price: 500
    }
};

export const AMMO = {
    PISTOL: {
        id: 'ammo',
        name: 'Патроны (пистолет)',
        icon: '🔹',
        description: 'Перезарядка магазина • 12 шт',
        price: 14
    },
    SHOTGUN: {
        id: 'shotgunAmmo',
        name: 'Патроны (дробовик)',
        icon: '🔸',
        description: 'Перезарядка магазина • 6 шт',
        price: 20
    }
};

export const ZOMBIE = {
    SPEED: 2,
    HEALTH: 100,
    DAMAGE: 10,
    SPAWN_INTERVAL: 3000,
    SPAWN_DISTANCE_MIN: 60,
    SPAWN_DISTANCE_MAX: 80,
    ATTACK_RANGE: 2,
    ATTACK_COOLDOWN: 1000,
    BODY_DESPAWN_TIME: 5000,
    HEADSHOT_Y_THRESHOLD: 2.3
};

export const REWARDS = {
    KILL: 50,
    HEADSHOT: 75
};

export const CAMERA = {
    THIRD_PERSON: {
        distance: 6,
        height: 4
    },
    FIRST_PERSON: {
        eyeHeight: 2.8
    }
};

export const MAP = {
    SIZE: 200,
    BOUNDARY: 95
};

export const GORE = {
    CHUNK_COUNT: 12,
    BLOOD_COUNT: 20,
    CHUNK_LIFETIME: 5000,
    BLOOD_LIFETIME: 3000
};

export const EVENTS = {
    PLAYER_DAMAGED: 'player:damaged',
    PLAYER_DIED: 'player:died',
    ENEMY_KILLED: 'enemy:killed',
    ENEMY_HEADSHOT: 'enemy:headshot',
    WEAPON_FIRED: 'weapon:fired',
    WEAPON_SWITCHED: 'weapon:switched',
    WEAPON_EMPTY: 'weapon:empty',
    ITEM_PURCHASED: 'shop:purchased',
    PURCHASE_FAILED: 'shop:failed',
    ARMOR_BROKEN: 'armor:broken',
    STATE_CHANGED: 'state:changed',
    GAME_STARTED: 'game:started',
    GAME_OVER: 'game:over',
    GAME_RESTARTED: 'game:restarted'
};
