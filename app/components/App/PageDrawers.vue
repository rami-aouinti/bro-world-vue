<script setup lang="ts">
import { onUnmounted, useSlots } from 'vue'

const slots = useSlots()

const registry = useDrawerSlotRegistry()

const LeftDrawerContent = slots.left || null
const RightDrawerContent = slots.right || null

registry?.setLeft(LeftDrawerContent)
registry?.setRight(RightDrawerContent)

onUnmounted(() => {
  if (registry?.left.value === LeftDrawerContent) {
    registry.setLeft(null)
  }

  if (registry?.right.value === RightDrawerContent) {
    registry.setRight(null)
  }
})
</script>

<template>
  <div class="d-none" aria-hidden="true" />
</template>
