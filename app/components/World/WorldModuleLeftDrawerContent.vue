<script setup lang="ts">
type WorldModuleNavItem = {
  title: string
  to: string
  icon: string
}

const props = defineProps<{
  moduleTitle: string
  modulePath: string
  moduleIdentityPhoto?: string
  moduleIdentityTitle: string
  moduleIdentityBadge: string
  navItems: WorldModuleNavItem[]
  actionLabel: string
  actionIcon: string
  showAction: boolean
  onAction?: () => void
}>()

const route = useRoute()

function handleAction() {
  props.onAction?.()
}
</script>

<template>
  <div class="d-flex flex-column ga-3">
    <NuxtLink
      :to="modulePath"
      class="module-identity d-flex align-center ga-3 text-decoration-none"
    >
      <v-avatar size="56" rounded="xl">
        <v-img
          :src="
            moduleIdentityPhoto ||
            '/images/placeholders/platform-media-fallback.svg'
          "
          :alt="moduleIdentityTitle"
          cover
        />
      </v-avatar>
      <div>
        <h3 class="text-subtitle-1 text-high-emphasis mb-1">
          {{ moduleIdentityTitle }}
        </h3>
        <v-chip size="small" color="primary" variant="tonal" label>
          {{ moduleIdentityBadge }}
        </v-chip>
      </div>
    </NuxtLink>
    <v-btn
      v-if="showAction"
      color="primary"
      variant="tonal"
      :prepend-icon="actionIcon"
      block
      @click="handleAction"
    >
      {{ actionLabel }}
    </v-btn>
    <v-list nav density="compact" rounded="xl" class="bg-transparent">
      <v-list-item
        v-for="item in navItems"
        :key="item.to"
        :title="item.title"
        :prepend-icon="item.icon"
        :to="item.to"
        :active="route.path === item.to || route.path.startsWith(`${item.to}/`)"
        rounded="lg"
        color="primary"
      />
    </v-list>
  </div>
</template>
