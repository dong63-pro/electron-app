import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/preload/index.ts'),
          screenshot: resolve(__dirname, 'src/preload/screenshot.ts'),
          textOcr: resolve(__dirname, 'src/preload/textOcr.ts')
        }
      }
    }
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
        '@': resolve('src/renderer/src'),
        '@assets': resolve('src/renderer/src/assets')
      }
    },
    plugins: [vue()],
    build: {
      // 禁用资源内联限制，确保图片以原始路径进行加载
      assetsInlineLimit: 0,
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/renderer/index.html'),
          screenshot: resolve(__dirname, 'src/renderer/screenshot.html'),
          textOcr: resolve(__dirname, 'src/renderer/textOcr.html')
        }
      }
    }
  }
})
