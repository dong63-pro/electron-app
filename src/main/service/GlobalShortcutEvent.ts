import robot from '@jitsi/robotjs'
import GlobalWin from './GlobalWin'
import { uIOhook, UiohookKey } from 'uiohook-napi'
import { app, BrowserWindow, clipboard, globalShortcut, ipcMain } from 'electron'
import { ShortcutKeyEnum } from '../../common/enums/ShortcutKeyEnum'
import { SystemTypeEnum } from '../../common/enums/SystemTypeEnum'
import StoreService from './StoreService'
import { ScreenshotsMain } from './ScreenShot'

const isMac = SystemTypeEnum.isMac()
/**
 * 全局快捷键
 */
class GlobalShortcutClass {
  /**
   * 快捷键
   */
  key: string

  /**
   * 快捷键触发回调
   */
  callback: () => void

  constructor(key: string, callback: () => void) {
    this.key = key
    this.callback = callback
  }
}
class GlobalShortcutEvent {
  /**
   * 主窗口
   */
  static mainWin: BrowserWindow

  /**
   * 是否划词中
   */
  static isChoice = false

  /**
   * 全局快捷键列表
   */
  globalShortcutList: GlobalShortcutClass[]

  constructor() {
    // 窗口注销前执行逻辑
    app.on('will-quit', () => {
      // 注销应用注册的所有快捷键
      globalShortcut.unregisterAll()
    })
    this.globalShortcutList = []
  }

  /**
   * 注册全局快捷方式
   */
  registerAll(): void {
    this.globalShortcutList.forEach((info) => {
      GlobalShortcutEvent.registerBuild(info)
    })
  }

  /**
   * 单个快捷键注册
   *`
   * @param info 全局快捷键
   */
  static registerBuild(info: GlobalShortcutClass): void {
    // 检查快捷方式是否已注册。
    if (globalShortcut.isRegistered(info.key)) {
      console.log('快捷键已注册')
    }
    // 注册一个快捷并监听
    if (!globalShortcut.register(info.key, info.callback)) {
      console.log('快捷键注册失败')
    }
  }

  /**
   * 单个快捷键注册
   *
   * @param key 快捷键
   * @param callback 快捷键按下后的回调
   */
  static register(key, callback): void {
    GlobalShortcutEvent.registerBuild(new GlobalShortcutClass(key, callback))
  }

  /**
   * 单个快捷键注销
   *
   * @param key 快捷键
   */
  static unregister(key): void {
    globalShortcut.unregister(key)
  }

  /**
   * 注销Esc
   */
  static unregisterEsc(): void {
    GlobalShortcutEvent.unregister('Esc')
  }

  /**
   * 显示翻译窗口快捷键
   */
  static translateInput(): void {
    GlobalWin.mainWinShow()
  }

  /**
   * 获取粘贴板上的划词文本
   * @returns selectedText 选择的文本
   */
  static getSelectedText = async (): Promise<string> => {
    const translateChoiceDelay = Math.floor(StoreService.configGet('translateChoiceDelay') / 2)
    GlobalWin.mainWinSend('clear-all-translated-content')
    const currentClipboardContent = clipboard.readText()
    // log.info('[划词翻译] - 读取剪贴板原文本 : ', currentClipboardContent)
    clipboard.clear()
    await new Promise((resolve) => setTimeout(resolve, translateChoiceDelay))
    console.info('[划词翻译] - 执行复制操作')
    robot.keyToggle('c', 'down', isMac ? 'command' : 'control')
    await new Promise((resolve) => setTimeout(resolve, translateChoiceDelay))
    robot.keyToggle('c', 'up', isMac ? 'command' : 'control')
    const selectedText = clipboard.readText()
    // log.info('[划词翻译] - 读取新复制的内容 : ', selectedText)
    console.info('[划词翻译] - 读取新复制的内容 :', selectedText)
    clipboard.writeText(currentClipboardContent)
    GlobalShortcutEvent.isChoice = false
    return selectedText
  }

