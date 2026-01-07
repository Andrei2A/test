# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a single-file 3D zombie shooter game built with Three.js. The entire game is contained in `game.html`.

## Running the Game

Open `game.html` directly in a browser (no build step required):
```bash
start game.html
```

## Architecture

### Single-File Structure
The game is self-contained in one HTML file with embedded CSS and JavaScript:
- **CSS (lines 7-470)**: All UI styling including HUD, shop, inventory, controls panel
- **JavaScript (lines 625+)**: Game logic using Three.js loaded via CDN

### Key Game Systems

**Player System**
- Roblox-style blocky character with body parts stored in `playerBody` object
- Weapon system: pistol (default) and shotgun (purchasable)
- Armor system with 3 tiers: camouflage, tactical vest, heavy armor
- First-person and third-person camera modes (V key toggle)

**Combat System**
- Raycaster-based shooting from camera center
- Headshot detection for shotgun (Y position > zombie.position.y + 2.3)
- Gore effects: head explosion creates meat chunks with physics

**Entity Management**
- `zombies[]`: Active zombies that chase and attack player
- `deadZombies[]`: Dead zombie bodies awaiting removal (5 second delay)
- `goreObjects[]`: Blood/meat chunks with velocity and lifetime
- `buildings[]`: AABB collision boxes for houses and barriers

**Shop System**
- Items: shotgun, 3 armor tiers, pistol ammo, shotgun ammo
- Prices defined in `buyItem()` function's `prices` object

### Global State
- `gameState`: Coins, ammo, health, armor, weapon state
- `playerBody`: References to all player mesh parts and equipment
- `cameraMode`: 'third' or 'first' person view

### Main Loop
`animate()` calls: `updatePlayer()`, `updateCamera()`, `updateZombies()`, `updateDeadZombies()`, `updateGore()`
