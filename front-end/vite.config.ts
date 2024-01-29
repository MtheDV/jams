import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import comlink from 'vite-plugin-comlink'

export default defineConfig({
    plugins: [vue(), comlink()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    worker: {
        plugins: [comlink()]
    }
})
