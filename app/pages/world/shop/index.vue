<script setup lang="ts">
import type { SessionUser } from '~/types/session'

definePageMeta({ title: 'Shop' })

const { t } = useI18n()
const { user } = useUserSession()
const sessionUser = computed(() => user.value as SessionUser | null)
const isRoot = computed(
  () => sessionUser.value?.roles?.includes('ROLE_ROOT') ?? false,
)

const shopNavItems = computed(() => [
  {
    title: t('world.shop.nav.overview', 'Overview Shop'),
    to: '/world/shop',
    icon: 'mdi-view-dashboard-outline',
  },
  {
    title: t('world.shop.nav.categories', 'Categories'),
    to: '/world/shop/categories',
    icon: 'mdi-shape-outline',
  },
  {
    title: t('world.shop.nav.products', 'Products'),
    to: '/world/shop/products',
    icon: 'mdi-package-variant-closed',
  },
  {
    title: t('world.shop.nav.checkout', 'Checkout'),
    to: '/world/shop/checkout',
    icon: 'mdi-cart-outline',
  },
  {
    title: t('world.shop.nav.payment', 'Payment'),
    to: '/world/shop/payment',
    icon: 'mdi-credit-card-outline',
  },
  {
    title: t('world.shop.nav.orders', 'Orders'),
    to: '/world/shop/orders',
    icon: 'mdi-receipt-text-outline',
  },
  ...(isRoot.value
    ? [
        {
          title: t('world.shop.nav.admin', 'Admin'),
          to: '/world/shop/admin',
          icon: 'mdi-shield-crown-outline',
          rootOnly: true,
        },
      ]
    : []),
])

const rows = [
  {
    id: 'S-1201',
    product: 'Premium Hoodie',
    category: 'Apparel',
    stock: 148,
    status: 'Active',
  },
  {
    id: 'S-1202',
    product: 'Starter Kit',
    category: 'Bundles',
    stock: 46,
    status: 'Low stock',
  },
  {
    id: 'S-1203',
    product: 'Gift Card',
    category: 'Digital',
    stock: 999,
    status: 'Active',
  },
]
</script>

<template>
  <div>
    <WorldModuleDrawers
      :module-title="t('world.shop.label', 'Shop')"
      module-icon="mdi-storefront-outline"
      :module-description="
        t(
          'world.shop.moduleDescription',
          'Catalogue, pricing, checkout, paiement et fulfillment.',
        )
      "
      :nav-items="shopNavItems"
      :action-label="t('world.shop.actions.createProduct', 'Create product')"
      action-icon="mdi-package-variant-plus"
    />

    <v-container fluid>
      <v-row class="mb-4">
        <v-col cols="12" md="3"
          ><v-card class="pa-3 postcard-gradient-card" rounded="xl"
            ><p class="text-caption mb-1">
              {{ t('world.shop.kpis.revenue30d', 'Revenue (30d)') }}
            </p>
            <h3 class="text-h5">$86,450</h3></v-card
          ></v-col
        >
        <v-col cols="12" md="3"
          ><v-card class="pa-3 postcard-gradient-card" rounded="xl"
            ><p class="text-caption mb-1">
              {{ t('world.shop.kpis.ordersPending', 'Orders pending') }}
            </p>
            <h3 class="text-h5">34</h3></v-card
          ></v-col
        >
        <v-col cols="12" md="3"
          ><v-card class="pa-3 postcard-gradient-card" rounded="xl"
            ><p class="text-caption mb-1">
              {{ t('world.shop.kpis.conversionRate', 'Conversion rate') }}
            </p>
            <h3 class="text-h5">4.8%</h3></v-card
          ></v-col
        >
        <v-col cols="12" md="3"
          ><v-card class="pa-3 postcard-gradient-card" rounded="xl"
            ><p class="text-caption mb-1">
              {{ t('world.shop.kpis.abandonedCarts', 'Abandoned carts') }}
            </p>
            <h3 class="text-h5">129</h3></v-card
          ></v-col
        >
      </v-row>

      <WorldFeatureScaffold
        :title="t('world.shop.home.title', 'Shop Operations')"
        :subtitle="
          t(
            'world.shop.home.subtitle',
            'Interface e-commerce complète inspirée des vrais back-offices marchands.',
          )
        "
        :form-title="t('world.shop.home.formTitle', 'Add product')"
        :form-description="
          t(
            'world.shop.home.formDescription',
            'Crée un produit avec prix, stock, catégorie et stratégie de vente.',
          )
        "
        :fields="[
          {
            key: 'name',
            label: t('world.shop.form.productName', 'Product name'),
            type: 'text',
          },
          { key: 'sku', label: t('world.shop.form.sku', 'SKU'), type: 'text' },
          {
            key: 'category',
            label: t('world.shop.form.category', 'Category'),
            type: 'select',
            options: [
              {
                title: t('world.shop.categories.apparel', 'Apparel'),
                value: 'apparel',
              },
              {
                title: t('world.shop.categories.bundles', 'Bundles'),
                value: 'bundles',
              },
              {
                title: t('world.shop.categories.digital', 'Digital'),
                value: 'digital',
              },
            ],
          },
          {
            key: 'price',
            label: t('world.shop.form.price', 'Price'),
            type: 'number',
          },
          {
            key: 'inventory',
            label: t('world.shop.form.stock', 'Stock'),
            type: 'number',
          },
          {
            key: 'description',
            label: t('world.shop.form.description', 'Description'),
            type: 'textarea',
          },
        ]"
        :headers="[
          { title: t('world.common.table.id', 'ID'), key: 'id' },
          { title: t('world.shop.table.product', 'Product'), key: 'product' },
          {
            title: t('world.shop.table.category', 'Category'),
            key: 'category',
          },
          { title: t('world.shop.table.stock', 'Stock'), key: 'stock' },
          { title: t('world.shop.table.status', 'Status'), key: 'status' },
        ]"
        :rows="rows"
        :create-label="
          t('world.shop.actions.publishProduct', 'Publish product')
        "
      />
    </v-container>
  </div>
</template>
