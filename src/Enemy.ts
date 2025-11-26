import { Entity } from "./Entity";
import { IGameCore } from "./interfaces";
import { TILE_SIZE, COLORS } from "./constants";

export class Enemy extends Entity {
    readonly type = 'Enemy';
    isEating: boolean = false;

    constructor(game: IGameCore, x: number, y: number) {
        super(game, x, y, 2);
        this.direction = 1;
        
        const offset = (TILE_SIZE - this.h) / 2;
        this.x = Math.round((this.x - offset) / TILE_SIZE) * TILE_SIZE + offset;
        this.y = Math.round((this.y - offset) / TILE_SIZE) * TILE_SIZE + offset;
    }

    triggerEating(targetX?: number, targetY?: number) {
        this.isEating = true;
        if (targetX !== undefined && targetY !== undefined) {
            // Snap exactly to where the player was
            this.x = targetX;
            this.y = targetY;
        } else {
            // Fallback to center of current tile
            const cx = this.getTileX() * TILE_SIZE + (TILE_SIZE - this.w) / 2;
            const cy = this.getTileY() * TILE_SIZE + (TILE_SIZE - this.h) / 2;
            this.x = cx;
            this.y = cy;
        }
    }

    update() {
        if (this.dead) return;
        if (this.isEating) return;

        const offset = (TILE_SIZE - this.h) / 2;
        const gridX = Math.round((this.x - offset) / TILE_SIZE);
        const gridY = Math.round((this.y - offset) / TILE_SIZE);
        
        const centerX = gridX * TILE_SIZE + offset;
        const centerY = gridY * TILE_SIZE + offset;

        const dist = Math.abs(this.x - centerX) + Math.abs(this.y - centerY);
        const atCenter = dist < this.speed;

        if (atCenter) {
            this.x = centerX;
            this.y = centerY;
            this.pickDirection();
        }

        let dx = 0, dy = 0;
        if (this.direction === 0) dy = -this.speed;
        if (this.direction === 1) dx = this.speed;
        if (this.direction === 2) dy = this.speed;
        if (this.direction === 3) dx = -this.speed;

        if (this.canMove(this.x + dx, this.y + dy)) {
            this.x += dx;
            this.y += dy;
        } else {
            if (!atCenter) {
                this.direction = (this.direction! + 2) % 4;
            }
        }
    }

    pickDirection() {
        const candidates: number[] = [];
        const directions = [
            { dir: 0, dx: 0, dy: -this.speed },
            { dir: 1, dx: this.speed, dy: 0 },
            { dir: 2, dx: 0, dy: this.speed },
            { dir: 3, dx: -this.speed, dy: 0 }
        ];

        for(let d of directions) {
            if(this.canMove(this.x + d.dx, this.y + d.dy)) {
                candidates.push(d.dir);
            }
        }

        if (candidates.length === 0) return;

        if (this.direction !== null && candidates.includes(this.direction) && Math.random() > 0.25) {
            // Keep going
        } else {
            this.direction = candidates[Math.floor(Math.random() * candidates.length)];
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        if (this.dead) return;
        const cx = this.x + TILE_SIZE/2;
        const cy = this.y + TILE_SIZE/2;

        if (this.isEating) {
            const flash = Math.floor(Date.now() / 100) % 2 === 0;
            ctx.fillStyle = flash ? '#ff0000' : COLORS.enemy;
        } else {
            ctx.fillStyle = COLORS.enemy;
        }
        
        ctx.beginPath();
        ctx.arc(cx, cy, 14, 0, Math.PI*2);
        ctx.fill();

        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(cx - 5, cy - 3, 4, 0, Math.PI*2);
        ctx.arc(cx + 5, cy - 3, 4, 0, Math.PI*2);
        ctx.fill();

        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(cx - 5, cy - 3, 2, 0, Math.PI*2);
        ctx.arc(cx + 5, cy - 3, 2, 0, Math.PI*2);
        ctx.fill();

        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - 8, cy - 8);
        ctx.lineTo(cx - 2, cy - 5);
        ctx.moveTo(cx + 8, cy - 8);
        ctx.lineTo(cx + 2, cy - 5);
        ctx.stroke();
    }
}
