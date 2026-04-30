<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    rounded?: string
    variant?: string
    baseClass?: string
    extraClass?: string
  }>(),
  {
    rounded: 'xl',
    variant: undefined,
    baseClass: 'postcard-gradient-card',
    extraClass: '',
  },
)

const cardClass = computed(() =>
  [props.baseClass, props.extraClass].filter(Boolean),
)
</script>

<template>
  <v-card :rounded="rounded" :variant="variant" :class="cardClass">
    <slot />
  </v-card>
</template>
