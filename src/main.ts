import VaultGame from "./app";

(async () => {
    const app = document.getElementById('app');

    if (app == null) {
        throw new Error('Unable to find the element with id "app"');
    }

    const game = new VaultGame();

    await game.init({
        view: {
            background: '#000',
            resizeTo: app
        }
    });

    app.appendChild(game.view.pixi.canvas);
})().catch(error => {
    console.error(error);
});
