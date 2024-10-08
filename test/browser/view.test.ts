import { test, assert } from 'vitest';
import { setup, teardown } from './hooks';
import type { Container, Sprite } from 'pixi.js';
import VaultGame from '/app';

function isVisible(stage, sprite): boolean {
    let parent = sprite.parent;
    let inStage = false;
    while (parent != null) {
        if (parent === stage) {
            inStage = true;
            break;
        }
        parent = parent.parent;
    }
    return inStage && sprite.visible && sprite.alpha > 0;
}

test('Initial condition', { timeout: 8000 }, async () => {
    setup();
    const game = new VaultGame();
    const app = document.getElementById('app');
    await game.init({
        view: {
            background: '#000',
            resizeTo: app
        }
    });
    app!.appendChild(game.view.pixi.canvas);
    return new Promise((resolve, reject) => {
        const startTest = () => {
            try {
                const background = game.view.getSprite('background');
                const door = game.view.getSprite('door');
                const doorOpen = game.view.getSprite('doorOpen');
                const doorOpenShadow = game.view.getSprite('doorOpenShadow');
                const handle = game.view.getSprite('handle');
                const handleShadow = game.view.getSprite('handleShadow');
                assert(isVisible(game.view.pixi.stage, background), `isVisible(stage, background)`);
                assert(isVisible(game.view.pixi.stage, door), `isVisible(stage, door)`);
                assert(isVisible(game.view.pixi.stage, handle), `isVisible(stage, handle)`);
                assert(isVisible(game.view.pixi.stage, handleShadow), `isVisible(stage, handleShadow)`);
                assert(!isVisible(game.view.pixi.stage, doorOpen), `!isVisible(stage, doorOpen)`);
                assert(!isVisible(game.view.pixi.stage, doorOpenShadow), `!isVisible(stage, doorOpenShadow)`);
            } catch (e) {
                reject(e);
            }
            resolve(undefined);
        };
        setTimeout(startTest, 3500);
    }).finally(() => {
        teardown();
    });
});
test('Animation of rotating the handle counter clockwise', { timeout: 10000 }, async () => {
    setup();
    const game = new VaultGame();
    const app = document.getElementById('app');
    await game.init({
        view: {
            background: '#000',
            resizeTo: app
        }
    });
    app!.appendChild(game.view.pixi.canvas);
    return new Promise((resolve, reject) => {
        const startTest = () => {
            try {
                assert(typeof game.view?.rotateHandleCCW === 'function', `typeof game.view?.rotateHandleCCW === 'function'`);
                const sprite = game.view.getSprite('handle');
                assert(sprite != null, `sprite != null`);
                const previousValue = ((sprite.rotation * 180 / Math.PI) % 360 + 360) % 360;
                assert(isFinite(previousValue), `isFinite(vaultGame.view.#sprite.handle.rotation)`);
                assert.strictEqual(Math.round(previousValue), 0, `initial handle rotation == 0`);
                const after = () => {
                    try {
                        const currentValue = ((sprite.rotation * 180 / Math.PI) % 360 + 360) % 360;
                        assert(isFinite(currentValue), `isFinite(vaultGame.view.#sprite.handle.rotation)`);
                        assert.strictEqual(Math.round(currentValue), 300, `initial handle rotation == 0`);
                    } catch (e) {
                        reject(e);
                    }
                    resolve(undefined);
                };
                setTimeout(after, 2000);
                game.view.rotateHandleCCW();
            } catch (e) {
                reject(e);
            }
        };
        setTimeout(startTest, 3500);
    }).finally(() => {
        teardown();
    });
});
test('Animation of rotating the handle clockwise', { timeout: 10000 }, async () => {
    setup();
    const game = new VaultGame();
    const app = document.getElementById('app');
    await game.init({
        view: {
            background: '#000',
            resizeTo: app
        }
    });
    app!.appendChild(game.view.pixi.canvas);
    return new Promise((resolve, reject) => {
        const startTest = () => {
            try {
                assert(typeof game.view?.rotateHandleCW === 'function', `typeof game.view?.rotateHandleCW === 'function'`);
                const sprite = game.view.getSprite('handle');
                assert(sprite != null, `sprite != null`);
                const previousValue = ((sprite.rotation * 180 / Math.PI) % 360 + 360) % 360;
                assert(isFinite(previousValue), `isFinite(vaultGame.view.#sprite.handle.rotation)`);
                assert.strictEqual(Math.round(previousValue), 0, `initial handle rotation == 0`);
                const after = () => {
                    try {
                        const currentValue = ((sprite.rotation * 180 / Math.PI) % 360 + 360) % 360;
                        assert(isFinite(currentValue), `isFinite(vaultGame.view.#sprite.handle.rotation)`);
                        assert.strictEqual(Math.round(currentValue), 60, `initial handle rotation == 0`);
                    } catch (e) {
                        reject(e);
                    }
                    resolve(undefined);
                };
                setTimeout(after, 2000);
                game.view.rotateHandleCW();
            } catch (e) {
                reject(e);
            }
        };
        setTimeout(startTest, 3500);
    }).finally(() => {
        teardown();
    });
});
test('Animation of opening/closing the door', { timeout: 15000 }, async () => {
    setup();
    const game = new VaultGame();
    const app = document.getElementById('app');
    await game.init({
        view: {
            background: '#000',
            resizeTo: app
        }
    });
    app!.appendChild(game.view.pixi.canvas);
    return new Promise((resolve, reject) => {
        const startTest = () => {
            try {
                assert(typeof game.view?.setDoorState === 'function', `typeof game.view?.setDoorState === 'function'`);
                const background = game.view.getSprite('background');
                const door = game.view.getSprite('door');
                const doorOpen = game.view.getSprite('doorOpen');
                const doorOpenShadow = game.view.getSprite('doorOpenShadow');
                const handle = game.view.getSprite('handle');
                const handleShadow = game.view.getSprite('handleShadow');
                const afterOpen = () => {
                    try {
                        assert(isVisible(game.view.pixi.stage, background), `isVisible(stage, background)`);
                        assert(!isVisible(game.view.pixi.stage, door), `!isVisible(stage, door)`);
                        assert(!isVisible(game.view.pixi.stage, handle), `!isVisible(stage, handle)`);
                        assert(!isVisible(game.view.pixi.stage, handleShadow), `!isVisible(stage, handleShadow)`);
                        assert(isVisible(game.view.pixi.stage, doorOpen), `isVisible(stage, doorOpen)`);
                        assert(isVisible(game.view.pixi.stage, doorOpenShadow), `isVisible(stage, doorOpenShadow)`);
                    } catch (e) {
                        reject(e);
                    }
                    setTimeout(afterClose, 3000);
                    game.view.setDoorState('closed');
                };
                const afterClose = () => {
                    try {
                        assert(isVisible(game.view.pixi.stage, background), `isVisible(stage, background)`);
                        assert(isVisible(game.view.pixi.stage, door), `isVisible(stage, door)`);
                        assert(isVisible(game.view.pixi.stage, handle), `isVisible(stage, handle)`);
                        assert(isVisible(game.view.pixi.stage, handleShadow), `isVisible(stage, handleShadow)`);
                        assert(!isVisible(game.view.pixi.stage, doorOpen), `!isVisible(stage, doorOpen)`);
                        assert(!isVisible(game.view.pixi.stage, doorOpenShadow), `!isVisible(stage, doorOpenShadow)`);
                    } catch (e) {
                        reject(e);
                    }
                    resolve(undefined);
                };
                setTimeout(afterOpen, 3000);
                game.view.setDoorState('opened');
            } catch (e) {
                reject(e);
            }
        };
        setTimeout(startTest, 3500);
    }).finally(() => {
        teardown();
    });
});
