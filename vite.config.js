import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [
        react({
            babel: {
                plugins: [
                    [
                        'module-resolver',
                        {
                            root: ['./src'],
                            alias: {
                                '~': './src',
                            },
                        },
                    ],
                ],
            },
        }),
    ],
    resolve: {
        alias: {
            // eslint-disable-next-line no-undef
            '~': path.resolve(__dirname, 'src'), // Vite also needs alias to understand the path
        },
    },
});
