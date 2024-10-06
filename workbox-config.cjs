module.exports = {
    globDirectory: 'dist/',
    globPatterns: [
        '**/*.{js,css,html,png,ico}',
    ],
    globIgnores: [
        '**/*.map'
    ],
    swDest: 'dist/service-worker.js',
    runtimeCaching: [{
        urlPattern: ({ request }) => request.destination === 'document',
        handler: 'NetworkFirst',
        options: {
            cacheName: 'app-cache'
        }
    }]
};
