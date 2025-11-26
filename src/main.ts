import './style.css';
import { Game } from './Game';
import { InputHandler } from './Input';

window.addEventListener('DOMContentLoaded', () => {
    const input = new InputHandler();
    const game = new Game('gameCanvas', input);
    
    game.initLevel();
    requestAnimationFrame((ts) => game.update(ts));

    const restartBtn = document.getElementById('restart-btn');
    if (restartBtn) {
        restartBtn.addEventListener('click', () => {
            game.restart();
        });
    }
});
