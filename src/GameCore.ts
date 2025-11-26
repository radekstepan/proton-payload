import { IGameCore } from "./interfaces";
import { TILE_SIZE, COLS, ROWS, TILE, COLORS } from "./constants";
import { Player } from "./Player";
import { Enemy } from "./Enemy";
import { Bomb } from "./Bomb";
import { Explosion } from "./Explosion";
import { Particle, Powerup, InputState } from "./types";

export class GameCore implements IGameCore {
    grid: number[][] = [];
    bombs: Bomb[] = [];
    explosions: Explosion[] = [];
    particles: Particle[] = [];
    powerups: Powerup[] = [];
    enemies: Enemy[] = [];
    player: Player | null = null;
    
    score: number = 0;
    level: number = 1;
    isGameOver: boolean = false;
    isLevelTransitioning: boolean = false;
    levelTransitionTimer: number = 0;
    screenShake: number = 0;

    constructor() {
    }

    initLevel() {
        this.grid = [];
        this.bombs = [];
        this.explosions = [];
        this.powerups = [];
        this.particles = [];
        this.enemies = [];
        this.isLevelTransitioning = false;
        
        for (let r = 0; r < ROWS; r++) {
            let row: number[] = [];
            for (let c = 0; c < COLS; c++) {
                if (r === 0 || r === ROWS - 1 || c === 0 || c === COLS - 1) {
                    row.push(TILE.HARD);
                } else if (r % 2 === 0 && c % 2 === 0) {
                    row.push(TILE.HARD);
                } else {
                    if ((r < 3 && c < 3)) {
                        row.push(TILE.FLOOR);
                    } else if (Math.random() < 0.4) {
                        row.push(TILE.SOFT);
                    } else {
                        row.push(TILE.FLOOR);
                    }
                }
            }
            this.grid.push(row);
        }

        const offset = (TILE_SIZE - (TILE_SIZE * 0.8)) / 2;
        this.player = new Player(this, TILE_SIZE + offset, TILE_SIZE + offset);

        let enemyCount = 2 + this.level;
        while(enemyCount > 0) {
            let ex = Math.floor(Math.random() * COLS);
            let ey = Math.floor(Math.random() * ROWS);
            if (this.grid[ey][ex] === TILE.FLOOR && (ex > 5 || ey > 5)) {
                this.enemies.push(new Enemy(this, ex * TILE_SIZE + offset, ey * TILE_SIZE + offset));
                enemyCount--;
            }
        }
    }

    update(input: InputState) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            let p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
            
            const decay = p.decay !== undefined ? p.decay : 0.95;
            p.size *= decay;

            if (p.life <= 0) this.particles.splice(i, 1);
        }

        if (this.screenShake > 0) this.screenShake *= 0.85;
        if (this.screenShake < 0.5) this.screenShake = 0;
        
        if (this.isGameOver) return; 

        if (!this.isLevelTransitioning && this.enemies.length === 0) {
            this.isLevelTransitioning = true;
            this.levelTransitionTimer = 120; 
        }

        if (this.isLevelTransitioning) {
            this.levelTransitionTimer--;
            if (this.levelTransitionTimer <= 0) {
                this.level++;
                this.initLevel();
                return;
            }
        }

        this.player?.update(input);
        
        this.bombs.forEach(b => b.update());
        this.explosions = this.explosions.filter(e => e.life > 0);
        this.explosions.forEach(e => e.update());
        
        this.enemies = this.enemies.filter(e => !e.dead);
        this.enemies.forEach(e => e.update());
    }

    addScore(amount: number) {
        this.score += amount;
    }

    removeBomb(bomb: Bomb) {
        this.bombs = this.bombs.filter(b => b !== bomb);
    }

    destroyPowerup(tx: number, ty: number) {
        for (let i = this.powerups.length - 1; i >= 0; i--) {
            let p = this.powerups[i];
            let pTx = Math.round(p.x / TILE_SIZE);
            let pTy = Math.round(p.y / TILE_SIZE);
            
            if (pTx === tx && pTy === ty) {
                this.powerups.splice(i, 1);
                this.createParticles(p.x + TILE_SIZE/2, p.y + TILE_SIZE/2, '#888', 8); 
            }
        }
    }

    destroyBlock(tx: number, ty: number) {
        this.grid[ty][tx] = TILE.FLOOR;
        this.createParticles(tx * TILE_SIZE + 20, ty * TILE_SIZE + 20, COLORS.wallSoft, 8);
        
        if (Math.random() < 0.35) {
            let type = Math.floor(Math.random() * 3);
            this.powerups.push({
                x: tx * TILE_SIZE,
                y: ty * TILE_SIZE,
                type: type
            });
        }
        this.score += 10;
    }

    spawnExplosion(tx: number, ty: number) {
        this.explosions.push(new Explosion(this, tx, ty));
    }

    createParticles(x: number, y: number, color: string, count: number) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 30 + Math.random() * 20,
                color: color,
                size: Math.random() * 5 + 3,
                decay: 0.95
            });
        }
    }

    setScreenShake(amount: number) {
        this.screenShake = amount;
    }

    triggerGameOver() {
        this.isGameOver = true;
    }
}
