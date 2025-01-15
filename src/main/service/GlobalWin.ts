// import TranslateShowPositionEnum from '../../common/enums/TranslateShowPositionEnum'
import { isNull } from '../../common/utils/validate'
import { GlobalShortcutEvent } from './GlobalShortcutEvent'
// import { screen } from 'electron'

/**
 * 全局窗口
 */
class GlobalWin {
  /**
   * 主窗口
   */
  static mainWin
  /**
   * 主窗口是否关闭
   */
  static isMainWinClose = false
  /**
   * 主窗口是否置顶
   */
  static isMainAlwaysOnTop = false

  /**
   * 设置窗口
   */
  static setWin

  /**
   * 显示窗口
   */
  static winShow(win): void {
    if (isNull(win)) {
      return
    }
    win.show()
  }

  /**
   * 设置主窗口
   *
   * @param mainWin 主窗口
   */
  static setMainWin(mainWin): void {
    // 此处校验是因为主窗口不会销毁 所以防止重复设置
    if (isNull(GlobalWin.mainWin)) {
      GlobalWin.mainWin = mainWin
    }
  }

  /**
   * 隐藏主窗口
   */
  static mainWinHide(): void {
    GlobalWin.winHide(GlobalWin.mainWin)
  }

  /**
   * 隐藏窗口
   */
  static winHide(win): void {
    if (isNull(win)) {
      return
    }
    // 当隐藏窗口时注销Esc快捷键
    GlobalShortcutEvent.unregisterEsc()
    win.hide()
  }

  /**
   * 显示主窗口
   */
  static mainWinShow(): void {
    GlobalWin.winShow(GlobalWin.mainWin)
  }

  /**
   * 主窗口事件发送
   *
   * @param key 发送key
   * @param val 发送值
   */
  static mainWinSend(key, ...val): void {
    GlobalWin.mainWin.webContents.send(key, ...val)
  }

  /**
   *
   * @param text 文本
   * @returns
   */
  static mainWinUpdateTranslatedContent(text: string): string {
    // 先对文字做一次空处理 防止代码执行时出错
    // 不为空的情况下默认去掉文本内容前后的换行符
    text = isNull(text) ? '' : text.replace(/^[ \t]*[\r\n]+|[ \t]*[\r\n]+$/g, '')
    GlobalWin.mainWinSend('update-translated-content', text)
    return text
  }
}

export default GlobalWin
