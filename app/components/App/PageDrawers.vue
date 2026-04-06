<script setup lang="ts">
import type { VNode } from 'vue'
import { onUnmounted, useSlots } from 'vue'

type DrawerSlotContent = (() => VNode[] | undefined) | null

const slots = useSlots()

const leftDrawerContent = useState<DrawerSlotContent>(
  'left-drawer-content',
  () => null,
)
const rightDrawerContent = useState<DrawerSlotContent>(
  'right-drawer-content',
  () => null,
)

const LeftDrawerContent = slots.left || null
const RightDrawerContent = slots.right || null

leftDrawerContent.value = LeftDrawerContent
rightDrawerContent.value = RightDrawerContent

onUnmounted(() => {
  if (leftDrawerContent.value === LeftDrawerContent) {
    leftDrawerContent.value = null
  }

  if (rightDrawerContent.value === RightDrawerContent) {
    rightDrawerContent.value = null
  }
})
</script>

<template>
  <div class="d-none" aria-hidden="true" />
</template>
