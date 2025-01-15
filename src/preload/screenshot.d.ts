import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface api {
    screenshotEndEvent
    screenScaleFactorNoticeEvent
    screenScaleFactorEvent
  }
  interface Window {
    electron: ElectronAPI
    api: api
  }
}
