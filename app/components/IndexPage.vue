<script setup lang="ts">
const route = useRoute()
const { t } = useI18n()

const items = computed(() =>
  route.matched
    ?.filter((v) => v.path === route.path)[0]
    ?.children.filter((c) => c.path)
    .toSorted(
      (a, b) => (a.meta?.drawerIndex ?? 99) - (b.meta?.drawerIndex ?? 98),
    )
    .map((c) => ({
      title: typeof c.meta?.title === 'string' ? t(c.meta.title) : '',
      to: c.name ? c : `${route.path}/${c.path}`,
      prependIcon: c.meta?.icon,
      subtitle: typeof c.meta?.subtitle === 'string' ? t(c.meta.subtitle) : '',
    })),
)
</script>

<template>
  <v-container>
    <v-row>
      <v-col>
        <v-card v-for="item in items" :key="item.title" class="mb-1">
          <v-list-item
            v-bind="item"
            append-icon="mdi-chevron-right"
            :ripple="false"
            class="py-4"
          />
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
