<script setup lang="ts">
import { onUnmounted, useSlots } from 'vue'

const slots = useSlots()

const registry = useDrawerSlotRegistry()

const hasLeft = Boolean(slots.left)
const hasRight = Boolean(slots.right)
const leftRenderer = hasLeft ? () => slots.left?.() : null
const rightRenderer = hasRight ? () => slots.right?.() : null

if (hasLeft) {
  registry?.setLeft(leftRenderer)
}

if (hasRight) {
  registry?.setRight(rightRenderer)
}

onUnmounted(() => {
  if (hasLeft && registry?.left.value === leftRenderer) {
    registry.setLeft(null)
  }

  if (hasRight && registry?.right.value === rightRenderer) {
    registry.setRight(null)
  }
})
</script>

<template>
  <div class="d-none" aria-hidden="true" />
</template>
