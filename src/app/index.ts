import { VaultGameInitOptions } from "../@types/app";
import VaultController from "./controller";
import VaultGameModel from "./model";
import VaultView from "./view";

export default class VaultGame {
    #initialized = false;

    public readonly view: VaultView;
    public readonly model: VaultGameModel;
    public readonly controller: VaultController;

    constructor() {
        this.view = new VaultView();
        this.model = new VaultGameModel();
        this.controller = new VaultController(this.model, this.view);
    }

    async init(options: Partial<VaultGameInitOptions>) {
        if (this.#initialized) {
            return;
        }
        this.#initialized = true;
        try {
            await this.view.init(options.view ?? {});
            await this.controller.init();
        } catch (e) {
            this.#initialized = false;
            throw e;
        }
    }
}