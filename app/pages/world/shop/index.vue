<script setup lang="ts">
import type { SessionUser } from '~/types/session'

definePageMeta({ title: 'Shop' })

const { user } = useUserSession()
const sessionUser = computed(() => user.value as SessionUser | null)
const isRoot = computed(() => sessionUser.value?.roles?.includes('ROLE_ROOT') ?? false)

const shopNavItems = computed(() => [
  { title: 'Overview Shop', to: '/world/shop', icon: 'mdi-view-dashboard-outline' },
  { title: 'Categories', to: '/world/shop/categories', icon: 'mdi-shape-outline' },
  { title: 'Products', to: '/world/shop/products', icon: 'mdi-package-variant-closed' },
  { title: 'Checkout', to: '/world/shop/checkout', icon: 'mdi-cart-outline' },
  { title: 'Payment', to: '/world/shop/payment', icon: 'mdi-credit-card-outline' },
  { title: 'Orders', to: '/world/shop/orders', icon: 'mdi-receipt-text-outline' },
  ...(isRoot.value
    ? [{ title: 'Admin', to: '/world/shop/admin', icon: 'mdi-shield-crown-outline', rootOnly: true }]
    : []),
])

const rows = [
  { id: 'S-1201', product: 'Premium Hoodie', category: 'Apparel', stock: 148, status: 'Active' },
  { id: 'S-1202', product: 'Starter Kit', category: 'Bundles', stock: 46, status: 'Low stock' },
  { id: 'S-1203', product: 'Gift Card', category: 'Digital', stock: 999, status: 'Active' },
]
</script>

<template>
  <div>
    <WorldModuleDrawers
      module-title="Shop"
      module-icon="mdi-storefront-outline"
      module-description="Catalogue, pricing, checkout, paiement et fulfillment."
      :nav-items="shopNavItems"
      action-label="Create product"
      action-icon="mdi-package-variant-plus"
    />

    <v-container fluid class="pt-0">
      <v-row class="mb-4">
        <v-col cols="12" md="3"><v-card class="pa-3 postcard-gradient-card" rounded="xl"><p class="text-caption mb-1">Revenue (30d)</p><h3 class="text-h5">$86,450</h3></v-card></v-col>
        <v-col cols="12" md="3"><v-card class="pa-3 postcard-gradient-card" rounded="xl"><p class="text-caption mb-1">Orders pending</p><h3 class="text-h5">34</h3></v-card></v-col>
        <v-col cols="12" md="3"><v-card class="pa-3 postcard-gradient-card" rounded="xl"><p class="text-caption mb-1">Conversion rate</p><h3 class="text-h5">4.8%</h3></v-card></v-col>
        <v-col cols="12" md="3"><v-card class="pa-3 postcard-gradient-card" rounded="xl"><p class="text-caption mb-1">Abandoned carts</p><h3 class="text-h5">129</h3></v-card></v-col>
      </v-row>

      <WorldFeatureScaffold
        title="Shop Operations"
        subtitle="Interface e-commerce complète inspirée des vrais back-offices marchands."
        form-title="Add product"
        form-description="Crée un produit avec prix, stock, catégorie et stratégie de vente."
        :fields="[
          { key: 'name', label: 'Product name', type: 'text' },
          { key: 'sku', label: 'SKU', type: 'text' },
          { key: 'category', label: 'Category', type: 'select', options: [
            { title: 'Apparel', value: 'apparel' },
            { title: 'Bundles', value: 'bundles' },
            { title: 'Digital', value: 'digital' },
          ] },
          { key: 'price', label: 'Price', type: 'number' },
          { key: 'inventory', label: 'Stock', type: 'number' },
          { key: 'description', label: 'Description', type: 'textarea' },
        ]"
        :headers="[
          { title: 'ID', key: 'id' },
          { title: 'Product', key: 'product' },
          { title: 'Category', key: 'category' },
          { title: 'Stock', key: 'stock' },
          { title: 'Status', key: 'status' },
        ]"
        :rows="rows"
        create-label="Publish product"
      />
    </v-container>
  </div>
</template>
