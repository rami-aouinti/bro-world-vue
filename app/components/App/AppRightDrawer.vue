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
    <div class="pa-4" />
  </v-navigation-drawer>
</template>

<style scoped>
.app-right-drawer {
  border-radius: 24px;
  margin-top: 92px;
  margin-right: 16px;
  height: calc(100% - 108px);
}
</style>
