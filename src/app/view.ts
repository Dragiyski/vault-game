import { VaultViewInitOptions } from '../@types/app/view';
import { Application, Assets, Container, DEG_TO_RAD, PointData, RAD_TO_DEG, Rectangle, Size, Sprite, Texture } from 'pixi.js';
import gsap from '../lib/gsap';

import sparkPositionData from './sparks.json';

import backgroundImageUrl from './assets/images/background.png';
import doorImageUrl from './assets/images/door.png';
import handleImageUrl from './assets/images/handle.png';
import handleShadowImageUrl from './assets/images/handle-shadow.png';
import doorOpenImageUrl from './assets/images/door-open.png';
import doorOpenShadowImageUrl from './assets/images/door-open-shadow.png';
import blinkImageUrl from './assets/images/blink.png';

const backgroundInfo = {
    /// In screens with very eccentric aspect ratio, we want to ensure the vault and the keyboard/timer screen are visible.
    minDisplayArea: {
        width: 3000 / 5995,
        height: 2000 / 3000,
    }
}

const pi2 = Math.PI * 2;

export enum VaultDoorState {
    Opened = 'opened',
    Closed = 'closed'
};

const sparkPosition: Array<PointData> = [
    {
        x: 2500 / 6000,
        y: 1470 / 3000
    },
    {
        x: 2920 / 6000,
        y: 1460 / 3000
    },
    {
        x: 3185 / 6000,
        y: 1850 / 3000
    }
];

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
    #job: Record<string, Promise<any> | null> = {
        handle: null,
        door: null
    };

    #stateDoor = VaultDoorState.Closed;
    #sparkAnimation = gsap.timeline({
        paused: true
    });
    #sparkContainer = new Container();

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
            backgroundImageUrl,
            doorImageUrl,
            handleImageUrl,
            handleShadowImageUrl,
            doorOpenImageUrl,
            doorOpenShadowImageUrl,
            blinkImageUrl
        ]);

        this.#texture.background = await Assets.load(backgroundImageUrl);
        this.#texture.door = await Assets.load(doorImageUrl);
        this.#texture.handle = await Assets.load(handleImageUrl);
        this.#texture.handleShadow = await Assets.load(handleShadowImageUrl);
        this.#texture.doorOpen = await Assets.load(doorOpenImageUrl);
        this.#texture.doorOpenShadow = await Assets.load(doorOpenShadowImageUrl);
        this.#texture.blink = await Assets.load(blinkImageUrl);

        this.#backgroundAspectRatio = this.#texture.background.width / this.#texture.background.height;

        this.#sprite.background = new Sprite(this.#texture.background);
        this.#sprite.background.anchor.set(0.5);

        this.#sprite.handle = new Sprite(this.#texture.handle);
        this.#sprite.handle.anchor.set(0.5);
        this.#sprite.handleShadow = new Sprite(this.#texture.handleShadow);
        this.#sprite.handleShadow.anchor.set(0.5);
        
        this.#sprite.door = new Sprite(this.#texture.door);

        // The door is perfect circle with hinges on the right side.
        // The anchor point is the center of the door.
        this.#sprite.door.anchor.set(
            (1832 / 2013) * 0.5,
            0.5
        );

        this.#sprite.doorOpen = new Sprite(this.#texture.doorOpen);
        this.#sprite.doorOpen.anchor.set(0, 0.5);
        this.#sprite.doorOpenShadow = new Sprite(this.#texture.doorOpenShadow);
        this.#sprite.doorOpenShadow.anchor.set(0, 0.5);

        for (let i = 0; i < sparkPosition.length; ++i) {
            const sprite = this.#sprite[`spark_${i}`] = new Sprite(this.#texture.blink);
            sprite.anchor.set(0.5);
            this.#sparkContainer.addChild(sprite);
        }

        this.pixi.renderer.addListener('resize', this.#onScreenResize, this);
        this.#onScreenResize(this.pixi.renderer.width, this.pixi.renderer.height, this.pixi.renderer.resolution);

        this.pixi.stage.addChild(this.#sprite.background);
        // It seems while Sprite class have "children" element, pixi v8.x report using sprite as containers as deprecated.
        // For now, all sprites will be at the global level, but it is preferred as connected sprites like the door + handle
        // be in a container so they can move/resize with the container.
        this.#updateDoorState();
    }

    #updateDoorState() {
        if (this.#stateDoor === VaultDoorState.Opened) {
            this.pixi.stage.removeChild(this.#sprite.door);
            this.pixi.stage.removeChild(this.#sprite.handleShadow);
            this.pixi.stage.removeChild(this.#sprite.handle);
            this.pixi.stage.addChild(this.#sprite.doorOpenShadow);
            this.pixi.stage.addChild(this.#sprite.doorOpen);
            this.pixi.stage.addChild(this.#sparkContainer);
        } else {
            this.pixi.stage.addChild(this.#sprite.door);
            this.pixi.stage.addChild(this.#sprite.handleShadow);
            this.pixi.stage.addChild(this.#sprite.handle);
            this.pixi.stage.removeChild(this.#sprite.doorOpenShadow);
            this.pixi.stage.removeChild(this.#sprite.doorOpen);
            this.pixi.stage.removeChild(this.#sparkContainer);
        }
    }

    #onScreenResize(width: number, height: number, _resolution: number) {
        this.#resizeBackground(width, height, _resolution);
        this.#resizeClosedDoor(width, height, _resolution);
        this.#resizeOpenedDoor(width, height, _resolution);
        this.#resizeSparks(width, height, _resolution);
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

    #resizeClosedDoor(width: number, height: number, _resolution: number) {
        this.#sprite.door.width = (2013 / 5995) * this.#sprite.background.width;
        this.#sprite.door.height = (1832 / 3000) * this.#sprite.background.height;
        // For some reason the vault hole is not at the center of the background image.
        this.#sprite.door.x = width * 0.5 - (30 / 5995) * this.#sprite.background.width;
        this.#sprite.door.y = height * 0.5 - (30 / 3000) * this.#sprite.background.height;

        this.#resizeClosedDoorHandle(width, height, _resolution);
    }

    #resizeClosedDoorHandle(width: number, height: number, _resolution: number) {
        this.#sprite.handle.width = (677 / 5995) * this.#sprite.background.width;
        this.#sprite.handle.height = (748 / 3000) * this.#sprite.background.height;
        this.#sprite.handleShadow.width = (658 / 677) * this.#sprite.handle.width;
        this.#sprite.handleShadow.height = (729 / 748) * this.#sprite.handle.height;
        // For some reason the vault hole is not at the center of the background image.
        this.#sprite.handle.x = width * 0.5 - (40 / 5995) * this.#sprite.background.width;
        this.#sprite.handle.y = height * 0.5 - (40 / 3000) * this.#sprite.background.height;
        this.#sprite.handleShadow.x = this.#sprite.handle.x + (16 / 677) * this.#sprite.handle.width
        this.#sprite.handleShadow.y = this.#sprite.handle.y + (32 / 748) * this.#sprite.handle.height;
    }

    #resizeOpenedDoor(width: number, height: number, _resolution: number) {
        this.#sprite.doorOpen.width = (1245 / 5995) * this.#sprite.background.width;
        this.#sprite.doorOpen.height = (1826 / 3000) * this.#sprite.background.height;
        this.#sprite.doorOpenShadow.width = (1374 / 1245) * this.#sprite.doorOpen.width;
        this.#sprite.doorOpenShadow.height = (1819 / 1826) * this.#sprite.doorOpen.height;
        this.#sprite.doorOpen.x = width * 0.5 + (850 / 5995) * this.#sprite.background.width;
        this.#sprite.doorOpen.y = height * 0.5 - (30 / 3000) * this.#sprite.background.height;
        this.#sprite.doorOpenShadow.x = this.#sprite.doorOpen.x + (30 / 1245) * this.#sprite.doorOpen.width;
        this.#sprite.doorOpenShadow.y = this.#sprite.doorOpen.y + (60 / 1826) * this.#sprite.doorOpen.height;
    }

    #resizeSparks(width: number, height: number, _resolution: number) {
        this.#sparkContainer.x = this.#sprite.background.x - this.#sprite.background.width * 0.5;
        this.#sparkContainer.y = this.#sprite.background.y - this.#sprite.background.height * 0.5;
        for (let i = 0; i < sparkPosition.length; ++i) {
            const sprite = this.#sprite[`spark_${i}`];
            sprite.x = sparkPosition[i].x * this.#sprite.background.width;
            sprite.y = sparkPosition[i].y * this.#sprite.background.height;
            sprite.width = (533 / 5995) * this.#sprite.background.width;
            sprite.height = (533 / 3000) * this.#sprite.background.height;
        }
    }

    async rotateHandleCCW() {
        if (this.#job.handle != null) {
            return false;
        }
        return this.#job.handle = (new Promise((resolve, reject) => {
            gsap.to([
                this.#sprite.handle,
                this.#sprite.handleShadow,
            ], {
                duration: 1.5,
                ease: 'elastic.out(1, 0.3)',
                pixi: {
                    rotation: this.#sprite.handle.rotation * RAD_TO_DEG - 60
                },
                repeat: 0,
                onComplete: () => {
                    this.#sprite.handle.rotation = (this.#sprite.handle.rotation % pi2 + pi2) % pi2;
                    this.#sprite.handleShadow.rotation = (this.#sprite.handle.rotation % pi2 + pi2) % pi2;
                    resolve(true);
                },
                onInterrupt: () => {
                    reject(new DOMException('Animation aborted: VaultView.rotateLeft', 'AbortError'));
                }
            });
        })).finally(() => {
            this.#job.handle = null;
        });
    }

    async rotateHandleCW() {
        if (this.#job.handle != null) {
            return false;
        }
        return this.#job.handle = (new Promise((resolve, reject) => {
            gsap.to([
                this.#sprite.handle,
                this.#sprite.handleShadow,
            ], {
                duration: 1.5,
                ease: 'elastic.out(1, 0.3)',
                pixi: {
                    rotation: this.#sprite.handle.rotation * RAD_TO_DEG + 60
                },
                repeat: 0,
                onComplete: () => {
                    this.#sprite.handle.rotation = (this.#sprite.handle.rotation % pi2 + pi2) % pi2;
                    this.#sprite.handleShadow.rotation = (this.#sprite.handle.rotation % pi2 + pi2) % pi2;
                    resolve(true);
                },
                onInterrupt: () => {
                    reject(new DOMException('Animation aborted: VaultView.rotateLeft', 'AbortError'));
                }
            });
        })).finally(() => {
            this.#job.handle = null;
        });
    }

    rotateHandleBy(offset: number, duration: number = 3) {
        if (this.#job.handle != null) {
            return this.#job.handle;
        }
        return this.#job.handle = (new Promise((resolve, reject) => {
            gsap.to([
                this.#sprite.handle,
                this.#sprite.handleShadow
            ], {
                duration,
                ease: 'power2.out',
                pixi: {
                    rotation: this.#sprite.handle.rotation * RAD_TO_DEG + offset * 60
                },
                repeat: 0,
                onComplete: () => {
                    this.#sprite.handle.rotation = (this.#sprite.handle.rotation % pi2 + pi2) % pi2;
                    this.#sprite.handleShadow.rotation = (this.#sprite.handle.rotation % pi2 + pi2) % pi2;
                    resolve(true);
                },
                onInterrupt: () => {
                    reject(new DOMException('Animation aborted: VaultView.rotateLeft', 'AbortError'));
                }
            })
        })).finally(() => {
            this.#job.handle = null;
        });
    }

    async setDoorState(state: VaultDoorState) {
        if (this.#job.door != null) {
            return false;
        }
        if (this.#stateDoor === state) {
            return true;
        }
        return this.#job.door = (new Promise((resolve, reject) => {
            const timeline = gsap.timeline({
                paused: true,
                onStart: () => {
                    // Setup initial animation state (opposite of the target state):
                    // This will popup the door if we are not in the right state,
                    // so animation will only be attempted if it actually switch the state.
                    this.#sprite.doorOpen.alpha = Number(this.#stateDoor === VaultDoorState.Opened);
                    this.#sprite.doorOpenShadow.alpha = Number(this.#stateDoor === VaultDoorState.Opened);
                    this.#sparkContainer.alpha = Number(this.#stateDoor === VaultDoorState.Opened);
                    this.#sprite.door.alpha = Number(this.#stateDoor === VaultDoorState.Closed);
                    this.#sprite.handleShadow.alpha = Number(this.#stateDoor === VaultDoorState.Closed);
                    this.#sprite.handle.alpha = Number(this.#stateDoor === VaultDoorState.Closed);
                    // Ensure all sprites are visible during the animation,
                    // addChild also place the sprite as the last child
                    // (removing it from the current child position)
                    this.pixi.stage.addChild(this.#sparkContainer);
                    this.pixi.stage.addChild(this.#sprite.door);
                    this.pixi.stage.addChild(this.#sprite.handleShadow);
                    this.pixi.stage.addChild(this.#sprite.handle);
                    this.pixi.stage.addChild(this.#sprite.doorOpenShadow);
                    this.pixi.stage.addChild(this.#sprite.doorOpen);
                },
                onComplete: () => {
                    this.#stateDoor = state;
                    this.#updateDoorState();
                    resolve(true);
                },
                onInterrupt: () => {
                    this.#updateDoorState();
                    reject(new DOMException('Animation aborted: VaultView.rotateLeft', 'AbortError'));
                },
                repeat: 0
            });
            timeline.to([
                this.#sprite.door,
                this.#sprite.handle,
                this.#sprite.handleShadow
            ], {
                duration: 0.5,
                ease: 'power2.inOut',
                pixi: {
                    alpha: Number(state === VaultDoorState.Closed)
                }
            }, 0);
            timeline.to([
                this.#sprite.doorOpen,
                this.#sprite.doorOpenShadow,
                this.#sparkContainer
            ], {
                duration: 0.5,
                ease: 'power2.inOut',
                pixi: {
                    alpha: Number(state === VaultDoorState.Opened)
                }
            }, 0);
            timeline.play();
        })).finally(() => {
            this.#job.door = null;
        });
    }

    getSprite(name: string): Sprite | null {
        if (name in this.#sprite) {
            return this.#sprite[name];
        }
        return null;
    }
}
