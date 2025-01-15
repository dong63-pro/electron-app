import { app, BrowserWindow, ipcMain, screen } from 'electron'
import * as path from 'path'
import { is } from '@electron-toolkit/utils'
import { Screenshots } from 'node-screenshots'
import { GlobalShortcutEvent } from './GlobalShortcutEvent'
import { SystemTypeEnum } from '../../common/enums/SystemTypeEnum'
import { WinEvent } from './Win'
import GlobalWin from './GlobalWin'

let nullWin: BrowserWindow

const screenshotWinMap = new Map()

// 窗口加载完毕后执行
app.whenReady().then(() => {})

/**
 * 截图结束事件
 */
ipcMain.handle('screenshot-end-event', (_event, imgByBase64) => {
  ScreenshotsMain.closeScreenshotsWin()
  GlobalWin.mainWinShow()
  setTimeout(() => WinEvent.alwaysOnTop(GlobalWin.isMainAlwaysOnTop), 300)
  GlobalWin.mainWinSend('screenshot-end-notify-event', imgByBase64)
})

/**
 * 获取当前鼠标所在的显示器缩放比例事件
 *
 * @param screenId 屏幕ID
 */
ipcMain.handle('screen-scale-factor-event', (_event, screenId) => {
  const screenshotWin = screenshotWinMap.get(screenId)
  if (screenshotWin === undefined) {
    return
  }
  const thisScreen = screen.getDisplayNearestPoint(screen.getCursorScreenPoint())
  screenshotWin.webContents.send('screen-scale-factor-notice-event', thisScreen.scaleFactor)
})

/**
 * 关闭截图窗口事件
 */
ipcMain.handle('close-screenshots-win-event', (_event) => {
  ScreenshotsMain.closeScreenshotsWin()
})

class ScreenshotsSon {
  /**
   * 截图窗口
   */
  screenshotsWin: BrowserWindow
  /**
   * 截图窗口ID
   */
  screenshotsWinId

