import { describe, it, expect, beforeEach } from 'vitest';
import { GameCore } from '../GameCore';
import { TILE, TILE_SIZE, POWERUP_TYPE } from '../constants';
import { Player } from '../Player';
import { Enemy } from '../Enemy';
import { InputState } from '../types';

// Helper to create empty input
const createInput = (): InputState => ({
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    Space: false,
    SpaceLocked: false
});

describe('GameCore Logic', () => {
    let game: GameCore;

    beforeEach(() => {
        // No DOM setup needed!
        game = new GameCore();
        game.initLevel();
    });

    it('should initialize the level correctly', () => {
        expect(game.level).toBe(1);
        expect(game.score).toBe(0);
        expect(game.player).toBeInstanceOf(Player);
        expect(game.grid.length).toBeGreaterThan(0);
        expect(game.grid[0][0]).toBe(TILE.HARD);
    });

    it('should handle player movement and collision with walls', () => {
        const player = game.player!;
        const initialX = player.x;
        const initialY = player.y;

        const tileX = player.getTileX() + 1;
        const tileY = player.getTileY();
        game.grid[tileY][tileX] = TILE.HARD;

        const input = createInput();
        input.ArrowRight = true;
        
        // Pass input to update
        game.update(input);

        // Should not move into wall
        expect(player.x).toBe(initialX);

        // Move down into open space
        game.grid[tileY + 1][player.getTileX()] = TILE.FLOOR;
        
        input.ArrowRight = false;
        input.ArrowDown = true;
        
        game.update(input);
        expect(player.y).toBeGreaterThan(initialY);
    });

    it('should place a bomb when Space is pressed', () => {
        const player = game.player!;
        expect(game.bombs.length).toBe(0);

        const input = createInput();
        input.Space = true;
        
        game.update(input);

        expect(game.bombs.length).toBe(1);
        expect(player.activeBombs).toBe(1);
    });

    it('should destroy soft walls and spawn powerups upon explosion', () => {
        const startX = 1;
        const startY = 1;
        
        // Setup specific grid scenario
        game.grid[startY][startX + 1] = TILE.SOFT;

        const input = createInput();
        input.Space = true;
        game.update(input); // Drop bomb

        const bomb = game.bombs[0];
        
        // Manually trigger explosion to avoid waiting 180 frames
        bomb.timer = 0;
        bomb.explode();

        expect(game.grid[startY][startX + 1]).toBe(TILE.FLOOR);
        expect(game.score).toBe(10);
    });

    it('should handle powerup collection', () => {
        const player = game.player!;
        const initialRange = player.bombRange;

        game.powerups.push({
            x: player.x,
            y: player.y,
            type: POWERUP_TYPE.RANGE
        });

        const input = createInput();
        game.update(input);

        expect(player.bombRange).toBe(initialRange + 1);
        expect(game.powerups.length).toBe(0);
        expect(game.score).toBe(50);
    });

    it('should kill the player if caught in explosion', () => {
        const player = game.player!;
        
        game.spawnExplosion(player.getTileX(), player.getTileY());
        game.update(createInput());

        expect(player.dead).toBe(true);
        expect(game.isGameOver).toBe(true);
    });

    it('should kill enemies when bombed', () => {
        game.enemies = [];
        const enemy = new Enemy(game, TILE_SIZE * 5, TILE_SIZE * 5);
        game.enemies.push(enemy);

        game.spawnExplosion(5, 5);
        game.update(createInput());

        expect(enemy.dead).toBe(true);
    });
});
