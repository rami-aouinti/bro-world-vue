<script setup lang="ts">
const showLeftDrawer = useState('show-left-drawer', () => true)
const showRightDrawer = useState('show-right-drawer', () => true)
const route = useRoute()
const { t } = useI18n()

function getMetaTitle(title: unknown) {
  if (typeof title !== 'string') return ''
  return t(title)
}

const breadcrumbs = computed(() => {
  return route.matched
    .filter((item) => item.meta?.title)
    .map((r) => ({
      title: getMetaTitle(r.meta.title),
      disabled: r.path === route.path,
      to: r.path,
    }))
})
</script>

<template>
  <v-app>
    <AppBar />
    <AppDrawer v-if="showLeftDrawer" />
    <AppRightDrawer v-if="showRightDrawer" />
    <v-main>
      <v-container class="breadcrumbs-wrapper py-4">
        <v-breadcrumbs :items="breadcrumbs" class="justify-center" />
      </v-container>
      <slot />
    </v-main>
    <AppFooter />
  </v-app>
</template>

<style scoped>
.v-main {
  padding-top: 104px;
  padding-bottom: 56px;
  overflow-y: auto;
  transition-property: padding;
  min-height: 100vh;
}

.breadcrumbs-wrapper {
  display: flex;
  justify-content: center;
}

@media (max-width: 960px) {
  .v-main {
    padding-top: 92px;
    padding-bottom: 52px;
  }
}
</style>
