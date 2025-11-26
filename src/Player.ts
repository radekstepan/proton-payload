import { Entity } from "./Entity";
import { GameCore } from "./GameCore";
import { TILE_SIZE, COLORS, POWERUP_TYPE } from "./constants";
import { Bomb } from "./Bomb";
import { Powerup, InputState } from "./types";

export class Player extends Entity {
    bombLimit: number = 1;
    bombRange: number = 1;
    activeBombs: number = 0;
    color: string = COLORS.player;

    constructor(game: GameCore, x: number, y: number) {
        super(game, x, y, 4);
    }

    update(input?: InputState) {
        if (this.dead || !input) return;

        let dx = 0;
        let dy = 0;

        if (input.ArrowUp) dy = -this.speed;
        if (input.ArrowDown) dy = this.speed;
        if (input.ArrowLeft) dx = -this.speed;
        if (input.ArrowRight) dx = this.speed;

        const getRowCenter = (y: number, h: number) => {
            const tileRow = Math.round((y + (TILE_SIZE - h)/2) / TILE_SIZE);
            return tileRow * TILE_SIZE + (TILE_SIZE - h) / 2;
        };
        const getColCenter = (x: number, w: number) => {
            const tileCol = Math.round((x + (TILE_SIZE - w)/2) / TILE_SIZE);
            return tileCol * TILE_SIZE + (TILE_SIZE - w) / 2;
        };

        const SNAP_THRESHOLD = 12;

        if (dx !== 0 && dy !== 0) {
            dy = 0;
        }

        if (dx !== 0) {
            const idealY = getRowCenter(this.y, this.h);
            const distY = Math.abs(this.y - idealY);

            if (distY < SNAP_THRESHOLD) {
                this.y = idealY;
                if (this.canMove(this.x + dx, this.y)) {
                    this.x += dx;
                }
            } else {
                const slideDir = Math.sign(idealY - this.y);
                if (this.canMove(this.x, this.y + slideDir * this.speed)) {
                    this.y += slideDir * this.speed;
                }
            }
        } 
        else if (dy !== 0) {
            const idealX = getColCenter(this.x, this.w);
            const distX = Math.abs(this.x - idealX);

            if (distX < SNAP_THRESHOLD) {
                this.x = idealX;
                if (this.canMove(this.x, this.y + dy)) {
                    this.y += dy;
                }
            } else {
                const slideDir = Math.sign(idealX - this.x);
                if (this.canMove(this.x + slideDir * this.speed, this.y)) {
                    this.x += slideDir * this.speed;
                }
            }
        }

        if (input.Space && !input.SpaceLocked) {
            this.dropBomb();
            input.SpaceLocked = true;
        }

        const powerups = this.game.powerups;
        for (let i = powerups.length - 1; i >= 0; i--) {
            let p = powerups[i];
            let dist = Math.hypot((this.x + TILE_SIZE/2) - (p.x + TILE_SIZE/2), (this.y + TILE_SIZE/2) - (p.y + TILE_SIZE/2));
            if (dist < TILE_SIZE / 2) {
                this.collectPowerup(p);
                powerups.splice(i, 1);
            }
        }

        const enemies = this.game.enemies;
        for (let e of enemies) {
            if (e.dead) continue;
            let dist = Math.hypot((this.x) - (e.x), (this.y) - (e.y));
            if (dist < TILE_SIZE * 0.6) {
                this.die();
            }
        }
    }

    dropBomb() {
        if (this.activeBombs >= this.bombLimit) return;
        
        let tx = this.getTileX();
        let ty = this.getTileY();

        if (this.game.bombs.some(b => b.tx === tx && b.ty === ty)) return;

        this.game.bombs.push(new Bomb(this.game, tx, ty, this.bombRange, this));
        this.activeBombs++;
    }

    collectPowerup(p: Powerup) {
        this.game.addScore(50);
        if (p.type === POWERUP_TYPE.RANGE) this.bombRange++;
        if (p.type === POWERUP_TYPE.BOMBS) this.bombLimit++;
        if (p.type === POWERUP_TYPE.SPEED) this.speed = Math.min(this.speed + 1, 8);
    }

    die() {
        this.dead = true;
        this.game.createParticles(this.x + TILE_SIZE/2, this.y + TILE_SIZE/2, COLORS.player, 20);
        this.game.triggerGameOver();
    }

    draw(ctx: CanvasRenderingContext2D) {
        if (this.dead) return;
        
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.beginPath();
        ctx.ellipse(this.x + TILE_SIZE/2, this.y + TILE_SIZE - 5, 10, 4, 0, 0, Math.PI*2);
        ctx.fill();

        const cx = this.x + TILE_SIZE/2;
        const cy = this.y + TILE_SIZE/2;
        
        ctx.fillStyle = this.color;
        ctx.fillRect(cx - 8, cy - 5, 16, 14);

        ctx.fillStyle = '#eee';
        ctx.beginPath();
        ctx.arc(cx, cy - 8, 10, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#111';
        ctx.fillRect(cx - 6, cy - 10, 12, 4);

        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.fillRect(cx - 5, cy - 10, 4, 2);
        ctx.shadowBlur = 0;
    }
}