  /**
   * 构造函数
   *
   * @param screenshots 截图
   */
  constructor(screenshots: Screenshots) {
    this.screenshotsWinId = new Date().getTime().toString()
    const width = screenshots.width
    const height = screenshots.height
    this.screenshotsWin = new BrowserWindow({
      // window 使用 fullscreen,  mac 设置为 undefined, 不可为 false
      fullscreen: process.platform !== 'darwin' || undefined, // win
      width,
      height,
      x: screenshots.x,
      y: screenshots.y,
      // 透明的
      transparent: true,
      // 去除窗口边框
      frame: false,
      // 跳过任务栏
      skipTaskbar: true,
      // 自动隐藏菜单栏
      autoHideMenuBar: true,
      // 可移动的
      movable: false,
      // 可调整大小
      resizable: false,
      // 启用大于屏幕
      enableLargerThanScreen: true, // mac
      // 有阴影
      hasShadow: false,
      // 默认不显示
      show: false,
      webPreferences: {
        // 窗口引入预加载信息
        preload: path.join(__dirname, '../preload/screenshot.js'),
        sandbox: false
      }
    })
    // 禁用按下F11全屏事件
    this.screenshotsWin.setFullScreenable(false)
    this.screenshotsWin.setAlwaysOnTop(true, 'screen-saver') // mac
    // this.screenshotsWin.setVisibleOnAllWorkspaces(true) // mac

    // HMR for renderer base on electron-vite cli.
    // Load the remote URL for development or the local html file for production.
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      this.screenshotsWin.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/screenshot.html`)
    } else {
      this.screenshotsWin.loadFile(path.join(__dirname, '../renderer/screenshot.html'))
    }

    // 打开开发者工具
    // this.screenshotsWin.webContents.openDevTools({ mode: 'right' })

    // 当 window 被关闭，这个事件会被触发。
    this.screenshotsWin.on('closed', () => {
      // 取消引用 window 对象，如果你的应用支持多窗口的话，
      // 通常会把多个 window 对象存放在一个数组里面，
      // 与此同时，你应该删除相应的元素。
      this.screenshotsWin = nullWin
      screenshotWinMap.delete(this.screenshotsWinId)
    })
    // 生成显示器ID
    screenshotWinMap.set(this.screenshotsWinId, this.screenshotsWin)
    this.screenshotsWin.webContents
      .executeJavaScript('JSON.stringify({width:screen.width,height: screen.height})')
      .then((value) => {
        if (SystemTypeEnum.isMac()) {
          this.screenshotsWin.show()
        } else {
          this.screenshotsWin.setAlwaysOnTop(true, 'pop-up-menu', 1)
          this.screenshotsWin.setVisibleOnAllWorkspaces(true)
          this.screenshotsWin.showInactive()
        }
        const res = JSON.parse(value)
        const screenWidth = res.width
        const screenHeight = res.height
        screenshots.capture().then((imgBuffer) => {
          const image = 'data:image/png;base64,' + imgBuffer.toString('base64')
          // 窗口绘制截图样式
          this.screenshotsWin.webContents.send('win-draw-screenshot-style', {
            screenId: this.screenshotsWinId,
            screenImgUrl: image,
            width: screenWidth,
            height: screenHeight
          })
        })
      })
  }
}

class ScreenshotsMain {
  /**
   * 文字识别窗口
   */
  static textOcrWin: BrowserWindow

  /**
   * ocr类型
   */
  static ocrType: string

  /**
   * 是否已创建截图窗口
   */
  static isCreate = false

  /**
   * 截图窗口列表
   */
  static screenshotsWinList: Array<ScreenshotsSon> = new Array<ScreenshotsSon>()

  /**
   * 创建截图窗口
   */
  createScreenshotsWin(): void {
    // 创建浏览器窗口，只允许创建一个
    if (ScreenshotsMain.isCreate) {
      log.info('已经触发截图事件')
      return
    }
    // 注册 关闭截图窗口 快捷键
    // 防止在注册截图窗口时出现错误 但是截图窗口已经创建 而退出快捷键还未注册 导致无法退出
    // 不在这里直接注册 Esc 的原因是因为防止执行过快 因为主窗口也注册了 Esc 事件
    // 而在触发截图时会隐藏主窗口，隐藏主窗口时会注销 Esc，而主窗口的如果还没注销完毕就先执行到了这里
    // 会导致截图窗口注册 Esc 时冲突 最终出现截图窗口无法关闭
    GlobalShortcutEvent.register('Alt+Esc', () => {
      ScreenshotsMain.closeScreenshotsWin()
    })
    ScreenshotsMain.isCreate = true
    // 获取所有显示器截图
    const allScreenshots = Screenshots.all() ?? []
    allScreenshots.forEach((screenshots) => {
      ScreenshotsMain.screenshotsWinList.push(new ScreenshotsSon(screenshots))
    })
    // 延迟执行快捷键注册 否则如果上层方法有执行注销此快捷键时 这里注册的快捷键会无效 并且不会提示
    // 猜测：当快捷键注销代码执行后，实际内部还没有注销完毕，但此时快捷键状态已经变更为未注册
    // 这个过程执行速度是很快的 而这里这时又注册了 会导致新的状态变更及事件刚注册进去
    // 上一步的注销操作开始执行注销事件 导致最终的结果为：注册状态已变更为已注册而事件被注销
    setTimeout(() => {
      // 注册 关闭截图窗口 快捷键
      GlobalShortcutEvent.register('Esc', () => {
        ScreenshotsMain.closeScreenshotsWin()
      })
    }, 500)
  }

  /**
   * 关闭截图窗口事件
   */
  static closeScreenshotsWin(): void {
    GlobalShortcutEvent.unregister('Esc')
    GlobalShortcutEvent.unregister('Alt+Esc')
    if (!ScreenshotsMain.isCreate) {
      return
    }
    ScreenshotsMain.screenshotsWinList.forEach((screenshotsSon) => {
      screenshotsSon.screenshotsWin.close()
    })
    ScreenshotsMain.screenshotsWinList = []
    ScreenshotsMain.isCreate = false
  }
}

export { ScreenshotsMain }
