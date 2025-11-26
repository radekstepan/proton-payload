import { vi } from 'vitest';

// Mock the Canvas API which is not available in JSDOM
// We use 'any' casting here because getContext has multiple overloads (2d, webgl, bitmap)
// and strict TypeScript requires mocking all of them matching the exact signature.
HTMLCanvasElement.prototype.getContext = vi.fn((contextId: string) => {
    if (contextId === '2d') {
        return {
            fillRect: vi.fn(),
            clearRect: vi.fn(),
            getImageData: vi.fn(),
            putImageData: vi.fn(),
            createImageData: vi.fn(),
            setTransform: vi.fn(),
            drawImage: vi.fn(),
            save: vi.fn(),
            restore: vi.fn(),
            beginPath: vi.fn(),
            moveTo: vi.fn(),
            lineTo: vi.fn(),
            closePath: vi.fn(),
            stroke: vi.fn(),
            translate: vi.fn(),
            scale: vi.fn(),
            rotate: vi.fn(),
            arc: vi.fn(),
            fill: vi.fn(),
            measureText: vi.fn(() => ({ width: 0 })),
            transform: vi.fn(),
            rect: vi.fn(),
            clip: vi.fn(),
            ellipse: vi.fn(),
            roundRect: vi.fn(),
            fillText: vi.fn(),
        } as unknown as CanvasRenderingContext2D;
    }
    return null;
}) as any;
