<script setup lang="ts">
const rightDrawerOpen = useState('right-drawer-open', () => true)
</script>

<template>
  <v-navigation-drawer
    v-model="rightDrawerOpen"
    location="right"
    width="300"
    permanent
    floating
    class="app-right-drawer"
  >
    <v-list class="app-right-drawer-list" />
  </v-navigation-drawer>
</template>

<style scoped>
.app-right-drawer {
  border-radius: 24px;
  margin-top: 56px;
  margin-right: 16px;
  height: calc(100% - 72px);
}

.app-right-drawer-list {
  min-height: calc(100% - 96px);
  max-height: calc(100% - 96px);
}
</style>
