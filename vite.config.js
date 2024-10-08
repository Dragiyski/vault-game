import { defineConfig } from 'vite';
import { resolve as resolvePath } from 'node:path';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
    root: 'src',
    build: {
        outDir: '../dist',
        sourcemap: true,
        rollupOptions: {
            input: {
                main: resolvePath(__dirname, 'src/index.html')
            }
        },
        chunkSizeWarningLimit: 4096
    },
    test: {
        browser: {
            provider: 'webdriverio',
            enabled: true,
            name: 'chrome',
            isolate: true
        },
        include: [
            '../test/browser/**/*.{test,spec}.ts'
        ],
        coverage: {
            provider: 'istanbul',
            enabled: true,
            reportsDirectory: '../coverage',
            exclude: ['vendor/**']
        }
    },
    plugins: [
        viteStaticCopy({
            targets: [
                {
                    src: resolvePath(__dirname, 'public') + '/[!.]*',
                    dest: './'
                }
            ]
        })
    ]
})