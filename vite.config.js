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