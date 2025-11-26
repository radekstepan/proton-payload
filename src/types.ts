import { POWERUP_TYPE } from "./constants";

export interface Point {
    x: number;
    y: number;
}

export interface Rect {
    x: number;
    y: number;
    w: number;
    h: number;
}

export interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    color: string;
    size: number;
    decay?: number;
}

export interface Powerup {
    x: number;
    y: number;
    type: POWERUP_TYPE;
}

export interface InputState {
    ArrowUp: boolean;
    ArrowDown: boolean;
    ArrowLeft: boolean;
    ArrowRight: boolean;
    Space: boolean;
    SpaceLocked: boolean;
}
