<script setup lang="ts">
import { onUnmounted, useSlots } from 'vue'

const slots = useSlots()

const registry = useDrawerSlotRegistry()

const hasLeft = Boolean(slots.left)
const hasRight = Boolean(slots.right)

if (hasLeft) {
  registry?.setLeft(slots.left || null)
}

if (hasRight) {
  registry?.setRight(slots.right || null)
}

onUnmounted(() => {
  if (hasLeft && registry?.left.value === (slots.left || null)) {
    registry.setLeft(null)
  }

  if (hasRight && registry?.right.value === (slots.right || null)) {
    registry.setRight(null)
  }
})
</script>

<template>
  <div class="d-none" aria-hidden="true" />
</template>
