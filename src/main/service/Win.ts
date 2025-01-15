import { app, clipboard, ipcMain, nativeImage } from 'electron'
import GlobalWin from './GlobalWin'
import { GlobalShortcutEvent } from './GlobalShortcutEvent'

class WinEvent {
  static mainWinInfo

  constructor(mainWinInfo) {
    WinEvent.mainWinInfo = mainWinInfo

    /**
     * 始终在最前面
     */
    ipcMain.handle('always-on-top-event', (_event, status) => {
      WinEvent.alwaysOnTop(status)
    })
    /**
     * 窗口关闭
     */
    ipcMain.handle('window-close-event', () => {
      WinEvent.closeWin()
    })
    /**
     * 窗口最小化
     */
    ipcMain.handle('window-minimize-event', () => {
      WinEvent.minimizeWin()
    })
    /**
     * 开始截图
     */
    ipcMain.handle('screen-shots-start-event', (_event) => {
      GlobalShortcutEvent.translateScreenshot()
    })
  }

  /**
   * 主窗口置顶
   *
   * @param status 置顶状态
   */
  static alwaysOnTop(status): void {
    GlobalWin.mainWin.setAlwaysOnTop(status)
    GlobalWin.isMainAlwaysOnTop = status
    // 触发窗口置顶时候也触发窗口显示回调
    // 用于处理 alwaysOnTopAllowEscStatus 逻辑
    // GlobalWin.mainOrOcrWinShowCallback()
  }

  /**
   * 主窗口关闭
   */
  static closeWin(): void {
    GlobalWin.mainWin.close(true)
  }

  /**
   * 主窗口最小化
   */
  static minimizeWin(): void {
    GlobalWin.mainWin.minimize()
  }
}
export { WinEvent }
