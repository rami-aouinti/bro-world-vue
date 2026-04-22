<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

const model = defineModel<unknown>()

const props = withDefaults(
  defineProps<{
    hideDetails?: boolean | 'auto'
    density?: 'default' | 'comfortable' | 'compact'
    variant?: 'filled' | 'underlined' | 'outlined' | 'plain' | 'solo' | 'solo-filled' | 'solo-inverted'
    menuProps?: Record<string, unknown> & { contentClass?: string }
    menuClass?: string
  }>(),
  {
    hideDetails: true,
    density: 'compact',
    variant: 'outlined',
    menuProps: () => ({}),
    menuClass: 'app-select-menu-surface',
  },
)

const resolvedMenuProps = computed(() => {
  const contentClass = [props.menuClass, props.menuProps?.contentClass]
    .filter((value): value is string => typeof value === 'string' && value.length > 0)
    .join(' ')

  return {
    ...props.menuProps,
    contentClass,
  }
})
</script>

<template>
  <v-select
    v-model="model"
    :hide-details="hideDetails"
    :density="density"
    :variant="variant"
    :menu-props="resolvedMenuProps"
    v-bind="$attrs"
  >
    <template v-for="(_, slotName) in $slots" :key="slotName" #[slotName]="slotProps">
      <slot :name="slotName" v-bind="slotProps || {}" />
    </template>
  </v-select>
</template>

<style>
.app-select-menu-surface {
  background: color-mix(in srgb, rgb(var(--v-theme-primary)) 90%, #000 10%);
  backdrop-filter: blur(6px);
  overflow: hidden;
}

.app-select-menu-surface .v-list {
  background: linear-gradient(
    240deg,
    rgba(var(--v-theme-primary), 0.18) 0%,
    transparent 60%
  );
}
</style>
