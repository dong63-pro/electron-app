<template>
  <div class="app-header">
    <div class="app-header_logo">
      <SvgIcon icon-class="logo" size="xxl"></SvgIcon>
    </div>
    <div class="app-header_toolbox">
      <el-tooltip content="钉住窗口">
        <a class="function-tools" @click="thumbtackFun">
          <svg-icon
            :icon-class="thumbtackStatus === YesNoEnum.Y ? 'thumbtack-select' : 'thumbtack'"
            class="function-tools-icon"
          />
        </a>
      </el-tooltip>
      <el-tooltip content="最小化" disabled>
        <a class="function-tools" @click="MinimiseWinFn">
          <svg-icon icon-class="cut" size="sm" class="function-tools-icon" />
        </a>
      </el-tooltip>
      <el-tooltip content="关闭">
        <a class="function-tools" @click="closeGlobalWinFn">
          <svg-icon icon-class="close" size="xs" class="function-tools-icon" />
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
  color: var(--ev-c-black);
  display: flex;
  justify-content: space-between;
  align-items: center;

  &_logo {
    height: 30px;
    display: flex;
    align-items: center;

    &:hover {
      background: var(--ev-c-white-mute);
      border-radius: 2px;
    }
  }

  &_toolbox {
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }

  .function-tools {
    width: 30px;
    height: 25px;
    display: inline-flex;
    justify-content: center;
    cursor: pointer;
    align-items: center;
    gap: 10px;

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
