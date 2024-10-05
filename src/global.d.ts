import VaultGame from "./app";

declare global {
    interface Window {
        vaultGame: VaultGame;
    }
}