// electron.vite.config.ts
import { resolve } from "path";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import vue from "@vitejs/plugin-vue";
import { createSvgIconsPlugin } from "vite-plugin-svg-icons";
var __electron_vite_injected_dirname = "D:\\electron-app";
var electron_vite_config_default = defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: {
          index: resolve(__electron_vite_injected_dirname, "src/preload/index.ts"),
          screenshot: resolve(__electron_vite_injected_dirname, "src/preload/screenshot.ts"),
          textOcr: resolve(__electron_vite_injected_dirname, "src/preload/textOcr.ts")
        }
      }
    }
  },
  renderer: {
    resolve: {
      alias: {
        "@renderer": resolve("src/renderer/src"),
        "@": resolve("src/renderer/src"),
        "@assets": resolve("src/renderer/src/assets")
      }
    },
    plugins: [
      vue(),
      createSvgIconsPlugin({
        // 指定需要缓存的图标文件夹
        iconDirs: [resolve(process.cwd(), "src/renderer/src/icons/svg")],
        // 指定symbolId格式
        symbolId: "icon-[dir]-[name]"
      })
    ],
    build: {
      // 禁用资源内联限制，确保图片以原始路径进行加载
      assetsInlineLimit: 0,
      rollupOptions: {
        input: {
          index: resolve(__electron_vite_injected_dirname, "src/renderer/index.html"),
          screenshot: resolve(__electron_vite_injected_dirname, "src/renderer/screenshot.html"),
          textOcr: resolve(__electron_vite_injected_dirname, "src/renderer/textOcr.html")
        }
      }
    }
  }
});
export {
  electron_vite_config_default as default
};
