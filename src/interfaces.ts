import { Bomb } from "./Bomb";
import { Enemy } from "./Enemy";
import { Player } from "./Player";
import { Powerup } from "./types";

export interface IGameCore {
    grid: number[][];
    bombs: Bomb[];
    enemies: Enemy[];
    player: Player | null;
    powerups: Powerup[];
    
    addScore(amount: number): void;
    createParticles(x: number, y: number, color: string, count: number): void;
    // Removed createGore
    setScreenShake(amount: number): void;
    triggerGameOver(): void;
    removeBomb(bomb: Bomb): void;
    destroyPowerup(tx: number, ty: number): void;
    destroyBlock(tx: number, ty: number): void;
    spawnExplosion(tx: number, ty: number): void;
}
