import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'
import AutoImport from 'unplugin-auto-import/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      dts: 'auto-imports.d.ts',
      imports: ['vue', 'pinia', 'vee-validate', 'vue-i18n'],
      include: [/\.vue$/, /\.vue\?vue/, /\.ts$/],
      dirs: ['src/composables/**', 'src/stores/**', 'src/types/**', 'src/db/**']
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  test: {
    environment: 'happy-dom',
    include: ['tests/**/*.test.ts'],
    globals: true
  }
})
