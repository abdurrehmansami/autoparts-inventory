import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: { '@shared': resolve('src/shared'), '@': resolve('src/renderer/src') }
  },
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
    // node:sqlite is a Node builtin; keep it out of Vite's module graph
    server: { deps: { external: [/^node:/] } }
  }
})
