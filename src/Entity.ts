import { GameCore } from "./GameCore";
import { TILE_SIZE, COLS, ROWS, TILE } from "./constants";
import { Rect, InputState } from "./types";

export abstract class Entity {
    x: number;
    y: number;
    w: number = TILE_SIZE * 0.8;
    h: number = TILE_SIZE * 0.8;
    speed: number;
    direction: number | null = null;
    dead: boolean = false;
    protected game: GameCore;

    constructor(game: GameCore, x: number, y: number, speed: number) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.speed = speed;
    }

    getTileX(): number {
        return Math.floor((this.x + TILE_SIZE / 2) / TILE_SIZE);
    }

    getTileY(): number {
        return Math.floor((this.y + TILE_SIZE / 2) / TILE_SIZE);
    }

    rectIntersect(r1: Rect, r2: Rect): boolean {
        return !(r2.x > r1.x + r1.w || 
                 r2.x + r2.w < r1.x || 
                 r2.y > r1.y + r1.h || 
                 r2.y + r2.h < r1.y);
    }

    canMove(newX: number, newY: number): boolean {
        let bombsStandingOn: any[] = [];
        
        if (this.constructor.name === 'Player') {
            const currentRect: Rect = {
                x: this.x + (TILE_SIZE - this.w) / 2, 
                y: this.y + (TILE_SIZE - this.h) / 2, 
                w: this.w, 
                h: this.h
            };
            
            bombsStandingOn = this.game.bombs.filter(b => {
                 const margin = 4; 
                 const bombRect: Rect = {
                     x: b.x + margin, 
                     y: b.y + margin, 
                     w: TILE_SIZE - margin * 2, 
                     h: TILE_SIZE - margin * 2
                 };
                 return this.rectIntersect(currentRect, bombRect);
            });
        }

        const margin = 2;
        const corners = [
            {x: newX + (TILE_SIZE - this.w)/2 + margin, y: newY + (TILE_SIZE - this.h)/2 + margin},
            {x: newX + (TILE_SIZE - this.w)/2 + this.w - margin, y: newY + (TILE_SIZE - this.h)/2 + margin},
            {x: newX + (TILE_SIZE - this.w)/2 + margin, y: newY + (TILE_SIZE - this.h)/2 + this.h - margin},
            {x: newX + (TILE_SIZE - this.w)/2 + this.w - margin, y: newY + (TILE_SIZE - this.h)/2 + this.h - margin}
        ];

        for (let c of corners) {
            let tx = Math.floor(c.x / TILE_SIZE);
            let ty = Math.floor(c.y / TILE_SIZE);

            if (tx < 0 || tx >= COLS || ty < 0 || ty >= ROWS) return false;

            if (this.game.grid[ty][tx] !== TILE.FLOOR) return false;

            for (let b of this.game.bombs) {
                if (b.tx === tx && b.ty === ty) {
                    if (!bombsStandingOn.includes(b)) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    abstract update(input?: InputState): void;
    abstract draw(ctx: CanvasRenderingContext2D): void;
}
