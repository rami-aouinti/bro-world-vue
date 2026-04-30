<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'list' | 'detail' | 'dashboard'
    cards?: number
  }>(),
  {
    variant: 'list',
    cards: 6,
  },
)
</script>

<template>
  <div class="crm-page-skeleton">
    <template v-if="variant === 'dashboard'">
      <v-row class="mb-4">
        <v-col
          v-for="index in 6"
          :key="`dashboard-${index}`"
          cols="12"
          sm="6"
          lg="4"
        >
          <v-skeleton-loader type="card" class="rounded-xl" />
        </v-col>
      </v-row>
      <v-row>
        <v-col
          v-for="index in 3"
          :key="`shortcut-${index}`"
          cols="12"
          sm="6"
          lg="4"
        >
          <v-skeleton-loader
            type="list-item-avatar-two-line"
            class="rounded-xl"
          />
        </v-col>
      </v-row>
    </template>

    <template v-else-if="variant === 'detail'">
      <v-skeleton-loader type="heading" class="mb-4" />
      <v-skeleton-loader type="article" class="mb-4" />
      <v-row>
        <v-col v-for="index in 4" :key="`detail-${index}`" cols="12" md="6">
          <v-skeleton-loader type="text" />
        </v-col>
      </v-row>
    </template>

    <template v-else>
      <v-skeleton-loader type="text" class="mb-4" />
      <v-row>
        <v-col
          v-for="index in cards"
          :key="`list-${index}`"
          cols="12"
          md="6"
          xl="4"
        >
          <v-skeleton-loader type="card" class="rounded-xl" />
        </v-col>
      </v-row>
    </template>
  </div>
</template>
