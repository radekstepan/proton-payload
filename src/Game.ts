import { TILE_SIZE, COLS, ROWS, COLORS, TILE, POWERUP_TYPE, GRID_WIDTH, GRID_HEIGHT } from "./constants";
import { Player } from "./Player";
import { Enemy } from "./Enemy";
import { Bomb } from "./Bomb";
import { Explosion } from "./Explosion";
import { InputHandler } from "./Input";
import { Particle, Powerup } from "./types";

export class Game {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    input: InputHandler;
    
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
    screenShake: number = 0;
    
    lastTime: number = 0;

    constructor(canvasId: string, input: InputHandler) {
        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d', { alpha: false }) as CanvasRenderingContext2D;
        this.canvas.width = GRID_WIDTH;
        this.canvas.height = GRID_HEIGHT;
        this.input = input;
    }

    initLevel() {
        this.grid = [];
        this.bombs = [];
        this.explosions = [];
        this.powerups = [];
        this.particles = [];
        this.enemies = [];
        
        // Create Grid
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
        
        document.getElementById('level-display')!.innerText = `LVL: ${this.level}`;
    }

    update(timestamp: number) {
        if (!this.lastTime) this.lastTime = timestamp;
        const deltaTime = timestamp - this.lastTime;

        if (deltaTime >= 1000 / 60) {
            this.gameLoopStep();
            this.draw();
            this.lastTime = timestamp;
        }
        
        requestAnimationFrame((ts) => this.update(ts));
    }

    gameLoopStep() {
        if (this.isGameOver) return;

        if (!this.isLevelTransitioning && this.enemies.every(e => e.dead)) {
            this.isLevelTransitioning = true;
            setTimeout(() => {
                if(!this.isGameOver) {
                    this.level++;
                    this.initLevel();
                    this.isLevelTransitioning = false;
                }
            }, 2000);
        }

        this.player?.update();
        
        this.bombs.forEach(b => b.update());
        this.explosions = this.explosions.filter(e => e.life > 0);
        this.explosions.forEach(e => e.update());
        
        this.enemies = this.enemies.filter(e => !e.dead);
        this.enemies.forEach(e => e.update());

        for (let i = this.particles.length - 1; i >= 0; i--) {
            let p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
            p.size *= 0.95;
            if (p.life <= 0) this.particles.splice(i, 1);
        }

        if (this.screenShake > 0) this.screenShake *= 0.8;
        if (this.screenShake < 0.5) this.screenShake = 0;

        document.getElementById('score-display')!.innerText = `SCORE: ${this.score}`;
    }

    draw() {
        this.ctx.fillStyle = COLORS.bg;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.save();
        
        if (this.screenShake > 0) {
            let sx = (Math.random() - 0.5) * this.screenShake * 4;
            let sy = (Math.random() - 0.5) * this.screenShake * 4;
            this.ctx.translate(Math.floor(sx), Math.floor(sy));
        }

        // Draw Map
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                let x = c * TILE_SIZE;
                let y = r * TILE_SIZE;
                let tile = this.grid[r][c];

                if (tile === TILE.HARD) {
                    this.ctx.fillStyle = COLORS.wallHard;
                    this.ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                    this.ctx.fillStyle = COLORS.wallHardTop;
                    this.ctx.fillRect(x, y, TILE_SIZE, 4);
                    this.ctx.fillRect(x, y, 4, TILE_SIZE);
                    this.ctx.fillStyle = '#222';
                    this.ctx.beginPath(); this.ctx.arc(x+8, y+8, 2, 0, Math.PI*2); this.ctx.fill();
                    this.ctx.beginPath(); this.ctx.arc(x+32, y+32, 2, 0, Math.PI*2); this.ctx.fill();
                } else if (tile === TILE.SOFT) {
                    this.ctx.fillStyle = COLORS.wallSoft;
                    this.ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                    this.ctx.fillStyle = COLORS.wallSoftHighlight;
                    this.ctx.fillRect(x + 2, y + 2, 16, 16);
                    this.ctx.fillRect(x + 22, y + 2, 16, 16);
                    this.ctx.fillRect(x + 2, y + 22, 16, 16);
                    this.ctx.fillRect(x + 22, y + 22, 16, 16);
                }
            }
        }

        // Draw Powerups
        this.powerups.forEach(p => {
            const cx = p.x + TILE_SIZE/2;
            const cy = p.y + TILE_SIZE/2;
            
            this.ctx.fillStyle = COLORS.powerup;
            this.ctx.beginPath();
            if (this.ctx.roundRect) {
                this.ctx.roundRect(p.x+5, p.y+5, 30, 30, 5);
            } else {
                this.ctx.fillRect(p.x+5, p.y+5, 30, 30);
            }
            this.ctx.fill();

            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            let symbol = '?';
            if (p.type === POWERUP_TYPE.RANGE) symbol = '☢';
            if (p.type === POWERUP_TYPE.BOMBS) symbol = '💣';
            if (p.type === POWERUP_TYPE.SPEED) symbol = '⚡';
            this.ctx.fillText(symbol, cx, cy);
        });

        this.bombs.forEach(b => b.draw(this.ctx));
        this.enemies.forEach(e => e.draw(this.ctx));
        this.player?.draw(this.ctx);
        this.explosions.forEach(e => e.draw(this.ctx));

        this.particles.forEach(p => {
            this.ctx.fillStyle = p.color;
            this.ctx.fillRect(p.x, p.y, p.size, p.size);
        });

        this.ctx.restore();
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
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                life: 30 + Math.random() * 20,
                color: color,
                size: Math.random() * 4 + 2
            });
        }
    }

    setScreenShake(amount: number) {
        this.screenShake = amount;
    }

    endGame() {
        this.isGameOver = true;
        document.getElementById('game-over')!.style.display = 'block';
        document.getElementById('go-score')!.innerText = `Final Score: ${this.score}`;
    }

    restart() {
        this.isGameOver = false;
        this.screenShake = 0;
        this.score = 0;
        this.level = 1;
        document.getElementById('game-over')!.style.display = 'none';
        this.initLevel();
    }
}
