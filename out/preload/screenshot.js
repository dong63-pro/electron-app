"use strict";
const electron = require("electron");
const preload = require("@electron-toolkit/preload");
const ipcRenderer = preload.electronAPI.ipcRenderer;
document.oncontextmenu = () => {
  ipcRenderer.invoke("close-screenshots-win-event");
};
ipcRenderer.on("win-multiple-draw-screenshot-style", async (_event, screenImgInfo) => {
  const toCanvas = (canvas, img, w, h) => {
    canvas.width = w;
    canvas.height = h;
    const x = electron.nativeImage.createFromBuffer(img).toBitmap();
    for (let i = 0; i < x.length; i += 4) {
      [x[i], x[i + 2]] = [x[i + 2], x[i]];
    }
    const d = new ImageData(Uint8ClampedArray.from(x), w, h);
    canvas.getContext("2d").putImageData(d, 0, 0);
  };
  for (const i of screenImgInfo) {
    i.height = i.height * i.scaleFactor;
    i.width = i.width * i.scaleFactor;
    if (i) {
      const c = document.createElement("canvas");
      toCanvas(c, i.image, i.width, i.height);
    }
  }
});
ipcRenderer.on("win-draw-screenshot-style", async (_event, screenImgInfo) => {
  document.getElementById("screenId").value = screenImgInfo.screenId;
  ipcRenderer.invoke("screen-scale-factor-event", screenImgInfo.screenId);
  const bg = document.querySelector(".bg");
  const bgMagnifier = document.getElementById("magnifierImg");
  const rect = document.querySelector(".rect");
  const sizeInfo = document.querySelector(".size-info");
  const draw = new Draw(
    screenImgInfo.screenImgUrl,
    // @ts-ignore
    bg,
    bgMagnifier,
    screenImgInfo.width,
    screenImgInfo.height,
    rect,
    sizeInfo
  );
  document.addEventListener("mousedown", draw.startRect.bind(draw));
  document.addEventListener("mousemove", draw.drawingRect.bind(draw));
  document.addEventListener("mouseup", draw.endRect.bind(draw));
});
class SelectRectMeta {
  // canvas 最终的 left
  x;
  // canvas 最终的 top
  y;
  // 鼠标一开始点那个点，e.pageX
  startX;
  // 鼠标一开始点那个点，e.pageY
  startY;
  // 向量，宽，为负说明在 startX 的左边
  w;
  // 向量，高，为负说明在 startY 的左边
  h;
  // 是否可画，mousedown 为 true，mouseup 为 false
  drawing;
  // 是否可拖拽
  dragging;
  // 矩阵图信息
  RGBAData;
  // base64 编码的二进制图片数据
  base64Data;
  constructor() {
    this.x = 0;
    this.y = 0;
    this.startX = 0;
    this.startY = 0;
    this.w = 0;
    this.h = 0;
    this.drawing = false;
    this.dragging = false;
    this.RGBAData = null;
    this.base64Data = null;
  }
}
class Draw {
  screenImgUrl;
  screenWidth;
  screenHeight;
  $bgImageDOM;
  $bgMagnifierImageDOM;
  /**
   * 背景图数据存在 canvas 里面
   */
  $bgCanvasTemp;
  /**
   * 剪切下来的图
   */
  $bgCanvasTempCtx;
  $rectCanvasDOM;
  $rectCanvasCtx;
  $sizeInfoDom;
  selectRectMeta;
  drawing;
  constructor(screenImgUrl, bg, bgMagnifier, screenWidth, screenHeight, rect, sizeInfo) {
    this.drawing = false;
    this.screenImgUrl = screenImgUrl;
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
    this.$bgImageDOM = bg;
    this.$bgMagnifierImageDOM = bgMagnifier;
    this.$bgCanvasTemp = null;
    this.$bgCanvasTempCtx = null;
    this.initFullScreenCanvas();
    this.$rectCanvasDOM = rect;
    this.$rectCanvasCtx = this.$rectCanvasDOM.getContext("2d");
    this.$sizeInfoDom = sizeInfo;
    this.selectRectMeta = new SelectRectMeta();
    this.updateMouseCoordinate = this.updateMouseCoordinate.bind(this);
    this.setSizeInfo = this.setSizeInfo.bind(this);
    this.destroy = this.destroy.bind(this);
    this.done = this.done.bind(this);
  }
  /**
   * 初始化操作
   *
   * 记录屏幕快照，并赋值给背景
   */
  async initFullScreenCanvas() {
    this.$bgImageDOM.src = this.screenImgUrl;
    this.$bgMagnifierImageDOM.src = this.screenImgUrl;
    this.$bgCanvasTemp = document.createElement("canvas");
    this.$bgCanvasTempCtx = this.$bgCanvasTemp.getContext("2d");
    const img = await new Promise((resolve) => {
      const img2 = new Image();
      img2.src = this.screenImgUrl;
      if (img2.complete) {
        resolve(img2);
      } else {
        img2.onload = () => resolve(img2);
      }
    });
    this.$bgCanvasTemp.style.backgroundSize = `cover`;
    this.$bgCanvasTemp.width = this.screenWidth;
    this.$bgCanvasTemp.height = this.screenHeight;
    this.$bgCanvasTempCtx.drawImage(img, 0, 0, this.screenWidth, this.screenHeight);
    this.$bgCanvasTempCtx.backgroundSize = "cover";
  }
  // 开始按下，对应mousedown事件
  startRect(e) {
    this.drawing = true;
    this.selectRectMeta.startX = e.pageX;
    this.selectRectMeta.startY = e.pageY;
  }
  /**
   * 鼠标移动事件
   * 正在画矩形选区
   *
   * @param e
   */
  drawingRect(e) {
    if (!this.drawing) {
      return;
    }
    this.updateMouseCoordinate(e);
    const selectWidth = Math.abs(this.selectRectMeta.w);
    const selectHeight = Math.abs(this.selectRectMeta.h);
    const selectX = Math.abs(this.selectRectMeta.x);
    const selectY = Math.abs(this.selectRectMeta.y);
    this.$rectCanvasDOM.width = selectWidth;
    this.$rectCanvasDOM.height = selectHeight;
    this.$rectCanvasDOM.style.left = `${selectX}px`;
    this.$rectCanvasDOM.style.top = `${selectY}px`;
    if (!this.selectRectMeta.w || !this.selectRectMeta.h) {
      return;
    }
    if (null === this.$bgCanvasTempCtx) {
      return;
    }
    this.selectRectMeta.RGBAData = this.$bgCanvasTempCtx.getImageData(
      selectX,
      selectY,
      Math.abs(this.selectRectMeta.w),
      Math.abs(this.selectRectMeta.h)
    );
    if (null === this.$rectCanvasCtx) {
      return;
    }
    this.$rectCanvasCtx.putImageData(this.selectRectMeta.RGBAData, 0, 0);
    this.$rectCanvasCtx.fillStyle = "#0091ff30";
    this.$rectCanvasCtx.fillRect(0, 0, selectWidth, selectHeight);
    this.$rectCanvasCtx.strokeStyle = "#2371F8";
    this.$rectCanvasCtx.lineWidth = 1;
    this.$rectCanvasCtx.strokeRect(0, 0, this.$rectCanvasDOM.width, Math.abs(this.selectRectMeta.h));
    this.setSizeInfo();
  }
  /**
   * 更新当前鼠标画图的坐标信息
   *
   * @param e
   */
  updateMouseCoordinate(e) {
    this.selectRectMeta.w = e.pageX - this.selectRectMeta.startX;
    this.selectRectMeta.h = e.pageY - this.selectRectMeta.startY;
    if (this.selectRectMeta.w > 0) {
      this.selectRectMeta.x = this.selectRectMeta.startX;
    } else {
      this.selectRectMeta.x = e.pageX;
    }
    if (this.selectRectMeta.h > 0) {
      this.selectRectMeta.y = this.selectRectMeta.startY;
    } else {
      this.selectRectMeta.y = e.pageY;
    }
  }
  /**
   * 鼠标释放事件
   * 画完
   */
  endRect() {
    this.drawing = false;
    this.selectRectMeta.base64Data = this.RGBA2ImageData(this.selectRectMeta.RGBAData);
    this.done();
  }
  /**
   * 设置页面宽高信息
   * 主要用于展示
   */
  setSizeInfo() {
    this.$sizeInfoDom.style.display = "block";
    this.$sizeInfoDom.style.left = `${this.selectRectMeta.x}px`;
    this.$sizeInfoDom.style.top = `${this.selectRectMeta.y - 25}px`;
    this.$sizeInfoDom.innerHTML = `${Math.abs(this.selectRectMeta.w)} * ${Math.abs(
      this.selectRectMeta.h
    )}`;
  }
  /**
   * 退出截图
   *
   */
  destroy(imgByBase64) {
    ipcRenderer.invoke("screenshot-end-event", imgByBase64);
  }
  /**
   * 完成截图
   */
  done() {
    const imgByBase64 = this.selectRectMeta.base64Data;
    if (null === imgByBase64) {
      return;
    }
    this.destroy(imgByBase64);
  }
  /**
   * 矩阵图转base64格式
   *
   * 原理是插入canvas里面，通过canvas转成图片
   *
   * @param RGBAImg 矩阵图
   * @returns {string} base64图片
   * @constructor
   */
  RGBA2ImageData(RGBAImg) {
    const width = RGBAImg.width;
    const height = RGBAImg.height;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (ctx == null) {
      return "";
    }
    const imgData = ctx.createImageData(width, height);
    imgData.data.set(RGBAImg.data);
    ctx.putImageData(imgData, 0, 0);
    return canvas.toDataURL();
  }
}
const screenshotEndEvent = (callback) => {
  ipcRenderer.on("win-draw-screenshot-style", (_event) => {
    callback();
  });
};
const screenScaleFactorNoticeEvent = (callback) => {
  ipcRenderer.on("screen-scale-factor-notice-event", (_event, scaleFactor) => {
    callback(scaleFactor);
  });
};
const screenScaleFactorEvent = (screenId) => {
  ipcRenderer.invoke("screen-scale-factor-event", screenId);
};
const api = {
  screenScaleFactorNoticeEvent,
  screenScaleFactorEvent,
  screenshotEndEvent
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
