import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import glsl from 'vite-plugin-glsl'

// glsl() lets us `import frag from './x.frag'` as a string and supports #include.
export default defineConfig({
  plugins: [react(), glsl({ compress: true })],
  build: {
    target: 'es2020',
    // three.js is big; keep it in its own long-cached chunk.
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          r3f: ['@react-three/fiber'],
        },
      },
    },
  },
})
