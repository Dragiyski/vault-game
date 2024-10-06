import { FederatedPointerEvent } from "pixi.js";
import VaultGameModel, { VaultWheelDirection } from "./model";
import VaultView from "./view";

export default class VaultController {
    public readonly model: VaultGameModel;
    public readonly view: VaultView;
    #isInitialized = false;
    #lockUserInteraction = 0;

    constructor(model: VaultGameModel, view: VaultView) {
        this.model = model;
        this.view = view;
    }

    async init() {
        if (this.#isInitialized) {
            return;
        }

        this.model.addListener('vault.reset', this.#onVaultReset, this);
        this.model.addListener('vault.error', this.#onVaultError, this);
        this.model.addListener('vault.unlock', this.#onVaultUnlock, this);
        this.model.resetState();

        const door = this.view.getSprite('door');
        if (door == null) {
            throw new Error('Unable to find the door sprite.');
        }
        door.eventMode = 'static';
        door.addEventListener('mouseenter', this.#onDoorMouseEnter.bind(this));
        door.addEventListener('mouseleave', this.#onDoorMouseLeave.bind(this));
        door.addEventListener('click', this.#onDoorClick.bind(this));

        this.#isInitialized = true;
    }

    #onVaultReset() {
        this.model.printTarget();
    }

    #onVaultError() {
        // TODO: Call the necessary methods in view to display the animation
        this.model.resetState();
    }

    #onVaultUnlock() {
        // TODO: Call the necessary methods in view to display the animation
        this.model.resetState();
    }

    #onDoorMouseEnter() {
        this.view.pixi.canvas.style.cursor = 'pointer';
    }



    #onDoorMouseLeave() {
        this.view.pixi.canvas.style.cursor = '';
    }

    #onDoorClick(event: FederatedPointerEvent) {
        if (!this.#isInitialized || this.#lockUserInteraction > 0) {
            return;
        }
        const door = this.view.getSprite('door');
        if (door == null) {
            return;
        }
        const local = event.currentTarget.toLocal(event.global);
        if (local.x < 0) {
            this.moveCounterClockwise();
        } else {
            this.moveClockwise();
        }
    }

    moveCounterClockwise() {
        this.#lockUserInteraction++;
        this.view.rotateHandleLeft().then(() => {
            return this.model.move(VaultWheelDirection.CounterClockwise);
        }).finally(() => {
            this.#lockUserInteraction = Math.max(0, this.#lockUserInteraction - 1);
        });
    }

    moveClockwise() {
        this.#lockUserInteraction++;
        this.view.rotateHandleRight().then(() => {
            return this.model.move(VaultWheelDirection.Clockwise);
        }).finally(() => {
            this.#lockUserInteraction = Math.max(0, this.#lockUserInteraction - 1);
        });
    }
}