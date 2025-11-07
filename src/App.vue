<script setup lang="ts">
const commonStore = useCommonStore()
</script>

<template>
  <div class="app">
    <error-modal
      v-if="commonStore.showErr"
      :code="commonStore.errCode"
      :message="commonStore.errMsg"
      @close="commonStore.showErr = false"
    ></error-modal>
    <router-view></router-view>
  </div>
</template>

<style scoped>
.app {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
}
</style>
