import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'node:path';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
        plugins: [vue(), svelte()],

        resolve: {
                alias: {
                        '@vcl': path.resolve(__dirname, '../../src/vcl')
                }
        },
        server: {
                fs: {
                        allow: [path.resolve(__dirname, '../../')]
                }
        },
        build: {
                rollupOptions: {
                        input: {
                                app: 'app.html',
                                preview: 'preview.html'
                        }
                }
        }
});
