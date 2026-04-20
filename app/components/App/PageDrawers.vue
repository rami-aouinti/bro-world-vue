<script setup lang="ts">
import { h, onBeforeUnmount, useSlots, type Component } from 'vue'

const props = defineProps<{
  leftComponent?: Component
  leftProps?: Record<string, unknown>
  rightComponent?: Component
  rightProps?: Record<string, unknown>
}>()

const slots = useSlots()

const registry = useDrawerSlotRegistry()
const scopeId = Symbol('page-drawers-scope')

const leftRenderer = props.leftComponent
  ? Object.assign(
      () => [h(props.leftComponent as Component, props.leftProps ?? {})],
      { __scopeId: scopeId },
    )
  : slots.left
    ? Object.assign(() => slots.left?.(), { __scopeId: scopeId })
    : null
const rightRenderer = props.rightComponent
  ? Object.assign(
      () => [h(props.rightComponent as Component, props.rightProps ?? {})],
      { __scopeId: scopeId },
    )
  : slots.right
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
