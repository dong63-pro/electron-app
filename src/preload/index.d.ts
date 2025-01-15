import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface api {
    alwaysOnTopEvent
    windowCloseEvent
    windowMinimize
    updateTranslateContentEvent
    clearAllTranslateContentEvent
    screenshotEndNotifyEvent
    screenShotsStartEvent
  }
  interface Window {
    electron: ElectronAPI
    api: api
  }
}
