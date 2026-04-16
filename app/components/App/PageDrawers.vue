<script setup lang="ts">
import { onBeforeUnmount, useSlots } from 'vue'

const slots = useSlots()

const registry = useDrawerSlotRegistry()
const scopeId = Symbol('page-drawers-scope')

const leftRenderer = slots.left
  ? Object.assign(() => slots.left?.(), { __scopeId: scopeId })
  : null
const rightRenderer = slots.right
  ? Object.assign(() => slots.right?.(), { __scopeId: scopeId })
  : null

if (registry) {
  if (leftRenderer) {
    registry.setLeft(leftRenderer)
  } else if (
    (registry.left.value as { __scopeId?: symbol } | null)?.__scopeId ===
    scopeId
  ) {
    registry.setLeft(null)
  }

  if (rightRenderer) {
    registry.setRight(rightRenderer)
  } else if (
    (registry.right.value as { __scopeId?: symbol } | null)?.__scopeId ===
    scopeId
  ) {
    registry.setRight(null)
  }
}

onBeforeUnmount(() => {
  if (!registry) {
    return
  }

  if (
    (registry.left.value as { __scopeId?: symbol } | null)?.__scopeId ===
    scopeId
  ) {
    registry.setLeft(null)
  }

  if (
    (registry.right.value as { __scopeId?: symbol } | null)?.__scopeId ===
    scopeId
  ) {
    registry.setRight(null)
  }
})
</script>

<template>
  <div class="d-none" aria-hidden="true" />
</template>