  /**
   * 单个词时拆分驼峰命名
   *
   * @param str 拆分的字符
   * @return 处理后的字符
   */
  static splitSingleCamelCase = (str): string => {
    if (/^[A-Za-z][A-Za-z]*$/.test(str)) {
      return str.replace(/([a-z])([A-Z])/g, '$1 $2')
    } else {
      return str
    }
  }

  /**
   * 单个词时拆分下划线命名
   *
   * @param str 拆分的字符
   * @return 处理后的字符
   */
  static splitSingleUnderScore = (str): string => {
    if (/^[a-z0-9_]+$/i.test(str)) {
      return str.replace(/_/g, ' ')
    } else {
      return str
    }
  }
  /**
   * 截图翻译快捷键Alt + W
   */
  static translateScreenshot(): void {
    console.info('start-cut-image')
    GlobalWin.mainWinSend('clear-all-translated-content')
    // 隐藏窗口
    GlobalWin.mainWinHide()
    new ScreenshotsMain().createScreenshotsWin()
  }

  /**
   * 划取文本快捷键
   */
  static translateChoice(): void {
    if (GlobalShortcutEvent.isChoice) {
      return
    }
    // 先释放按键
    uIOhook.keyToggle(UiohookKey.Ctrl, 'up')
    uIOhook.keyToggle(UiohookKey.CtrlRight, 'up')
    uIOhook.keyToggle(UiohookKey.Alt, 'up')
    uIOhook.keyToggle(UiohookKey.AltRight, 'up')
    uIOhook.keyToggle(UiohookKey.Shift, 'up')
    uIOhook.keyToggle(UiohookKey.ShiftRight, 'up')
    uIOhook.keyToggle(UiohookKey.Space, 'up')
    uIOhook.keyToggle(UiohookKey.Meta, 'up')
    uIOhook.keyToggle(UiohookKey.MetaRight, 'up')
    uIOhook.keyToggle(UiohookKey.Tab, 'up')
    uIOhook.keyToggle(UiohookKey.Escape, 'up')
    GlobalShortcutEvent.isChoice = true
    GlobalShortcutEvent.isChoice = true
    const printSelectedText = (selectedText): void => {
      GlobalShortcutEvent.isChoice = false
      selectedText = GlobalShortcutEvent.splitSingleCamelCase(selectedText)
      selectedText = GlobalShortcutEvent.splitSingleUnderScore(selectedText)

      // 推送给Vue页面进行更新翻译输入内容
      GlobalWin.mainWinUpdateTranslatedContent(selectedText)
      GlobalWin.mainWinShow()
    }
    GlobalShortcutEvent.getSelectedText().then(printSelectedText)
  }

  /**
   * @param type 快捷键类型 shortcutKey 快捷键alt + e
   * 注册快捷键
   */
  static translateRegister(type: string, shortcutKey: string): void {
    let res
    if (ShortcutKeyEnum.INPUT === type) {
      res = GlobalShortcutEvent.translateInputRegister(shortcutKey)
    } else if (ShortcutKeyEnum.SCREENSHOT === type) {
      res = GlobalShortcutEvent.translateScreenshotRegister(shortcutKey)
    } else if (ShortcutKeyEnum.CHOICE === type) {
      res = GlobalShortcutEvent.translateChoiceRegister(shortcutKey)
    } else {
      console.error('快捷键类型不存在')
    }
    return res
  }
  /**
   * 输入翻译快捷键 - 注册
   */
  static translateInputRegister(shortcutKey: string): void {
    return GlobalShortcutEvent.register(shortcutKey, () => {
      GlobalShortcutEvent.translateInput()
    })
  }
  /**
   * 截屏翻译快捷键 - 注册
   */
  static translateScreenshotRegister(shortcutKey: string): void {
    return GlobalShortcutEvent.register(shortcutKey, () =>
      GlobalShortcutEvent.translateScreenshot()
    )
  }

  /**
   * 划词翻译快捷键 - 注册
   */
  static translateChoiceRegister(shortcutKey: string): void {
    return GlobalShortcutEvent.register(shortcutKey, async () =>
      GlobalShortcutEvent.translateChoice()
    )
  }
}

export { GlobalShortcutEvent }
