import { VaultGameInitOptions } from "../@types/app";
import VaultView from "./view";

export default class VaultGame {
    #initialized = false;

    public readonly view: VaultView;
    // model: VaultGameModel;
    // controller: VaultController;

    constructor() {
        this.view = new VaultView();
    }

    async init(options: Partial<VaultGameInitOptions>) {
        if (this.#initialized) {
            return;
        }
        this.#initialized = true;
        try {
            await this.view.init(options.view ?? {});
        } catch (e) {
            this.#initialized = false;
            throw e;
        }
    }
}