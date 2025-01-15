<template>
  <div class="app-header">
    <div class="app-header_toolbox">
      <el-tooltip content="钉住窗口">
        <a class="function-tools" @click="thumbtackFun">
          <svg-icon
            :icon-class="thumbtackStatus === YesNoEnum.Y ? 'thumbtack-select' : 'thumbtack'"
            class="function-tools-icon"
          />
        </a>
      </el-tooltip>
      <el-tooltip content="最小化">
        <a class="function-tools" @click="MinimiseWinFn">
          <svg-icon icon-class="cut" class="function-tools-icon" />
        </a>
      </el-tooltip>
      <el-tooltip content="关闭">
        <a class="function-tools" @click="closeGlobalWinFn">
          <svg-icon icon-class="close" class="function-tools-icon" />
        </a>
      </el-tooltip>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { YesNoEnum } from '../enums/YesNoEnum'

const thumbtackStatus = ref(YesNoEnum.N)

const thumbtackFun = (): void => {
  thumbtackStatus.value = thumbtackStatus.value === YesNoEnum.N ? YesNoEnum.Y : YesNoEnum.N
  window.api.alwaysOnTopEvent(thumbtackStatus.value === YesNoEnum.Y)
  return
}

const closeGlobalWinFn = (): void => {
  window.api.windowCloseEvent()
}

const MinimiseWinFn = (): void => {
  window.api.windowMinimize()
}
</script>
<style lang="less">
.app-header {
  /* 配置窗口可拖拽 */
  -webkit-app-region: drag;
  height: 39px;
  color: var(--ev-c-black);

  &_toolbox {
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }

  .function-tools {
    padding: 5px 5px 5px 5px;
    line-height: 1em;
    display: inline-flex;
    justify-content: center;
    cursor: pointer;
    align-items: center;

    &:hover,
    &.active,
    &:active {
      background: var(--ev-c-white-mute);
      border-radius: 2px;
    }

    .function-tools-icon {
      -webkit-app-region: no-drag;
      cursor: pointer;
      font-size: 18px;
      // font-weight: 600;
    }
  }
}
</style>
