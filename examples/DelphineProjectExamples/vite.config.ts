import { defineConfig } from 'vite';
import path from 'node:path';

export default defineConfig({
        resolve: {
                alias: {
                        '@vcl': path.resolve(__dirname, '../../src/vcl')
                }
        },
        server: {
                fs: {
                        allow: [path.resolve(__dirname, '../../')]
                }
        }
});
