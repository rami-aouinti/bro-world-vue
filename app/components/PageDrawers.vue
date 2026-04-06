<script setup lang="ts">
import { onUnmounted, useSlots } from 'vue'

const slots = useSlots()

const hasPageLeftDrawer = useState('has-page-left-drawer', () => false)
const hasPageRightDrawer = useState('has-page-right-drawer', () => false)

hasPageLeftDrawer.value = Boolean(slots.left)
hasPageRightDrawer.value = Boolean(slots.right)

onUnmounted(() => {
  hasPageLeftDrawer.value = false
  hasPageRightDrawer.value = false
})
</script>

<template>
  <Teleport v-if="$slots.left" to="#page-left-drawer-content">
    <slot name="left" />
  </Teleport>

  <Teleport v-if="$slots.right" to="#page-right-drawer-content">
    <slot name="right" />
  </Teleport>
</template>
