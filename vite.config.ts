import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
    css: {
        devSourcemap: true,
    },
    plugins: [react()],
    envDir: './',
    server: {
        cors: true,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    },
    resolve: {
        alias: {
            '@utils': path.resolve(__dirname, './src/utils'),
            '@store': path.resolve(__dirname, './src/store/'),
            '@hooks': path.resolve(__dirname, './src/hooks'),
            '@shared': path.resolve(__dirname, './src/shared'),
            '@assets': path.resolve(__dirname, './src/assets'),
            '@components': path.resolve(__dirname, './src/components'),
        },
    },
});
