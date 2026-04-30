<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

const model = defineModel<unknown>()

const props = withDefaults(
  defineProps<{
    hideDetails?: boolean | 'auto'
    density?: 'default' | 'comfortable' | 'compact'
    variant?:
      | 'filled'
      | 'underlined'
      | 'outlined'
      | 'plain'
      | 'solo'
      | 'solo-filled'
      | 'solo-inverted'
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
    .filter(
      (value): value is string => typeof value === 'string' && value.length > 0,
    )
    .join(' ')

  return {
    ...props.menuProps,
    contentClass,
  }
})

function resolveRawItem(item: any) {
  return item?.raw ?? item
}

function resolveItemTitle(item: any, fallback?: string) {
  const raw = resolveRawItem(item)
  if (typeof raw === 'string' || typeof raw === 'number') {
    return String(raw)
  }

  const firstName = String(raw?.firstName ?? raw?.userFirstName ?? '').trim()
  const lastName = String(raw?.lastName ?? raw?.userLastName ?? '').trim()
  const fullName = `${firstName} ${lastName}`.trim()
  const fallbackIdentity = fullName || raw?.username || raw?.email

  return (
    raw?.title ??
    raw?.label ??
    raw?.name ??
    raw?.text ??
    fallbackIdentity ??
    fallback ??
    ''
  )
}

const passthroughSlotNames = computed(() =>
  Object.keys(useSlots()).filter(
    (slotName) => slotName !== 'item' && slotName !== 'selection',
  ),
)
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
    <template #item="slotProps">
      <slot name="item" v-bind="slotProps">
        <v-list-item
          v-bind="slotProps.props"
          :title="resolveItemTitle(slotProps.item)"
          :subtitle="resolveRawItem(slotProps.item)?.subtitle"
        >
          <template
            v-if="
              resolveRawItem(slotProps.item)?.avatar ||
              resolveRawItem(slotProps.item)?.avatarLabel
            "
            #prepend
          >
            <v-avatar v-if="resolveRawItem(slotProps.item)?.avatar" size="24">
              <v-img
                :src="resolveRawItem(slotProps.item)?.avatar"
                :alt="resolveRawItem(slotProps.item)?.title || 'Avatar'"
              />
            </v-avatar>
            <crm-entity-avatar
              v-else
              :label="
                resolveRawItem(slotProps.item)?.avatarLabel ||
                resolveItemTitle(slotProps.item)
              "
              :size="24"
            />
          </template>
        </v-list-item>
      </slot>
    </template>
    <template #selection="slotProps">
      <slot name="selection" v-bind="slotProps">
        <div class="d-flex align-center ga-2">
          <template
            v-if="
              resolveRawItem(slotProps.item)?.avatar ||
              resolveRawItem(slotProps.item)?.avatarLabel
            "
          >
            <v-avatar v-if="resolveRawItem(slotProps.item)?.avatar" size="20">
              <v-img
                :src="resolveRawItem(slotProps.item)?.avatar"
                :alt="resolveRawItem(slotProps.item)?.title || 'Avatar'"
              />
            </v-avatar>
            <crm-entity-avatar
              v-else
              :label="
                resolveRawItem(slotProps.item)?.avatarLabel ||
                resolveItemTitle(slotProps.item)
              "
              :size="20"
            />
          </template>
          <span>{{ resolveItemTitle(slotProps.item) }}</span>
        </div>
      </slot>
    </template>
    <template
      v-for="slotName in passthroughSlotNames"
      :key="slotName"
      #[slotName]="slotProps"
    >
      <slot :name="slotName" v-bind="slotProps || {}" />
    </template>
  </v-select>
</template>

<style>
.app-select-menu-surface {
  border-radius: 14px;
  border: none;
  background:
    linear-gradient(
      240deg,
      rgba(var(--v-theme-primary), 0.12) 0%,
      transparent 28%
    ),
    color-mix(in srgb, rgb(var(--v-theme-surface)) 88%, transparent);
  box-shadow:
    0 18px 42px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(var(--v-theme-primary), 0.14) inset;
  backdrop-filter: blur(32px);
  -webkit-backdrop-filter: blur(32px);
  color: rgb(var(--v-theme-on-surface));
  overflow: hidden;
}

.app-select-menu-surface .v-list {
  background: transparent;
  color: inherit;
}
</style>
