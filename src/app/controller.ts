import { FederatedPointerEvent } from "pixi.js";
import VaultGameModel, { VaultHandleDirection } from "./model";
import VaultView, { VaultDoorState } from "./view";
import { sleep } from '../lib/sleep';
import '../vendor/swiped-events.min.js';
import { SwipedEvent } from 'vendor/swiped-events';

export default class VaultController {
    public readonly model: VaultGameModel;
    public readonly view: VaultView;
    #isInitialized = false;
    #lockUserInteractionCount = 0;

    constructor(model: VaultGameModel, view: VaultView) {
        this.model = model;
        this.view = view;
    }

    async init() {
        if (this.#isInitialized) {
            return;
        }

        const door = this.view.getSprite('door');
        if (door == null) {
            throw new Error('Unable to find the door sprite.');
        }
        door.eventMode = 'static';
        door.addEventListener('mouseenter', this.#onDoorMouseEnter.bind(this));
        door.addEventListener('mouseleave', this.#onDoorMouseLeave.bind(this));
        door.addEventListener('click', this.#onDoorClick.bind(this));

        this.model.addListener('vault.reset', this.#onVaultReset, this);
        this.model.addListener('vault.error', this.#onVaultError, this);
        this.model.addListener('vault.unlock', this.#onVaultUnlock, this);
        this.model.resetState();

        document.addEventListener('swiped', this.#onSwipe.bind(this));

        this.#isInitialized = true;
    }

    async vaultInit() {
        try {
            this.lockUserInteraction();
            if (this.model.target == null) {
                this.model.initState();
            }
            const handleDirection = this.model.target![0].direction === VaultHandleDirection.Clockwise ? VaultHandleDirection.CounterClockwise : VaultHandleDirection.Clockwise;
            await this.view.rotateHandleBy((5 + Math.floor(Math.random() * 3)) * (handleDirection === VaultHandleDirection.Clockwise ? 1 : -1) * 6);
            this.model.printTarget();
        } finally {
            this.unlockUserInteraction();
        }
    }

    async vaultOpen() {
        try {
            this.lockUserInteraction();
            await this.view.setDoorState(VaultDoorState.Opened);
            await sleep(5);
            await this.view.setDoorState(VaultDoorState.Closed);
            this.model.resetState();
        } finally {
            this.unlockUserInteraction();
        }
    }

    lockUserInteraction() {
        this.#lockUserInteractionCount++;
    }

    unlockUserInteraction() {
        this.#lockUserInteractionCount = Math.max(0, this.#lockUserInteractionCount - 1);
    }

    #onVaultReset() {
        this.vaultInit();
    }

    #onVaultError() {
        this.model.resetState();
    }

    #onVaultUnlock() {
        this.vaultOpen();
    }

    #onDoorMouseEnter() {
        this.view.pixi.canvas.style.cursor = 'pointer';
    }

    #onDoorMouseLeave() {
        this.view.pixi.canvas.style.cursor = '';
    }

    #onDoorClick(event: FederatedPointerEvent) {
        if (!this.#isInitialized || this.#lockUserInteractionCount > 0) {
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

    #onSwipe(event: Event) {
        if (!this.#isInitialized || this.#lockUserInteractionCount > 0) {
            return;
        }
        const detail = (event as SwipedEvent).detail;
        if (detail.dir == 'left') {
            this.moveCounterClockwise();
        } else {
            this.moveClockwise();
        }
    }

    moveCounterClockwise() {
        this.lockUserInteraction();
        this.view.rotateHandleCCW().then(() => {
            return this.model.move(VaultHandleDirection.CounterClockwise);
        }).finally(() => {
            this.unlockUserInteraction();
        });
    }

    moveClockwise() {
        this.lockUserInteraction();
        this.view.rotateHandleCW().then(() => {
            return this.model.move(VaultHandleDirection.Clockwise);
        }).finally(() => {
            this.unlockUserInteraction();
        });
    }
}