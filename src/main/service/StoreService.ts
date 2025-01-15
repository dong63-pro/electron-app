import { app, ipcMain } from 'electron'
// import { ElectronStore } from 'electron-store'
// const Store = require('electron-store').default
import { join } from 'path'
import { ShortcutKeyEnum } from '../../common/enums/ShortcutKeyEnum'
import { isNull } from 'util'
import { GlobalShortcutEvent } from './GlobalShortcutEvent'
/**
 * app.getPath('userData')
 *
 * 一般对应地址如下 :
 * Mac : Users/用户账号名称/Library/Application Support/time-translate/
 * Win : C:\Users\用户账号名称\AppData\Roaming\time-translate/
 */
class StoreService {
  /**
   * 用户数据默认路径
   */
  static userDataPath = app.getPath('userData')

  /**
   * 用户数据存放文件夹名称
   */
  static configPathKey = 'configPath'

  // 配置存储
  static configStore: any

  static systemStore: any

  // 日志存储路径
  // static logsPath = join(StoreService.userDataPath, 'logs')

  static init = async (): Promise<void> => {
    // 动态引入electron-store模块
    const electronStoreModule = await import('electron-store')
    const ElectronStore = electronStoreModule.default || electronStoreModule.Store

    StoreService.systemStore = new ElectronStore({
      name: 'system',
      // 文件位置
      cwd: join(app.getPath('userData'))
    })
    // 配置相关
    StoreService.configStore = new ElectronStore({
      name: 'config',
      // 文件位置
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      cwd: StoreService.systemGet(StoreService.configPathKey)
    })
  }

  static initConfig = async (): Promise<void> => {
    // 首次打开时设置默认快捷键
    if (!StoreService.configHas('inputShortcutKey')) {
      StoreService.configSet('inputShortcutKey', 'Alt + Q')
    }
    if (!StoreService.configHas('screenshotShortcutKey')) {
      StoreService.configSet('screenshotShortcutKey', 'Alt + W')
    }
    if (!StoreService.configHas('choiceShortcutKey')) {
      StoreService.configSet('choiceShortcutKey', 'Alt + E')
    }
    // 初始化默认划词延迟
    if (!StoreService.configHas('translateChoiceDelay')) {
      StoreService.configSet('translateChoiceDelay', 600)
    }

    app.whenReady().then(async () => {
      // 快捷键列表
      const translateShortcutKeyList = [
        { type: ShortcutKeyEnum.INPUT, shortcutKey: StoreService.configGet('inputShortcutKey') },
        {
          type: ShortcutKeyEnum.SCREENSHOT,
          shortcutKey: StoreService.configGet('screenshotShortcutKey')
        },
        { type: ShortcutKeyEnum.CHOICE, shortcutKey: StoreService.configGet('choiceShortcutKey') }
      ]
      // 初始加载翻译快捷键事件
      translateShortcutKeyList.forEach((translateShortcutKey) => {
        const type = translateShortcutKey.type
        const shortcutKey = translateShortcutKey.shortcutKey
        if (isNull(type) || isNull(shortcutKey)) {
          return
        }
        // 注册
        GlobalShortcutEvent.translateRegister(
          translateShortcutKey.type,
          translateShortcutKey.shortcutKey
        )
      })
    })
  }

  static systemGet = (key: string): any => {
    return StoreService.systemStore.get(key)
  }

  static configHas = (key: string): boolean => {
    return StoreService.configStore.has(key)
  }

  static configGet = (key: string): any => {
    return StoreService.configStore.get(key)
  }

  static configSetNotCloud = (key: string, val: any): void => {
    StoreService.configStore.set(key, val)
  }

  static configSet = (key: string, val: any): void => {
    StoreService.configSetNotCloud(key, val)
  }
}

/**
 * 数据是否存在
 */
ipcMain.on('cache-has', (event, storeTypeEnum, key) => {
  event.returnValue = StoreService[storeTypeEnum + 'Has'](key)
})

/**
 * 数据获取
 */
ipcMain.on('cache-get', (event, storeTypeEnum, key) => {
  event.returnValue = StoreService[storeTypeEnum + 'Get'](key)
})

/**
 * 数据存储
 */
ipcMain.handle('cache-set', (_event, storeTypeEnum, key, obj) => {
  StoreService[storeTypeEnum + 'Set'](key, obj)
})

/**
 * 数据删除
 */
ipcMain.handle('cache-delete', (_event, storeTypeEnum, key) => {
  StoreService[storeTypeEnum + 'DeleteByKey'](key)
})

export default StoreService
