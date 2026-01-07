# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Start Vite dev server with hot reload
npm run build        # Production build to dist/
npm run preview      # Preview production build
```

## Testing Commands

```bash
npm test                    # Run all tests once
npm run test:watch          # Run tests in watch mode
npm run test:coverage       # Run tests with coverage report

# Run a single test file
npx vitest run tests/GameState.test.js

# Run tests matching a pattern
npx vitest run -t "should emit"
```

## Architecture

Three.js-based 3D zombie shooter with modular ES6 architecture.

### Core Layers

- **Core** (`src/core/`) - Engine, Scene, Lighting - Three.js renderer and scene setup
- **State** (`src/state/`) - EventBus (pub/sub) and GameState (centralized state with dot-notation paths)
- **Entities** (`src/entities/`) - Player, Enemy, Weapon, GoreEffect
- **Systems** (`src/systems/`) - CollisionSystem, RaycastSystem, SpawnerSystem, InputManager, AudioManager
- **UI** (`src/ui/`) - HUD, Shop, Inventory, UIManager

### Key Patterns

**Event-driven communication** via EventBus:
```javascript
import { eventBus } from './state/EventBus.js';
import { EVENTS } from './config/constants.js';
eventBus.on(EVENTS.ENEMY_KILLED, (data) => { ... });
eventBus.emit(EVENTS.ENEMY_KILLED, { reward: 50 });
```

**Centralized state** via GameState with dot-notation:
```javascript
import { gameState } from './state/GameState.js';
gameState.get('player.health');
gameState.setState('weapons.ammo.pistol', 12);
gameState.addCoins(50);
```

**Game constants** in `src/config/constants.js` - PLAYER, ZOMBIE, WEAPONS, ARMOR, AMMO, EVENTS, MAP

### Entry Points

- `index.html` - HTML shell with UI elements
- `src/main.js` - Game class that wires all systems together
- `game.html` - Legacy single-file version (2650 lines, standalone)

### Testing

Vitest with jsdom environment. Tests in `tests/` directory. Three.js components require mocking:

```javascript
vi.mock('three', () => ({
    Group: vi.fn(() => ({ add: vi.fn(), position: { ... } })),
    Mesh: vi.fn(() => ({ ... })),
    // ...
}));
```

## Game Mechanics Reference

- **Raycasting**: `RaycastSystem.shoot()` uses Three.js `raycaster.setFromCamera()` + `intersectObjects()`
- **Collision**: AABB-based via `CollisionSystem` for barriers
- **Player faces -Z direction** (negative Z is forward)
- **Headshot detection**: Enemy head is a Group containing head mesh + eyes (removed together on headshot)
- **First-person view**: FPS view model (arms + gun) attached to camera, body/legs visible, head hidden
- **Camera modes**: Toggle with V key - `gameState.get('isFirstPerson')`

## Node.js Requirements

- Requires Node.js >= 20.0.0 (jsdom@27 dependency)
- CI runs on Node 20.x and 22.x
