<template>
  <i :class="[`yi-icon yi-icon_${iconClass}`, `${size}`]"></i>
</template>

<script setup lang="ts">
defineProps({
  iconClass: {
    type: String,
    required: true
  },
  className: {
    // 给图标添加class
    type: String,
    default: ''
  },
  color: {
    // 设置图标颜色
    type: String,
    default: '#333'
  },
  size: {
    type: String,
    default: 'sm'
  }
})
</script>

<style lang="less">
.yi-icon-image (@name, @url) {
  &_@{name} {
    background: url('../assets/@{url}.svg') no-repeat center / 100% 100%;
  }
}

.yi-icon {
  display: inline-block;

  &.xs {
    width: 12px;
    height: 12px;
  }

  &.sm {
    width: 14px;
    height: 14px;
  }

  &.md {
    width: 16px;
    height: 16px;
  }

  &.lg {
    width: 18px;
    height: 18px;
  }

  &.xl {
    width: 20px;
    height: 20px;
  }

  &.xxl {
    width: 22px;
    height: 22px;
  }

  &.xxl {
    width: 24px;
    height: 24px;
  }

  &.xxxl {
    width: 26px;
    height: 26px;
  }

  &.xxxxl {
    width: 28px;
    height: 28px;
  }

  .yi-icon-image(thumbtack, 'thumbtack');
  .yi-icon-image(thumbtack-select, 'thumbtack-select');
  .yi-icon-image(cut, 'cut');
  .yi-icon-image(close, 'close');
  .yi-icon-image(logo, 'logo');
  .yi-icon-image(camera, 'camera');
}
</style>
