import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

/**
 * 始终在最前面
 */
const alwaysOnTopEvent = (status): void => {
  ipcRenderer.invoke('always-on-top-event', status)
}

/**
 * 关闭窗口
 */
const windowCloseEvent = (): void => {
  ipcRenderer.invoke('window-close-event')
}

/**
 * 窗口最小化
 */
const windowMinimize = (): void => {
  ipcRenderer.invoke('window-minimize-event')
}

/**
 * 监听更新翻译输入内容事件
 *
 * @param callback 回调方法 用于主进程内部触发时推送到Vue页面执行
 */
const updateTranslateContentEvent = (callback): void => {
  ipcRenderer.on('update-translated-content', (_event, content) => {
    callback(content)
  })
}

/**
 * 清空翻译输入、结果内容事件
 *
 * @param callback 回调方法 用于主进程内部触发时推送到Vue页面执行
 */
const clearAllTranslateContentEvent = (callback): void => {
  ipcRenderer.on('clear-all-translated-content', (_event, _content) => {
    callback()
  })
}

/**
 * 截图翻译结束通知事件
 *
 * @param callback 回调方法 用于主进程内部触发时推送到Vue页面执行
 */
const screenshotEndNotifyEvent = (callback): void => {
  ipcRenderer.on('screenshot-end-notify-event', (_event, imageBase64, screenImgUrl) => {
    callback(imageBase64, screenImgUrl)
  })
}

// Custom APIs for renderer
const api = {
  alwaysOnTopEvent,
  windowCloseEvent,
  windowMinimize,
  updateTranslateContentEvent,
  clearAllTranslateContentEvent,
  screenshotEndNotifyEvent
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
