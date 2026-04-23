<script setup lang="ts">
const SHOP_BASE_PATH = '/world/shop' as const

definePageMeta({
  layout: 'shop',
  title: 'world.shop.label',
  description: 'world.shop.seo.metaDescription',
})

const { t } = useI18n()
const runtimeConfig = useRuntimeConfig()
const siteUrl = runtimeConfig.public.siteUrl || 'https://bro-world-space.com'
const pageUrl = new URL(SHOP_BASE_PATH, siteUrl).toString()
const seoImage = new URL('/img/platform/general/shop.png', siteUrl).toString()
const { shopNavItems } = useShopNavItems()

useSeoMeta({
  title: t('world.shop.seo.title'),
  description: t('world.shop.seo.description'),
  keywords: t('world.shop.seo.keywords'),
  robots: 'index, follow, max-image-preview:large',
  ogTitle: t('world.shop.seo.ogTitle'),
  ogDescription: t('world.shop.seo.ogDescription'),
  ogType: 'website',
  ogUrl: pageUrl,
  ogImage: seoImage,
  ogImageAlt: 'Bro World Shop catalogue',
  twitterTitle: t('world.shop.seo.twitterTitle'),
  twitterDescription: t('world.shop.seo.twitterDescription'),
  twitterImage: seoImage,
  twitterCard: 'summary_large_image',
})

const quickAccessLinks = computed(() => [
  {
    label: t('world.shop.documentation.navigation.products'),
    to: '/world/shop/products',
  },
  {
    label: t('world.shop.documentation.navigation.orders'),
    to: '/world/shop/orders',
  },
  {
    label: t('world.shop.documentation.navigation.checkout'),
    to: '/world/shop/checkout',
  },
])

const documentationSections = computed(() => [
  {
    key: 'products',
    to: '/world/shop/products',
    title: t('world.shop.documentation.sections.products.title'),
    description: t('world.shop.documentation.sections.products.description'),
  },
  {
    key: 'orders',
    to: '/world/shop/orders',
    title: t('world.shop.documentation.sections.orders.title'),
    description: t('world.shop.documentation.sections.orders.description'),
  },
  {
    key: 'payments',
    to: '/world/shop/payment',
    title: t('world.shop.documentation.sections.payments.title'),
    description: t('world.shop.documentation.sections.payments.description'),
  },
])

const referenceCards = computed(() => [
  {
    title: t('world.shop.nav.products'),
    description: t('world.shop.references.descriptions.products'),
    to: '/world/shop/products',
    icon: 'mdi-package-variant-closed',
  },
  {
    title: t('world.shop.nav.orders'),
    description: t('world.shop.references.descriptions.orders'),
    to: '/world/shop/orders',
    icon: 'mdi-receipt-text-outline',
  },
])
</script>

