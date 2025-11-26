import { TILE_SIZE, COLS, ROWS, COLORS, TILE, POWERUP_TYPE, GRID_WIDTH, GRID_HEIGHT } from "./constants";
import { GameCore } from "./GameCore";
import { InputHandler } from "./Input";

export class Game {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    input: InputHandler;
    core: GameCore;
    
    lastTime: number = 0;
    
    // UI Elements
    scoreEl: HTMLElement | null;
    levelEl: HTMLElement | null;
    gameOverEl: HTMLElement | null;
    goScoreEl: HTMLElement | null;

    constructor(canvasId: string, input: InputHandler) {
        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d', { alpha: false }) as CanvasRenderingContext2D;
        this.canvas.width = GRID_WIDTH;
        this.canvas.height = GRID_HEIGHT;
        this.input = input;
        
        this.core = new GameCore();
        
        this.scoreEl = document.getElementById('score-display');
        this.levelEl = document.getElementById('level-display');
        this.gameOverEl = document.getElementById('game-over');
        this.goScoreEl = document.getElementById('go-score');
    }

    initLevel() {
        this.core.initLevel();
        if(this.levelEl) this.levelEl.innerText = `LVL: ${this.core.level}`;
        if(this.gameOverEl) this.gameOverEl.style.display = 'none';
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
        // Pass the raw input state to the core logic
        this.core.update(this.input.keys);

        // Update UI based on core state
        if (this.scoreEl) this.scoreEl.innerText = `SCORE: ${this.core.score}`;
        
        // Always sync level display to ensure it updates when the core triggers a level change
        if (this.levelEl) this.levelEl.innerText = `LVL: ${this.core.level}`;

        if (this.core.isGameOver) {
            if (this.gameOverEl) this.gameOverEl.style.display = 'block';
            if (this.goScoreEl) this.goScoreEl.innerText = `Final Score: ${this.core.score}`;
        }
    }

    draw() {
        this.ctx.fillStyle = COLORS.bg;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.save();
        
        if (this.core.screenShake > 0) {
            let sx = (Math.random() - 0.5) * this.core.screenShake * 4;
            let sy = (Math.random() - 0.5) * this.core.screenShake * 4;
            this.ctx.translate(Math.floor(sx), Math.floor(sy));
        }

        // Draw Map
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                let x = c * TILE_SIZE;
                let y = r * TILE_SIZE;
                let tile = this.core.grid[r][c];

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
        this.core.powerups.forEach(p => {
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

        this.core.bombs.forEach(b => b.draw(this.ctx));
        this.core.enemies.forEach(e => e.draw(this.ctx));
        this.core.player?.draw(this.ctx);
        this.core.explosions.forEach(e => e.draw(this.ctx));

        this.core.particles.forEach(p => {
            this.ctx.fillStyle = p.color;
            this.ctx.fillRect(p.x, p.y, p.size, p.size);
        });

        this.ctx.restore();
    }

    restart() {
        this.core = new GameCore();
        this.initLevel();
    }
}
