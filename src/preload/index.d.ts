import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface api {
    alwaysOnTopEvent
    windowCloseEvent
    windowMinimize
    updateTranslateContentEvent
    clearAllTranslateContentEvent
    screenshotEndNotifyEvent
  }
  interface Window {
    electron: ElectronAPI
    api: api
  }
}
