import { isNotNull } from '../../common/utils/validate'
import { app, Menu, nativeImage, shell, Tray } from 'electron'
import { SystemTypeEnum } from '../../common/enums/SystemTypeEnum'
import { GlobalShortcutEvent } from './GlobalShortcutEvent'
import { join } from 'path'

class TrayEvent {
  static mainTray

  constructor() {
    if (isNotNull(TrayEvent.mainTray)) {
      return
    }

    const trayMenuTemplate = [
      {
        enabled: false,
        label: 'electron 版本 ' + app.getVersion()
      },
      { type: 'separator' },
      {
        label: '输入翻译',
        click: (): void => {
          GlobalShortcutEvent.translateInput()
        }
      },
      {
        label: '截图翻译',
        click: (): void => {
          GlobalShortcutEvent.translateScreenshot()
        }
      },
      {
        label: '退出',
        click: (): void => {
          app.quit()
        }
      }
    ]

    let iconPath
    if (SystemTypeEnum.isMac()) {
      iconPath = join(__dirname, '../../public/icon-mac-tray.png')
    } else if (SystemTypeEnum.isWin()) {
      iconPath = join(__dirname, '../../public/icon-1024x1024.png')
    } else {
      iconPath = join(__dirname, '../../public/logo-16x16.png')
    }

    if (SystemTypeEnum.isMac()) {
      const icon = nativeImage.createFromPath(iconPath)
      const trayIcon = icon.resize({ width: 16 })
      trayIcon.setTemplateImage(true)
      // 创建系统托盘
      TrayEvent.mainTray = new Tray(trayIcon)
    } else {
      // 创建系统托盘
      TrayEvent.mainTray = new Tray(iconPath)
    }

    // 设置托盘图标悬停时提示内容
    TrayEvent.mainTray.setToolTip('electron')
    const contextMenu = Menu.buildFromTemplate(trayMenuTemplate)
    // 设置托盘菜单列表
    TrayEvent.mainTray.setContextMenu(contextMenu)
    // 单击显示主窗口，再单击隐藏主窗口
    TrayEvent.mainTray.on('click', () => {
      if (SystemTypeEnum.isWin()) {
        GlobalShortcutEvent.translateInput()
      }
    })
  }
}

export { TrayEvent }
