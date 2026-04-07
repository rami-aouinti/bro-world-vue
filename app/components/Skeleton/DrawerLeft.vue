<template>
  <div class="drawer-left-skeleton pa-3">
    <v-skeleton-loader type="heading" class="mb-4" />

    <div class="d-flex flex-column ga-3">
      <v-skeleton-loader type="list-item-two-line" />
      <v-skeleton-loader type="list-item-two-line" />
      <v-skeleton-loader type="list-item-two-line" />
      <v-skeleton-loader type="list-item-two-line" />
      <v-skeleton-loader type="list-item-two-line" />
    </div>
  </div>
</template>

<style scoped>
.drawer-left-skeleton {
  min-height: 100%;
}
</style>
