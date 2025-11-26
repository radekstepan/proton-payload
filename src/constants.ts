export const TILE_SIZE = 40;
export const COLS = 15;
export const ROWS = 13;
export const GRID_WIDTH = COLS * TILE_SIZE;
export const GRID_HEIGHT = ROWS * TILE_SIZE;

export const COLORS = {
    bg: '#181818',
    wallHard: '#555',
    wallHardTop: '#777',
    wallSoft: '#A0522D', // Sienna
    wallSoftHighlight: '#CD853F',
    floor: '#222',
    bomb: '#e74c3c',
    bombHighlight: '#ff7675',
    fireCenter: '#ffff00',
    fireOuter: '#ff4500',
    player: '#3498db',
    enemy: '#e67e22',
    powerup: '#2ecc71'
};

export enum TILE {
    FLOOR = 0,
    HARD = 1,
    SOFT = 2
}

export enum POWERUP_TYPE {
    RANGE = 0,
    BOMBS = 1,
    SPEED = 2
}
