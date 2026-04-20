<script setup lang="ts">
const { t } = useI18n()
const { shopNavItems } = useShopNavItems()
</script>

<template>
  <div>
    <WorldModuleDrawers
      :module-title="t('world.shop.label')"
      module-key="shop"
      module-path="/world/shop"
      module-icon="mdi-storefront-outline"
      :module-description="t('world.shop.moduleDescription')"
      :nav-items="shopNavItems"
      :action-label="t('world.shop.actions.createProduct')"
      action-icon="mdi-package-variant-plus"
    />
    <NuxtPage />
  </div>
</template>
