import { defineConfig } from 'vite'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'
import { resolve } from 'path'

export default defineConfig({
  root: './src/renderer',
  build: {
    outDir: '../../dist-renderer',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/renderer/main.html'),
        input: resolve(__dirname, 'src/renderer/input.html')
      }
    }
  },
  plugins: [
    electron([
      {
        // Main process entry file
        entry: '../main/index.js',
        onstart(options) {
          // Start Electron App
          options.startup()
        },
        vite: {
          build: {
            outDir: '../../dist-electron',
            rollupOptions: {
              external: ['electron']
            }
          }
        }
      }
    ]),
    renderer({
      nodeIntegration: true
    })
  ],
  css: {
    postcss: {
      plugins: [
        require('tailwindcss'),
        require('autoprefixer'),
      ],
    },
  },
  server: {
    port: 3000
  }
})