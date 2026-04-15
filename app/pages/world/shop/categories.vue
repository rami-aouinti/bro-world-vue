<script setup lang="ts">
definePageMeta({ title: 'Shop Categories' })

const shopNavItems = [
  { title: 'Overview Shop', to: '/world/shop', icon: 'mdi-view-dashboard-outline' },
  { title: 'Categories', to: '/world/shop/categories', icon: 'mdi-shape-outline' },
  { title: 'Products', to: '/world/shop/products', icon: 'mdi-package-variant-closed' },
  { title: 'Checkout', to: '/world/shop/checkout', icon: 'mdi-cart-outline' },
  { title: 'Payment', to: '/world/shop/payment', icon: 'mdi-credit-card-outline' },
  { title: 'Orders', to: '/world/shop/orders', icon: 'mdi-receipt-text-outline' },
  { title: 'Admin', to: '/world/shop/admin', icon: 'mdi-shield-crown-outline', rootOnly: true },
]

const rows = [
  {
    id: 'cat-apparel',
    name: 'Apparel',
    hierarchy: 'Root',
    facets: 'size, color, price',
    productsCount: 12,
    seo: 'Ready',
    status: 'Active',
  },
  {
    id: 'cat-hoodies',
    name: 'Hoodies',
    hierarchy: 'Apparel > Hoodies',
    facets: 'size, material',
    productsCount: 5,
    seo: 'Ready',
    status: 'Active',
  },
]
</script>

<template>
  <div>
    <WorldModuleDrawers
      module-title="Shop"
      module-icon="mdi-storefront-outline"
      module-description="Navigation complète du module Shop."
      :nav-items="shopNavItems"
      action-label="Create category"
    />

    <v-container fluid class="pt-0">
      <WorldFeatureScaffold
        title="Shop - Categories"
        subtitle="Taxonomie hiérarchique parent/enfant avec filtres facettés, médias et SEO."
        form-title="Create / Update category"
        form-description="Configure la hiérarchie des catégories et les facettes utilisées dans les filtres du catalogue."
        :fields="[
          { key: 'name', label: 'Category name', type: 'text' },
          { key: 'slug', label: 'Slug', type: 'text' },
          { key: 'parentId', label: 'Parent category id (optional)', type: 'text' },
          { key: 'description', label: 'Description', type: 'textarea' },
          { key: 'image', label: 'Category image URL', type: 'text' },
          { key: 'facetDefinitions', label: 'Facet definitions JSON', type: 'textarea' },
          { key: 'metaTitle', label: 'SEO meta title', type: 'text' },
          { key: 'metaDescription', label: 'SEO meta description', type: 'textarea' },
          { key: 'keywords', label: 'SEO keywords', type: 'text' },
          { key: 'canonicalUrl', label: 'SEO canonical URL', type: 'text' },
        ]"
        :headers="[
          { title: 'ID', key: 'id' },
          { title: 'Name', key: 'name' },
          { title: 'Hierarchy', key: 'hierarchy' },
          { title: 'Facets', key: 'facets' },
          { title: 'Products linked', key: 'productsCount' },
          { title: 'SEO', key: 'seo' },
          { title: 'Status', key: 'status' },
        ]"
        :rows="rows"
        create-label="Save category"
      />
    </v-container>
  </div>
</template>
