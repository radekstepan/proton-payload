import { InputState } from "./types";

export class InputHandler {
    keys: InputState = {
        ArrowUp: false,
        ArrowDown: false,
        ArrowLeft: false,
        ArrowRight: false,
        Space: false,
        SpaceLocked: false
    };

    constructor() {
        this.initKeyboard();
        this.initTouch();
    }

    private initKeyboard() {
        window.addEventListener('keydown', e => {
            // Type assertion for key access
            const key = e.code as keyof InputState;
            if (this.keys.hasOwnProperty(key)) {
                // We use a small hack here to assign boolean to boolean | boolean
                // but SpaceLocked is handled specifically
                (this.keys as any)[key] = true;
            }
        });

        window.addEventListener('keyup', e => {
            const key = e.code as keyof InputState;
            if (this.keys.hasOwnProperty(key)) {
                (this.keys as any)[key] = false;
                if(e.code === 'Space') this.keys.SpaceLocked = false;
            }
        });
    }

    private initTouch() {
        const dpadBtns = document.querySelectorAll<HTMLElement>('.dpad-btn');
        const actionBtn = document.querySelector<HTMLElement>('.action-btn');

        const handleTouch = (e: Event, key: keyof InputState, state: boolean) => {
            e.preventDefault();
            (this.keys as any)[key] = state;
            if (!state && key === 'Space') this.keys.SpaceLocked = false;
        };

        dpadBtns.forEach(btn => {
            const key = btn.getAttribute('data-key') as keyof InputState;
            if (key) {
                btn.addEventListener('touchstart', (e) => handleTouch(e, key, true));
                btn.addEventListener('touchend', (e) => handleTouch(e, key, false));
                btn.addEventListener('mousedown', (e) => handleTouch(e, key, true));
                btn.addEventListener('mouseup', (e) => handleTouch(e, key, false));
            }
        });

        if (actionBtn) {
            actionBtn.addEventListener('touchstart', (e) => handleTouch(e, 'Space', true));
            actionBtn.addEventListener('touchend', (e) => handleTouch(e, 'Space', false));
            actionBtn.addEventListener('mousedown', (e) => handleTouch(e, 'Space', true));
            actionBtn.addEventListener('mouseup', (e) => handleTouch(e, 'Space', false));
        }
    }
}
