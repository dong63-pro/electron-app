<template>
  <i :class="`yi-icon yi-icon_${iconClass}`"></i>
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
  }
})
</script>

<style lang="less">
.svg-icon {
  width: 1em;
  height: 1em;
  position: relative;
  fill: currentColor;
  vertical-align: -2px;
}

.yi-icon-image (@name, @url) {
  &_@{name} {
    background: url('../icons/svg/@{url}.svg') no-repeat center / 100% 100%;
  }
}

.yi-icon {
  width: 0.8em;
  height: 0.8em;
  display: inline-block;

  .yi-icon-image(thumbtack, 'thumbtack');
  .yi-icon-image(thumbtack-select, 'thumbtack-select');
  .yi-icon-image(cut, 'cut');
  .yi-icon-image(close, 'close');
}
</style>
