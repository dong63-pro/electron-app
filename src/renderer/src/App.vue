<template>
  <div class="app-container">
    <Header />
    <div class="app-content">
      <div class="app-tool">
        <Languages />
        <div class="app-tool-btn">
          <div @click="screenShotsTrans">
            <svg-icon icon-class="camera"></svg-icon>
            <span>截图翻译</span>
          </div>
          <div @click="selectWordsTrans">划词翻译</div>
        </div>
      </div>
      <el-input
        ref="appInputRef"
        v-model="translateContent"
        :autosize="{ minRows: 6, maxRows: 10 }"
        type="textarea"
        placeholder="请输入或粘贴文字"
        :autofocus="true"
        size="small"
        @keydown.enter="translateFun"
      />
      <img :src="screenShotSrc" class="img" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Header from './components/Header.vue'
import Languages from './components/Languages.vue'

const translateContent = ref('')
const appInputRef = ref<HTMLDivElement>()
const screenShotSrc = ref('')

// 监听更新翻译输入内容事件
window.api.updateTranslateContentEvent((content) => {
  translateContent.value = content
  translateFun()
})

// 清空翻译输入、结果内容事件
window.api.clearAllTranslateContentEvent(() => {
  translateContent.value = ''
})

window.api.screenshotEndNotifyEvent((imageBase64) => {
  screenShotSrc.value = imageBase64
})

// 开启划词翻译
const selectWordsTrans = (): void => {}

// 截图翻译
const screenShotsTrans = (): void => {
  window.api.screenShotsStartEvent()
}

// 翻译
const translateFun = (): void => {}
</script>

<style lang="less">
.app-container {
  height: 100%;
  padding: 5px;
  color: #000;
  font-size: 14px;

  .app-content {
    padding: 10px 27px;

    .app-tool {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
      font-size: 12px;

      .app-tool-btn {
        display: flex;
        cursor: pointer;
        gap: 10px;

        div {
          display: flex;
          align-items: center;
          gap: 3px;
        }
      }
    }

    .img {
      border-radius: 5px;
      max-width: 95%;
      max-height: 95%;
      width: auto;
      height: auto;
      object-fit: contain;
      user-select: none;
      -webkit-user-drag: none;
    }
  }
}
</style>
