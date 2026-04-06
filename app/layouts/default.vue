<script setup lang="ts">
const showLeftDrawer = useState('show-left-drawer', () => true)
const showRightDrawer = useState('show-right-drawer', () => true)
</script>

<template>
  <v-app>
    <AppBar />
    <AppDrawer v-if="showLeftDrawer" />
    <AppRightDrawer v-if="showRightDrawer" />
    <v-main>
      <slot />
    </v-main>
    <AppFooter />
  </v-app>
</template>

<style scoped>
.v-main {
  padding-top: 104px;
  padding-bottom: 56px;
  overflow-y: auto;
  transition-property: padding;
  min-height: 100vh;
}

@media (max-width: 960px) {
  .v-main {
    padding-top: 92px;
    padding-bottom: 52px;
  }
}
</style>
