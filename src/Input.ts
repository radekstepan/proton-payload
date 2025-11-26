export class InputHandler {
    keys: { [key: string]: boolean } = {
        ArrowUp: false,
        ArrowDown: false,
        ArrowLeft: false,
        ArrowRight: false,
        Space: false
    };
    spaceLocked: boolean = false;

    constructor() {
        this.initKeyboard();
        this.initTouch();
    }

    private initKeyboard() {
        window.addEventListener('keydown', e => {
            if (this.keys.hasOwnProperty(e.code)) {
                this.keys[e.code] = true;
            }
        });

        window.addEventListener('keyup', e => {
            if (this.keys.hasOwnProperty(e.code)) {
                this.keys[e.code] = false;
                if(e.code === 'Space') this.spaceLocked = false;
            }
        });
    }

    private initTouch() {
        const dpadBtns = document.querySelectorAll<HTMLElement>('.dpad-btn');
        const actionBtn = document.querySelector<HTMLElement>('.action-btn');

        const handleTouch = (e: Event, key: string, state: boolean) => {
            e.preventDefault();
            this.keys[key] = state;
            if (!state && key === 'Space') this.spaceLocked = false;
        };

        dpadBtns.forEach(btn => {
            const key = btn.getAttribute('data-key')!;
            btn.addEventListener('touchstart', (e) => handleTouch(e, key, true));
            btn.addEventListener('touchend', (e) => handleTouch(e, key, false));
            btn.addEventListener('mousedown', (e) => handleTouch(e, key, true));
            btn.addEventListener('mouseup', (e) => handleTouch(e, key, false));
        });

        if (actionBtn) {
            actionBtn.addEventListener('touchstart', (e) => handleTouch(e, 'Space', true));
            actionBtn.addEventListener('touchend', (e) => handleTouch(e, 'Space', false));
            actionBtn.addEventListener('mousedown', (e) => handleTouch(e, 'Space', true));
            actionBtn.addEventListener('mouseup', (e) => handleTouch(e, 'Space', false));
        }
    }
}