<template>
  <div>
    <WorldModuleDrawers
      :module-title="t('world.shop.label')"
      :module-path="SHOP_BASE_PATH"
      module-icon="mdi-storefront-outline"
      :module-description="t('world.shop.moduleDescription')"
      :nav-items="shopNavItems"
      :action-label="t('world.shop.actions.checkout')"
    >
      <template #right>
        <div class="d-flex flex-column ga-4">
          <v-card rounded="xl" variant="tonal" color="primary">
            <div class="pa-4 d-flex ga-3">
              <v-avatar size="56" rounded="xl" color="primary" variant="tonal">
                <v-icon icon="mdi-storefront-outline" size="28" />
              </v-avatar>
              <div class="flex-grow-1">
                <div class="text-subtitle-2 font-weight-bold mb-1">
                  {{ t('world.shop.label') }}
                </div>
                <div class="text-body-2 text-medium-emphasis">
                  {{ t('world.shop.moduleDescription') }}
                </div>
              </div>
            </div>
          </v-card>

          <v-card variant="tonal" color="primary" class="pa-4">
            <div class="text-subtitle-2 font-weight-bold mb-2">
              {{ t('world.shop.documentation.labels.platformSummaryTitle') }}
            </div>
            <div class="d-flex flex-wrap ga-2">
              <v-chip color="primary" variant="tonal" label>
                124 {{ t('world.shop.kpis.ordersPending') }}
              </v-chip>
              <v-chip color="info" variant="tonal" label>
                8.4% {{ t('world.shop.kpis.conversionRate') }}
              </v-chip>
              <v-chip color="success" variant="tonal" label>
                14 {{ t('world.shop.kpis.abandonedCarts') }}
              </v-chip>
            </div>
          </v-card>

          <v-card variant="tonal" color="primary" class="pa-4">
            <div class="text-subtitle-2 font-weight-bold mb-2">
              {{ t('world.shop.documentation.labels.quickActionsTitle') }}
            </div>
            <div class="d-flex flex-wrap ga-2">
              <v-chip
                v-for="link in quickAccessLinks"
                :key="link.to"
                color="primary"
                variant="tonal"
                label
                :to="link.to"
              >
                {{ link.label }}
              </v-chip>
            </div>
          </v-card>
        </div>
      </template>
    </WorldModuleDrawers>

    <v-container fluid>
      <v-row>
        <v-col cols="12">
          <v-card
            rounded="xl"
            class="pa-6 postcard-gradient-card shop-doc-hero"
          >
            <div
              class="d-flex align-center justify-space-between ga-3 flex-wrap"
            >
              <div>
                <h1 class="text-h5 font-weight-bold mb-2">
                  {{ t('world.shop.documentation.heroTitle') }}
                </h1>
                <p class="text-body-1 mb-0">
                  {{ t('world.shop.documentation.heroDescription') }}
                </p>
              </div>
              <v-btn
                color="primary"
                prepend-icon="mdi-store-search-outline"
                to="/world/shop/products"
              >
                {{ t('world.shop.documentation.cta.hero') }}
              </v-btn>
            </div>
          </v-card>
        </v-col>

        <v-col cols="12">
          <v-card
            rounded="xl"
            class="pa-5 postcard-gradient-card shop-doc-card"
          >
            <v-row density="comfortable">
              <v-col
                v-for="section in documentationSections"
                :key="section.key"
                cols="12"
                md="4"
              >
                <v-card rounded="xl" variant="outlined" class="pa-4 h-100">
                  <h2 class="text-subtitle-1 font-weight-bold mb-2">
                    {{ section.title }}
                  </h2>
                  <p class="text-body-2 text-medium-emphasis mb-4">
                    {{ section.description }}
                  </p>
                  <v-btn
                    color="primary"
                    variant="tonal"
                    append-icon="mdi-arrow-right"
                    :to="section.to"
                  >
                    {{
                      t('world.shop.documentation.cta.openSection', {
                        section: section.title,
                      })
                    }}
                  </v-btn>
                </v-card>
              </v-col>
            </v-row>
          </v-card>
        </v-col>

        <v-col cols="12">
          <v-card
            rounded="xl"
            class="pa-5 postcard-gradient-card shop-doc-card"
          >
            <div class="d-flex align-center ga-2 mb-3">
              <v-icon
                icon="mdi-book-open-page-variant-outline"
                color="primary"
              />
              <h2 class="text-h6 mb-0">
                {{ t('world.shop.references.title') }}
              </h2>
            </div>
            <p class="text-body-2 text-medium-emphasis mb-4">
              {{ t('world.shop.references.subtitle') }}
            </p>

            <v-row density="comfortable">
              <v-col
                v-for="reference in referenceCards"
                :key="reference.to"
                cols="12"
                md="6"
              >
                <v-card rounded="xl" variant="outlined" class="pa-4 h-100">
                  <div class="d-flex align-center ga-2 mb-2">
                    <v-icon :icon="reference.icon" color="primary" />
                    <h3 class="text-subtitle-1 mb-0">{{ reference.title }}</h3>
                  </div>

                  <p class="text-body-2 text-medium-emphasis mb-4">
                    {{ reference.description }}
                  </p>

                  <v-btn
                    color="primary"
                    variant="tonal"
                    append-icon="mdi-arrow-right"
                    :to="reference.to"
                  >
                    {{ t('world.shop.references.cta') }}
                  </v-btn>
                </v-card>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<style scoped>
.shop-doc-hero {
  position: relative;
  overflow: hidden;
}

.shop-doc-hero::after {
  content: '';
  position: absolute;
  width: 320px;
  height: 320px;
  top: -140px;
  right: -110px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(var(--v-theme-primary), 0.2) 0%,
    transparent 70%
  );
  animation: shopGlow 8s ease-in-out infinite;
}

.shop-doc-card {
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  animation: shopCardIn 0.45s ease both;
}

.shop-doc-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 14px 32px rgba(15, 23, 42, 0.12);
}

@keyframes shopGlow {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.08);
    opacity: 0.45;
  }
}

@keyframes shopCardIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
