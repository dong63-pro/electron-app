"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
const electron = require("electron");
const path = require("path");
const utils = require("@electron-toolkit/utils");
const robot = require("@jitsi/robotjs");
const uiohookNapi = require("uiohook-napi");
const util = require("util");
const nodeScreenshots = require("node-screenshots");
function _interopNamespaceDefault(e) {
  const n = Object.create(null, { [Symbol.toStringTag]: { value: "Module" } });
  if (e) {
    for (const k in e) {
      if (k !== "default") {
        const d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: () => e[k]
        });
      }
    }
  }
  n.default = e;
  return Object.freeze(n);
}
const path__namespace = /* @__PURE__ */ _interopNamespaceDefault(path);
const icon = path.join(__dirname, "../../resources/icon.png");
function isNull(date) {
  return date === void 0 || date === null || date === "";
}
function isNotNull(date) {
  return !isNull(date);
}
class ShortcutKeyEnum {
  /**
   * 输入翻译快捷键
   */
  static INPUT = "input";
  /**
   * 截图翻译快捷键
   */
  static SCREENSHOT = "screenshot";
  /**
   * 划词翻译快捷键
   */
  static CHOICE = "choice";
}
class SystemTypeEnum {
  /**
   * Windows
   */
  static WIN = "win32";
  /**
   * MAC OS
   */
  static MAC = "darwin";
  /**
   * Linux
   */
  static LINUX = "linux";
  /**
   * 未知系统
   */
  static UNKNOWN = "unknown";
  /**
   * 获取系统类型
   *
   * @returns {string} 系统类型
   */
  static getSystemType() {
    const platform = process.platform;
    if (platform === SystemTypeEnum.MAC) {
      return SystemTypeEnum.MAC;
    } else if (platform === SystemTypeEnum.WIN) {
      return SystemTypeEnum.WIN;
    } else if (platform === SystemTypeEnum.LINUX) {
      return SystemTypeEnum.LINUX;
    } else {
      console.log("未知系统, platform = ", platform);
      return SystemTypeEnum.UNKNOWN;
    }
  }
  /**
   * 是否为 WIN 系统
   *
   * @returns {boolean} 是 返回 true 否则 返回 false
   */
  static isWin() {
    return SystemTypeEnum.getSystemType() === SystemTypeEnum.WIN;
  }
  /**
   * 是否为 MAC 系统
   *
   * @returns {boolean} 是 返回 true 否则 返回 false
   */
  static isMac() {
    return SystemTypeEnum.getSystemType() === SystemTypeEnum.MAC;
  }
  /**
   * 是否为 Linux 系统
   *
   * @returns {boolean} 是 返回 true 否则 返回 false
   */
  static isLinux() {
    return SystemTypeEnum.getSystemType() === SystemTypeEnum.LINUX;
  }
}
class StoreService {
  /**
   * 用户数据默认路径
   */
  static userDataPath = electron.app.getPath("userData");
  /**
   * 用户数据存放文件夹名称
   */
  static configPathKey = "configPath";
  // 配置存储
  static configStore;
  static systemStore;
  // 日志存储路径
  // static logsPath = join(StoreService.userDataPath, 'logs')
  static init = async () => {
    const electronStoreModule = await import("electron-store");
    const ElectronStore = electronStoreModule.default || electronStoreModule.Store;
    StoreService.systemStore = new ElectronStore({
      name: "system",
      // 文件位置
      cwd: path.join(electron.app.getPath("userData"))
    });
    StoreService.configStore = new ElectronStore({
      name: "config",
      // 文件位置
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      cwd: StoreService.systemGet(StoreService.configPathKey)
    });
  };
  static initConfig = async () => {
    if (!StoreService.configHas("inputShortcutKey")) {
      StoreService.configSet("inputShortcutKey", "Alt + Q");
    }
    if (!StoreService.configHas("screenshotShortcutKey")) {
      StoreService.configSet("screenshotShortcutKey", "Alt + W");
    }
    if (!StoreService.configHas("choiceShortcutKey")) {
      StoreService.configSet("choiceShortcutKey", "Alt + E");
    }
    if (!StoreService.configHas("translateChoiceDelay")) {
      StoreService.configSet("translateChoiceDelay", 600);
    }
    electron.app.whenReady().then(async () => {
      const translateShortcutKeyList = [
        { type: ShortcutKeyEnum.INPUT, shortcutKey: StoreService.configGet("inputShortcutKey") },
        {
          type: ShortcutKeyEnum.SCREENSHOT,
          shortcutKey: StoreService.configGet("screenshotShortcutKey")
        },
        { type: ShortcutKeyEnum.CHOICE, shortcutKey: StoreService.configGet("choiceShortcutKey") }
      ];
      translateShortcutKeyList.forEach((translateShortcutKey) => {
        const type = translateShortcutKey.type;
        const shortcutKey = translateShortcutKey.shortcutKey;
        if (util.isNull(type) || util.isNull(shortcutKey)) {
          return;
        }
        GlobalShortcutEvent.translateRegister(
          translateShortcutKey.type,
          translateShortcutKey.shortcutKey
        );
      });
    });
  };
  static systemGet = (key) => {
    return StoreService.systemStore.get(key);
  };
  static configHas = (key) => {
    return StoreService.configStore.has(key);
  };
  static configGet = (key) => {
    return StoreService.configStore.get(key);
  };
  static configSetNotCloud = (key, val) => {
    StoreService.configStore.set(key, val);
  };
  static configSet = (key, val) => {
    StoreService.configSetNotCloud(key, val);
  };
}
electron.ipcMain.on("cache-has", (event, storeTypeEnum, key) => {
  event.returnValue = StoreService[storeTypeEnum + "Has"](key);
});
electron.ipcMain.on("cache-get", (event, storeTypeEnum, key) => {
  event.returnValue = StoreService[storeTypeEnum + "Get"](key);
});
electron.ipcMain.handle("cache-set", (_event, storeTypeEnum, key, obj) => {
  StoreService[storeTypeEnum + "Set"](key, obj);
});
electron.ipcMain.handle("cache-delete", (_event, storeTypeEnum, key) => {
  StoreService[storeTypeEnum + "DeleteByKey"](key);
});
let nullWin;
const screenshotWinMap = /* @__PURE__ */ new Map();
electron.app.whenReady().then(() => {
  createTextOcrWin();
});
electron.ipcMain.handle("screenshot-end-event", (_event, imgByBase64) => {
  ScreenshotsMain.closeScreenshotsWin();
});
electron.ipcMain.handle("screen-scale-factor-event", (_event, screenId) => {
  const screenshotWin = screenshotWinMap.get(screenId);
  if (screenshotWin === void 0) {
    return;
  }
  const thisScreen = electron.screen.getDisplayNearestPoint(electron.screen.getCursorScreenPoint());
  screenshotWin.webContents.send("screen-scale-factor-notice-event", thisScreen.scaleFactor);
});
electron.ipcMain.handle("close-screenshots-win-event", (_event) => {
  ScreenshotsMain.closeScreenshotsWin();
});
function createTextOcrWin() {
  if (ScreenshotsMain.textOcrWin) {
    return console.info("只能有一个createTextOcrWin");
  }
  ScreenshotsMain.textOcrWin = new electron.BrowserWindow({
    // window 使用 fullscreen,  mac 设置为 undefined, 不可为 false
    fullscreen: process.platform !== "darwin" || void 0,
    // win
    width: 1e3,
    height: 1e3,
    webPreferences: {
      // 窗口引入预加载信息
      preload: path__namespace.join(__dirname, "../preload/textOcr.js"),
      sandbox: false,
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  ScreenshotsMain.textOcrWin.hide();
  if (utils.is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    ScreenshotsMain.textOcrWin.loadURL(`${process.env["ELECTRON_RENDERER_URL"]}/textOcr.html`);
  } else {
    ScreenshotsMain.textOcrWin.loadFile(path__namespace.join(__dirname, "../renderer/textOcr.html"));
  }
  ScreenshotsMain.textOcrWin.on("closed", () => {
    ScreenshotsMain.textOcrWin = nullWin;
  });
}
class ScreenshotsSon {
  /**
   * 截图窗口
   */
  screenshotsWin;
  /**
   * 截图窗口ID
   */
  screenshotsWinId;
  /**
   * 构造函数
   *
   * @param screenshots 截图
   */
  constructor(screenshots) {
    this.screenshotsWinId = (/* @__PURE__ */ new Date()).getTime().toString();
    const width = screenshots.width;
    const height = screenshots.height;
    this.screenshotsWin = new electron.BrowserWindow({
      // window 使用 fullscreen,  mac 设置为 undefined, 不可为 false
      fullscreen: process.platform !== "darwin" || void 0,
      // win
      width,
      height,
      x: screenshots.x,
      y: screenshots.y,
      // 透明的
      transparent: true,
      // 去除窗口边框
      frame: false,
      // 跳过任务栏
      skipTaskbar: true,
      // 自动隐藏菜单栏
      autoHideMenuBar: true,
      // 可移动的
      movable: false,
      // 可调整大小
      resizable: false,
      // 启用大于屏幕
      enableLargerThanScreen: true,
      // mac
      // 有阴影
      hasShadow: false,
      // 默认不显示
      show: false,
      webPreferences: {
        // 窗口引入预加载信息
        preload: path__namespace.join(__dirname, "../preload/screenshot.js"),
        sandbox: false
      }
    });
    this.screenshotsWin.setFullScreenable(false);
    this.screenshotsWin.setAlwaysOnTop(true, "screen-saver");
    if (utils.is.dev && process.env["ELECTRON_RENDERER_URL"]) {
      this.screenshotsWin.loadURL(`${process.env["ELECTRON_RENDERER_URL"]}/screenshot.html`);
    } else {
      this.screenshotsWin.loadFile(path__namespace.join(__dirname, "../renderer/screenshot.html"));
    }
    this.screenshotsWin.on("closed", () => {
      this.screenshotsWin = nullWin;
      screenshotWinMap.delete(this.screenshotsWinId);
    });
    screenshotWinMap.set(this.screenshotsWinId, this.screenshotsWin);
    this.screenshotsWin.webContents.executeJavaScript("JSON.stringify({width:screen.width,height: screen.height})").then((value) => {
      if (SystemTypeEnum.isMac()) {
        this.screenshotsWin.show();
      } else {
        this.screenshotsWin.setAlwaysOnTop(true, "pop-up-menu", 1);
        this.screenshotsWin.setVisibleOnAllWorkspaces(true);
        this.screenshotsWin.showInactive();
      }
      const res = JSON.parse(value);
      const screenWidth = res.width;
      const screenHeight = res.height;
      screenshots.capture().then((imgBuffer) => {
        const image = "data:image/png;base64," + imgBuffer.toString("base64");
        this.screenshotsWin.webContents.send("win-draw-screenshot-style", {
          screenId: this.screenshotsWinId,
          screenImgUrl: image,
          width: screenWidth,
          height: screenHeight
        });
      });
    });
  }
}
class ScreenshotsMain {
  /**
   * 文字识别窗口
   */
  static textOcrWin;
  /**
   * ocr类型
   */
  static ocrType;
  /**
   * 是否已创建截图窗口
   */
  static isCreate = false;
  /**
   * 截图窗口列表
   */
  static screenshotsWinList = new Array();
  /**
   * 创建截图窗口
   */
  createScreenshotsWin() {
    if (ScreenshotsMain.isCreate) {
      log.info("已经触发截图事件");
      return;
    }
    GlobalShortcutEvent.register("Alt+Esc", () => {
      ScreenshotsMain.closeScreenshotsWin();
    });
    ScreenshotsMain.isCreate = true;
    const allScreenshots = nodeScreenshots.Screenshots.all() ?? [];
    allScreenshots.forEach((screenshots) => {
      ScreenshotsMain.screenshotsWinList.push(new ScreenshotsSon(screenshots));
    });
    setTimeout(() => {
      GlobalShortcutEvent.register("Esc", () => {
        ScreenshotsMain.closeScreenshotsWin();
      });
    }, 500);
  }
  /**
   * 关闭截图窗口事件
   */
  static closeScreenshotsWin() {
    GlobalShortcutEvent.unregister("Esc");
    GlobalShortcutEvent.unregister("Alt+Esc");
    if (!ScreenshotsMain.isCreate) {
      return;
    }
    ScreenshotsMain.screenshotsWinList.forEach((screenshotsSon) => {
      screenshotsSon.screenshotsWin.close();
    });
    ScreenshotsMain.screenshotsWinList = [];
    ScreenshotsMain.isCreate = false;
  }
}
const isMac = SystemTypeEnum.isMac();
class GlobalShortcutClass {
  /**
   * 快捷键
   */
  key;
  /**
   * 快捷键触发回调
   */
  callback;
  constructor(key, callback) {
    this.key = key;
    this.callback = callback;
  }
}
class GlobalShortcutEvent {
  /**
   * 主窗口
   */
  static mainWin;
  /**
   * 是否划词中
   */
  static isChoice = false;
  /**
   * 全局快捷键列表
   */
  globalShortcutList;
  constructor() {
    electron.app.on("will-quit", () => {
      electron.globalShortcut.unregisterAll();
    });
    this.globalShortcutList = [];
  }
  /**
   * 注册全局快捷方式
   */
  registerAll() {
    this.globalShortcutList.forEach((info) => {
      GlobalShortcutEvent.registerBuild(info);
    });
  }
  /**
   * 单个快捷键注册
   *`
   * @param info 全局快捷键
   */
  static registerBuild(info) {
    if (electron.globalShortcut.isRegistered(info.key)) {
      console.log("快捷键已注册");
    }
    if (!electron.globalShortcut.register(info.key, info.callback)) {
      console.log("快捷键注册失败");
    }
  }
  /**
   * 单个快捷键注册
   *
   * @param key 快捷键
   * @param callback 快捷键按下后的回调
   */
  static register(key, callback) {
    GlobalShortcutEvent.registerBuild(new GlobalShortcutClass(key, callback));
  }
  /**
   * 单个快捷键注销
   *
   * @param key 快捷键
   */
  static unregister(key) {
    electron.globalShortcut.unregister(key);
  }
  /**
   * 注销Esc
   */
  static unregisterEsc() {
    GlobalShortcutEvent.unregister("Esc");
  }
  /**
   * 显示翻译窗口快捷键
   */
  static translateInput() {
    GlobalWin.mainWinShow();
  }
  /**
   * 获取粘贴板上的划词文本
   * @returns selectedText 选择的文本
   */
  static getSelectedText = async () => {
    const translateChoiceDelay = Math.floor(StoreService.configGet("translateChoiceDelay") / 2);
    GlobalWin.mainWinSend("clear-all-translated-content");
    const currentClipboardContent = electron.clipboard.readText();
    electron.clipboard.clear();
    await new Promise((resolve) => setTimeout(resolve, translateChoiceDelay));
    console.info("[划词翻译] - 执行复制操作");
    robot.keyToggle("c", "down", isMac ? "command" : "control");
    await new Promise((resolve) => setTimeout(resolve, translateChoiceDelay));
    robot.keyToggle("c", "up", isMac ? "command" : "control");
    const selectedText = electron.clipboard.readText();
    console.info("[划词翻译] - 读取新复制的内容 :", selectedText);
    electron.clipboard.writeText(currentClipboardContent);
    GlobalShortcutEvent.isChoice = false;
    return selectedText;
  };
  /**
   * 单个词时拆分驼峰命名
   *
   * @param str 拆分的字符
   * @return 处理后的字符
   */
  static splitSingleCamelCase = (str) => {
    if (/^[A-Za-z][A-Za-z]*$/.test(str)) {
      return str.replace(/([a-z])([A-Z])/g, "$1 $2");
    } else {
      return str;
    }
  };
  /**
   * 单个词时拆分下划线命名
   *
   * @param str 拆分的字符
   * @return 处理后的字符
   */
  static splitSingleUnderScore = (str) => {
    if (/^[a-z0-9_]+$/i.test(str)) {
      return str.replace(/_/g, " ");
    } else {
      return str;
    }
  };
  /**
   * 截图翻译快捷键Alt + W
   */
  static translateScreenshot() {
    console.info("start-cut-image");
    GlobalWin.mainWinSend("clear-all-translated-content");
    GlobalWin.mainWinHide();
    new ScreenshotsMain().createScreenshotsWin();
  }
  /**
   * 划取文本快捷键
   */
  static translateChoice() {
    if (GlobalShortcutEvent.isChoice) {
      return;
    }
    uiohookNapi.uIOhook.keyToggle(uiohookNapi.UiohookKey.Ctrl, "up");
    uiohookNapi.uIOhook.keyToggle(uiohookNapi.UiohookKey.CtrlRight, "up");
    uiohookNapi.uIOhook.keyToggle(uiohookNapi.UiohookKey.Alt, "up");
    uiohookNapi.uIOhook.keyToggle(uiohookNapi.UiohookKey.AltRight, "up");
    uiohookNapi.uIOhook.keyToggle(uiohookNapi.UiohookKey.Shift, "up");
    uiohookNapi.uIOhook.keyToggle(uiohookNapi.UiohookKey.ShiftRight, "up");
    uiohookNapi.uIOhook.keyToggle(uiohookNapi.UiohookKey.Space, "up");
    uiohookNapi.uIOhook.keyToggle(uiohookNapi.UiohookKey.Meta, "up");
    uiohookNapi.uIOhook.keyToggle(uiohookNapi.UiohookKey.MetaRight, "up");
    uiohookNapi.uIOhook.keyToggle(uiohookNapi.UiohookKey.Tab, "up");
    uiohookNapi.uIOhook.keyToggle(uiohookNapi.UiohookKey.Escape, "up");
    GlobalShortcutEvent.isChoice = true;
    GlobalShortcutEvent.isChoice = true;
    const printSelectedText = (selectedText) => {
      GlobalShortcutEvent.isChoice = false;
      selectedText = GlobalShortcutEvent.splitSingleCamelCase(selectedText);
      selectedText = GlobalShortcutEvent.splitSingleUnderScore(selectedText);
      GlobalWin.mainWinUpdateTranslatedContent(selectedText);
      GlobalWin.mainWinShow();
    };
    GlobalShortcutEvent.getSelectedText().then(printSelectedText);
  }
  /**
   * @param type 快捷键类型 shortcutKey 快捷键alt + e
   * 注册快捷键
   */
  static translateRegister(type, shortcutKey) {
    let res;
    if (ShortcutKeyEnum.INPUT === type) {
      res = GlobalShortcutEvent.translateInputRegister(shortcutKey);
    } else if (ShortcutKeyEnum.SCREENSHOT === type) {
      res = GlobalShortcutEvent.translateScreenshotRegister(shortcutKey);
    } else if (ShortcutKeyEnum.CHOICE === type) {
      res = GlobalShortcutEvent.translateChoiceRegister(shortcutKey);
    } else {
      console.error("快捷键类型不存在");
    }
    return res;
  }
  /**
   * 输入翻译快捷键 - 注册
   */
  static translateInputRegister(shortcutKey) {
    return GlobalShortcutEvent.register(shortcutKey, () => {
      GlobalShortcutEvent.translateInput();
    });
  }
  /**
   * 截屏翻译快捷键 - 注册
   */
  static translateScreenshotRegister(shortcutKey) {
    return GlobalShortcutEvent.register(
      shortcutKey,
      () => GlobalShortcutEvent.translateScreenshot()
    );
  }
  /**
   * 划词翻译快捷键 - 注册
   */
  static translateChoiceRegister(shortcutKey) {
    return GlobalShortcutEvent.register(
      shortcutKey,
      async () => GlobalShortcutEvent.translateChoice()
    );
  }
}
class GlobalWin {
  /**
   * 主窗口
   */
  static mainWin;
  /**
   * 主窗口是否关闭
   */
  static isMainWinClose = false;
  /**
   * 主窗口是否置顶
   */
  static isMainAlwaysOnTop = false;
  /**
   * 设置窗口
   */
  static setWin;
  /**
   * 显示窗口
   */
  static winShow(win) {
    if (isNull(win)) {
      return;
    }
    win.show();
  }
  /**
   * 设置主窗口
   *
   * @param mainWin 主窗口
   */
  static setMainWin(mainWin) {
    if (isNull(GlobalWin.mainWin)) {
      GlobalWin.mainWin = mainWin;
    }
  }
  /**
   * 隐藏主窗口
   */
  static mainWinHide() {
    GlobalWin.winHide(GlobalWin.mainWin);
  }
  /**
   * 隐藏窗口
   */
  static winHide(win) {
    if (isNull(win)) {
      return;
    }
    GlobalShortcutEvent.unregisterEsc();
    win.hide();
  }
  /**
   * 显示主窗口
   */
  static mainWinShow() {
    GlobalWin.winShow(GlobalWin.mainWin);
  }
  /**
   * 主窗口事件发送
   *
   * @param key 发送key
   * @param val 发送值
   */
  static mainWinSend(key, ...val) {
    GlobalWin.mainWin.webContents.send(key, ...val);
  }
  /**
   *
   * @param text 文本
   * @returns
   */
  static mainWinUpdateTranslatedContent(text) {
    text = isNull(text) ? "" : text.replace(/^[ \t]*[\r\n]+|[ \t]*[\r\n]+$/g, "");
    GlobalWin.mainWinSend("update-translated-content", text);
    return text;
  }
}
class WinEvent {
  static mainWinInfo;
  constructor(mainWinInfo2) {
    WinEvent.mainWinInfo = mainWinInfo2;
    electron.ipcMain.handle("always-on-top-event", (_event, status) => {
      WinEvent.alwaysOnTop(status);
    });
    electron.ipcMain.handle("window-close-event", () => {
      WinEvent.closeWin();
    });
    electron.ipcMain.handle("window-minimize-event", () => {
      WinEvent.minimizeWin();
    });
  }
  /**
   * 主窗口置顶
   *
   * @param status 置顶状态
   */
  static alwaysOnTop(status) {
    GlobalWin.mainWin.setAlwaysOnTop(status);
    GlobalWin.isMainAlwaysOnTop = status;
  }
  /**
   * 主窗口关闭
   */
  static closeWin() {
    GlobalWin.mainWin.close(true);
  }
  /**
   * 主窗口最小化
   */
  static minimizeWin() {
    GlobalWin.mainWin.minimize();
  }
}
class TrayEvent {
  static mainTray;
  constructor() {
    if (isNotNull(TrayEvent.mainTray)) {
      return;
    }
    const trayMenuTemplate = [
      {
        enabled: false,
        label: "electron 版本 " + electron.app.getVersion()
      },
      { type: "separator" },
      {
        label: "输入翻译",
        click: () => {
          GlobalShortcutEvent.translateInput();
        }
      }
    ];
    let iconPath;
    if (SystemTypeEnum.isMac()) {
      iconPath = path.join(__dirname, "../../public/icon-mac-tray.png");
    } else if (SystemTypeEnum.isWin()) {
      iconPath = path.join(__dirname, "../../public/icon-1024x1024.png");
    } else {
      iconPath = path.join(__dirname, "../../public/logo-16x16.png");
    }
    if (SystemTypeEnum.isMac()) {
      const icon2 = electron.nativeImage.createFromPath(iconPath);
      const trayIcon = icon2.resize({ width: 16 });
      trayIcon.setTemplateImage(true);
      TrayEvent.mainTray = new electron.Tray(trayIcon);
    } else {
      TrayEvent.mainTray = new electron.Tray(iconPath);
    }
    TrayEvent.mainTray.setToolTip("electron");
    const contextMenu = electron.Menu.buildFromTemplate(trayMenuTemplate);
    TrayEvent.mainTray.setContextMenu(contextMenu);
    TrayEvent.mainTray.on("click", () => {
      if (SystemTypeEnum.isWin()) ;
    });
  }
}
const mainWinInfo = {
  width: 550,
  height: 339
};
const initStore = async () => {
  await StoreService.init();
  await StoreService.initConfig();
};
initStore();
let mainWindow;
function createWindow() {
  mainWindow = new electron.BrowserWindow({
    width: mainWinInfo.width,
    height: mainWinInfo.height,
    show: false,
    frame: false,
    resizable: true,
    transparent: true,
    autoHideMenuBar: true,
    ...process.platform === "linux" ? { icon } : {},
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      sandbox: false
    }
  });
  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });
  mainWindow.webContents.setWindowOpenHandler((details) => {
    electron.shell.openExternal(details.url);
    return { action: "deny" };
  });
  if (utils.is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
  GlobalWin.setMainWin(mainWindow);
  new WinEvent(mainWinInfo);
  new TrayEvent();
}
electron.app.whenReady().then(() => {
  utils.electronApp.setAppUserModelId("com.electron");
  electron.app.on("browser-window-created", (_, window) => {
    utils.optimizer.watchWindowShortcuts(window);
  });
  electron.ipcMain.on("ping", () => console.log("pong"));
  createWindow();
  electron.app.on("activate", function() {
    if (electron.BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
