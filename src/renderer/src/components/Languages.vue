<template>
  <div class="language-select">
    <div class="language-box">{{ langLable(lang) }}</div>
    <div class="icon-sort">
      <el-icon><Sort /></el-icon>
    </div>
    <div class="language-box">{{ langLable(targetLang) }}</div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const lang = ref('zh-CN')
const targetLang = ref('en-US')

const langLable = (lang: string): void => {
  const labelMap = { 'zh-CN': '中文', 'en-US': '英文' }
  return labelMap[lang]
}
</script>

<style lang="less">
.language-select {
  display: flex;
  align-items: center;
  font-size: 12px;
  background: var(--ev-c-white-mute);
  padding: 2px 5px;
  cursor: pointer;
}
.icon-sort {
  transform: rotate(90deg);
  margin: 0px 10px;
}
</style>
