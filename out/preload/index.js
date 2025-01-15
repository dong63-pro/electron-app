"use strict";
const electron = require("electron");
const preload = require("@electron-toolkit/preload");
const alwaysOnTopEvent = (status) => {
  electron.ipcRenderer.invoke("always-on-top-event", status);
};
const windowCloseEvent = () => {
  electron.ipcRenderer.invoke("window-close-event");
};
const windowMinimize = () => {
  electron.ipcRenderer.invoke("window-minimize-event");
};
const screenShotsStartEvent = () => {
  electron.ipcRenderer.invoke("screen-shots-start-event");
};
const updateTranslateContentEvent = (callback) => {
  electron.ipcRenderer.on("update-translated-content", (_event, content) => {
    callback(content);
  });
};
const clearAllTranslateContentEvent = (callback) => {
  electron.ipcRenderer.on("clear-all-translated-content", (_event, _content) => {
    callback();
  });
};
const screenshotEndNotifyEvent = (callback) => {
  electron.ipcRenderer.on("screenshot-end-notify-event", (_event, imageBase64, screenImgUrl) => {
    callback(imageBase64, screenImgUrl);
  });
};
const api = {
  alwaysOnTopEvent,
  windowCloseEvent,
  windowMinimize,
  updateTranslateContentEvent,
  clearAllTranslateContentEvent,
  screenshotEndNotifyEvent,
  screenShotsStartEvent
};
if (process.contextIsolated) {
  try {
    electron.contextBridge.exposeInMainWorld("electron", preload.electronAPI);
    electron.contextBridge.exposeInMainWorld("api", api);
  } catch (error) {
    console.error(error);
  }
} else {
  window.electron = preload.electronAPI;
  window.api = api;
}
