import { Game } from "./Game";
import { TILE_SIZE, COLORS } from "./constants";
import { Rect } from "./types";

export class Explosion {
    tx: number;
    ty: number;
    life: number = 20;
    private game: Game;

    constructor(game: Game, tx: number, ty: number) {
        this.game = game;
        this.tx = tx;
        this.ty = ty;
    }

    update() {
        this.life--;
        const rect: Rect = {
            x: this.tx * TILE_SIZE + 5, 
            y: this.ty * TILE_SIZE + 5, 
            w: 30, 
            h: 30
        };
        
        // Check Player
        const player = this.game.player;
        if (player && !player.dead) {
            if (this.rectIntersect(rect, {x: player.x, y: player.y, w: player.w, h: player.h})) {
                player.die();
            }
        }

        // Check Enemies
        this.game.enemies.forEach(e => {
            if (!e.dead && this.rectIntersect(rect, {x: e.x, y: e.y, w: e.w, h: e.h})) {
                e.dead = true;
                this.game.addScore(100);
                this.game.createParticles(e.x + TILE_SIZE/2, e.y + TILE_SIZE/2, COLORS.enemy, 15);
            }
        });
    }

    private rectIntersect(r1: Rect, r2: Rect): boolean {
        return !(r2.x > r1.x + r1.w || 
                 r2.x + r2.w < r1.x || 
                 r2.y > r1.y + r1.h || 
                 r2.y + r2.h < r1.y);
    }

    draw(ctx: CanvasRenderingContext2D) {
        const cx = this.tx * TILE_SIZE + TILE_SIZE/2;
        const cy = this.ty * TILE_SIZE + TILE_SIZE/2;
        const size = (20 - Math.abs(10 - this.life)) * 2;

        ctx.fillStyle = this.life % 4 < 2 ? COLORS.fireCenter : COLORS.fireOuter;
        
        ctx.shadowBlur = 20;
        ctx.shadowColor = COLORS.fireOuter;
        ctx.beginPath();
        ctx.rect(cx - size/2, cy - size/2, size, size);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}
