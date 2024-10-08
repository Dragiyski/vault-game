export function setup() {
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.position = 'absolute';
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.top = '0';
    document.body.style.bottom = '0';
    let app = document.getElementById('app');
    if (app == null) {
        app = document.createElement('div');
        app.id = 'app';
        app.style.width = '100vw';
        app.style.height = '100vh';
        app.style.position = 'absolute';
        app.style.left = '0';
        app.style.right = '0';
        app.style.top = '0';
        app.style.bottom = '0';
        app.style.overflow = 'hidden';
        document.body.appendChild(app);
    }
}

export function teardown() {
    const app = document.getElementById('app');
    for (const child of app!.childNodes) {
        app!.removeChild(child);
    }
}
