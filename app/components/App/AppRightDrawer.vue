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
    <div class="pa-4 d-flex flex-column ga-4">
      <v-card variant="tonal">
        <v-card-title class="text-subtitle-1">Notifications</v-card-title>
        <v-card-text>
          <AppNotification />
        </v-card-text>
      </v-card>

      <v-card variant="tonal">
        <v-card-title class="text-subtitle-1">Settings</v-card-title>
        <v-card-text>
          <AppSettings />
        </v-card-text>
      </v-card>
    </div>
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
