import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { AWS_ENVIRONMENT_ASSETS } from './src/data/aws-environment-layout'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), {
    name: 'aws-environment-static-assets',
    generateBundle() {
      // Models live at the repo root. Vite serves them in dev but does not copy
      // them to dist automatically; emit just the approved floor and roof assets.
      for (const modelId of Object.values(AWS_ENVIRONMENT_ASSETS)) {
        const daePath = `models/${modelId}/meshes/${modelId}_visual.DAE`
        this.emitFile({ type: 'asset', fileName: daePath, source: readFileSync(new URL(daePath, import.meta.url)) })
        const textureDir = `models/${modelId}/materials/textures/`
        for (const file of readdirSync(fileURLToPath(new URL(textureDir, import.meta.url)))) {
          if (!/\.(png|jpg|jpeg)$/i.test(file)) continue
          const path = textureDir + file
          this.emitFile({ type: 'asset', fileName: path, source: readFileSync(new URL(path, import.meta.url)) })
        }
      }
    },
  }],
  assetsInclude: ['**/*.DAE', '**/*.dae', '**/*.png', '**/*.jpg'],
  server: {
    port: 3000,
    open: true
  }
})
