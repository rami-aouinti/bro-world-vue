<script setup lang="ts">
import type { RouteLocationRaw, RouteRecordRaw } from 'vue-router'

const { item } = defineProps<{
  item: RouteRecordRaw
}>()
const visibleChildren = computed(() =>
  item.children
    ?.filter((child) => child.meta?.icon && !child.path.includes(':'))
    .sort((a, b) => (a.meta?.drawerIndex ?? 99) - (b.meta?.drawerIndex ?? 98)),
)
const visibleChildrenNum = computed(() => visibleChildren.value?.length || 0)
const isItem = computed(() => !item.children || visibleChildrenNum.value <= 1)
const title = toRef(() => item.meta?.title)
const icon = toRef(() => item.meta?.icon)
const targetRouteName = computed<string | undefined>(() => {
  if (typeof item.name === 'string' && item.name.length > 0) {
    return item.name
  }

  return visibleChildren.value?.find((child) => typeof child.name === 'string')
    ?.name as string | undefined
})
const to = computed<RouteLocationRaw | undefined>(() => {
  if (!targetRouteName.value) {
    return undefined
  }

  return { name: targetRouteName.value }
})
const route = useRoute()
const { t } = useI18n()
const translatedTitle = computed(() =>
  typeof title.value === 'string' ? t(title.value) : '',
)
const isActive = computed(() => {
  return route.path.startsWith(item.path)
})
</script>

<template>
  <v-list-item
    v-if="isItem && icon && to"
    :to="to"
    :prepend-icon="icon"
    active-class="text-primary"
    :title="translatedTitle"
  />
  <v-list-group v-else-if="icon" :prepend-icon="icon" color="primary">
    <template #activator="{ props: vProps }">
      <v-list-item
        :title="translatedTitle"
        v-bind="vProps"
        :active="isActive"
      />
    </template>
    <AppDrawerItem
      v-for="child in visibleChildren"
      :key="String(child.name ?? child.path)"
      :item="child"
    />
  </v-list-group>
</template>
