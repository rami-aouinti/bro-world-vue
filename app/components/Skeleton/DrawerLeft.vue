<template>
  <div class="px-3 pt-3">
    <v-skeleton-loader type="heading" class="mb-4" />

    <div class="d-flex flex-column ga-3">
      <v-skeleton-loader
        v-for="index in 6"
        :key="`left-drawer-row-${index}`"
        type="list-item-avatar"
      />
    </div>
  </div>
</template>
