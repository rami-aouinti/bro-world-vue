<script setup lang="ts">
withDefaults(
  defineProps<{
    length: number
    totalVisible?: number
    rounded?: string
  }>(),
  {
    totalVisible: 7,
    rounded: 'circle',
  },
)

const model = defineModel<number>({ required: true })
</script>

<template>
  <v-pagination
    v-model="model"
    :length="length"
    :total-visible="totalVisible"
    :rounded="rounded"
  />
</template>
