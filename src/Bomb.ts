import { Game } from "./Game";
import { TILE_SIZE, COLORS, COLS, ROWS, TILE } from "./constants";
import { Player } from "./Player";

export class Bomb {
    tx: number;
    ty: number;
    x: number;
    y: number;
    range: number;
    owner: Player;
    timer: number = 180;
    pulse: number = 0;
    private game: Game;

    constructor(game: Game, tx: number, ty: number, range: number, owner: Player) {
        this.game = game;
        this.tx = tx;
        this.ty = ty;
        this.x = tx * TILE_SIZE;
        this.y = ty * TILE_SIZE;
        this.range = range;
        this.owner = owner;
    }

    update() {
        this.timer--;
        this.pulse += 0.1;
        if (this.timer <= 0) {
            this.explode();
        }
    }

    explode() {
        this.owner.activeBombs--;
        this.game.removeBomb(this);
        
        this.game.destroyPowerup(this.tx, this.ty);
        this.game.spawnExplosion(this.tx, this.ty);

        const dirs = [{x:0, y:-1}, {x:0, y:1}, {x:-1, y:0}, {x:1, y:0}];
        
        dirs.forEach(d => {
            for (let i = 1; i <= this.range; i++) {
                let nx = this.tx + d.x * i;
                let ny = this.ty + d.y * i;
                
                if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS) break;

                if (this.game.grid[ny][nx] === TILE.HARD) break;

                if (this.game.grid[ny][nx] === TILE.SOFT) {
                    this.game.destroyBlock(nx, ny);
                    this.game.spawnExplosion(nx, ny);
                    break;
                }

                // Corrected: check against 'ny' instead of 'ty'
                let hitBomb = this.game.bombs.find(b => b.tx === nx && b.ty === ny);
                if (hitBomb) {
                    hitBomb.timer = 0; 
                    hitBomb.explode();
                }

                this.game.destroyPowerup(nx, ny);
                this.game.spawnExplosion(nx, ny);
            }
        });

        this.game.setScreenShake(12);
    }

    draw(ctx: CanvasRenderingContext2D) {
        const cx = this.x + TILE_SIZE/2;
        const cy = this.y + TILE_SIZE/2;
        const scale = 1 + Math.sin(this.pulse) * 0.1;

        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(cx, this.y + TILE_SIZE - 4, 12, 5, 0, 0, Math.PI*2);
        ctx.fill();

        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(scale, scale);
        
        ctx.beginPath();
        ctx.arc(0, 2, 14, 0, Math.PI*2);
        ctx.fillStyle = COLORS.bomb;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(-4, -4, 4, 0, Math.PI*2);
        ctx.fillStyle = COLORS.bombHighlight;
        ctx.fill();

        ctx.strokeStyle = '#eda';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -12);
        ctx.quadraticCurveTo(5, -18, 8, -14);
        ctx.stroke();

        if (Math.random() > 0.5) {
            ctx.fillStyle = '#ffcc00';
            ctx.fillRect(7, -15, 2, 2);
        }

        ctx.restore();
    }
}
