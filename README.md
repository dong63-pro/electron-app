# electron-app

An Electron application with Vue and TypeScript

1. 获取系统划词，需要实时监听系统鼠标的点击时间，然后模拟系统Ctrl C案件尝试获取划词文字

2. 划词跟随，需要一个窗口程序，识别到有划词时，根据鼠标位置进行定位显示一个html页面，这个html页面非常小，只有一个图标而已

3. 截图翻译：最难，
需要再触发截图翻译时，识别屏幕，对每个屏幕进行创建虚拟窗口，然后在每个窗口里进行前端页面的鼠标划选的功能实现，最后得到划选区域的图标
需要考虑分辨率问题，缩放问题，清晰度问题以及交互状态
获得图片后调用服务端的OCR服务，最后得到文字

4. 其他：窗口常驻，置顶，自动消失，翻译缓存，翻译历史，翻译快捷键等常规功能，

5. 软件打包版本，暂时支持windows即可。

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin)

## Project Setup

### Install

```bash
$ pnpm install
```

### Development

```bash
$ pnpm dev
```

### Build

```bash
# For windows
$ pnpm build:win

# For macOS
$ pnpm build:mac

# For Linux
$ pnpm build:linux
```
