<script setup lang="ts">
import { computed, onBeforeUnmount, useSlots } from 'vue'

const slots = useSlots()

const registry = useDrawerSlotRegistry()
const scopeId = Symbol('page-drawers-scope')

const leftRenderer = computed(() => (slots.left ? () => slots.left?.() : null))
const rightRenderer = computed(() =>
  slots.right ? () => slots.right?.() : null,
)

watchEffect(() => {
  if (!registry) {
    return
  }

  const left = leftRenderer.value
  const right = rightRenderer.value

  if (left) {
    registry.setLeft(Object.assign(left, { __scopeId: scopeId }))
  }
  else if ((registry.left.value as { __scopeId?: symbol } | null)?.__scopeId === scopeId) {
    registry.setLeft(null)
  }

  if (right) {
    registry.setRight(Object.assign(right, { __scopeId: scopeId }))
  }
  else if ((registry.right.value as { __scopeId?: symbol } | null)?.__scopeId === scopeId) {
    registry.setRight(null)
  }
})

onBeforeUnmount(() => {
  if (!registry) {
    return
  }

  if ((registry.left.value as { __scopeId?: symbol } | null)?.__scopeId === scopeId) {
    registry.setLeft(null)
  }

  if ((registry.right.value as { __scopeId?: symbol } | null)?.__scopeId === scopeId) {
    registry.setRight(null)
  }
})
</script>

<template>
  <div class="d-none" aria-hidden="true" />
</template>
