<template>
  <div class="global-loader">
    <v-progress-circular
      indeterminate
      color="primary"
      size="64"
      width="6"
    ></v-progress-circular>
  </div>
</template>

<style scoped>
.global-loader {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.7);
  z-index: 9999;
  backdrop-filter: blur(1px);
}
</style>
