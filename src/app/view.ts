import { Application, Assets, Sprite, Texture } from "pixi.js";

import backgroundImageUrl from './assets/images/background.png';
import { VaultViewInitOptions } from "../@types/app/view";

const backgroundInfo = {
    /// In screens with very eccentric aspect ratio, we want to ensure the vault and the keyboard/timer screen are visible.
    minDisplayArea: {
        width: 3000 / 5995,
        height: 2000 / 3000,
    }
}

/**
 * The View for the vault.
 * 
 * The view is reactive receiver class.
 * It would react to browser window resize, but reactions would not change the game state.
 * It is information receiver only. Any information here would be used to display content on the screen,
 * control animations and ensure the elements shown match the view state.
 * 
 * The view state is not readable and the game state should not depend on it. Instead the view just provide
 * the necessary functions to display in the game, like the handle rotation (both in steps and at specific angle delta),
 * opening/closing the door, etc. The game state is handled by the model instead.
 * 
 * The view state won't react to any user interaction. It only react to the browser events to maintain proper display
 * when the browser window and screen resolution changes.
 */
export default class VaultView {
    public readonly pixi: Application = new Application();
    #initialized = false;
    #texture: Record<string, Texture> = {};
    #sprite: Record<string, Sprite> = {};

    #backgroundAspectRatio: number;

    constructor() {
        this.#backgroundAspectRatio = 1;
    }

    async init(options: Partial<VaultViewInitOptions> = {}) {
        if (this.#initialized) {
            return;
        }
        this.#initialized = true;
        try {
            await this.#init(options);
        } catch (e) {
            this.#initialized = false;
            throw e;
        }
    }

    async #init(options: Partial<VaultViewInitOptions> = {}) {
        await this.pixi.init(options);

        Assets.backgroundLoad([
            backgroundImageUrl
        ]);

        this.#texture.background = await Assets.load(backgroundImageUrl);
        this.#backgroundAspectRatio = this.#texture.background.width / this.#texture.background.height;
        this.#sprite.background = new Sprite(this.#texture.background);
        this.#sprite.background.anchor.set(0.5, 0.5);

        this.pixi.renderer.addListener('resize', this.#onScreenResize, this);
        this.#onScreenResize(this.pixi.renderer.width, this.pixi.renderer.height, this.pixi.renderer.resolution);

        this.pixi.stage.addChild(this.#sprite.background);
    }

    #onScreenResize(width: number, height: number, _resolution: number) {
        this.#resizeBackground(width, height, _resolution);
    }

    #resizeBackground(width: number, height: number, _resolution: number) {
        const screenAspectRatio = width / height;
        if /* unlikely */ (!isFinite(screenAspectRatio)) {
            return;
        }

        // Compute the background size, potentially cutting away from the sides;
        if (this.#backgroundAspectRatio > screenAspectRatio) {
            this.#sprite.background.width = height * this.#backgroundAspectRatio;
            this.#sprite.background.height = height;
        } else {
            this.#sprite.background.width = width;
            this.#sprite.background.height = width / this.#backgroundAspectRatio;
        }
        // Center the background onto the stage;
        this.#sprite.background.x = width * 0.5;
        this.#sprite.background.y = height * 0.5;

        // When the aspect ratio is too large/small, i.e. the screen is too tall and thin, or wide and narrow,
        // part of the user interface can be cut away (keyboard with the timer);
        // Fix that by making the background shrink to fit the minimum display area;
        // This is not "shrink to fit", as part of the background may be cut away, but the essentials would be on the screen;
        const backgroundVisible = {
            width: Math.min(width / this.#sprite.background.width, 1),
            height: Math.min(height / this.#sprite.background.height, 1)
        };
        const backgroundRatio = {
            width: Math.min(backgroundVisible.width / backgroundInfo.minDisplayArea.width, 1),
            height: Math.min(backgroundVisible.height / backgroundInfo.minDisplayArea.height, 1)
        }
        const resizeToFit = Math.min(backgroundRatio.width, backgroundRatio.height);
        if (resizeToFit < 1) {
            this.#sprite.background.setSize(
                this.#sprite.background.width * resizeToFit,
                this.#sprite.background.height * resizeToFit,
            )
        }
    }
}
