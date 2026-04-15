<script setup lang="ts">
definePageMeta({ title: 'Shop Products' })

const shopNavItems = [
  {
    title: 'Overview Shop',
    to: '/world/shop',
    icon: 'mdi-view-dashboard-outline',
  },
  {
    title: 'Categories',
    to: '/world/shop/categories',
    icon: 'mdi-shape-outline',
  },
  {
    title: 'Products',
    to: '/world/shop/products',
    icon: 'mdi-package-variant-closed',
  },
  { title: 'Checkout', to: '/world/shop/checkout', icon: 'mdi-cart-outline' },
  {
    title: 'Payment',
    to: '/world/shop/payment',
    icon: 'mdi-credit-card-outline',
  },
  {
    title: 'Orders',
    to: '/world/shop/orders',
    icon: 'mdi-receipt-text-outline',
  },
  {
    title: 'Admin',
    to: '/world/shop/admin',
    icon: 'mdi-shield-crown-outline',
    rootOnly: true,
  },
]

const rows = [
  {
    id: 'prd-premium-hoodie',
    name: 'Premium Hoodie',
    sku: 'BW-HOOD-BASE',
    variants: '2 variants (M/Black, L/Navy)',
    categories: 'Apparel > Hoodies',
    facets: 'brand:bro-world · material:cotton',
    images: 2,
    seo: 'Ready',
    status: 'Active',
  },
  {
    id: 'prd-desk-kit',
    name: 'Desk Setup Kit',
    sku: 'BW-DSK-BASE',
    variants: '3 variants (S/M/L · Walnut)',
    categories: 'Workspace',
    facets: 'brand:atelier · color:walnut',
    images: 3,
    seo: 'In progress',
    status: 'Draft',
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
      action-label="Create product"
    />

    <v-container fluid>
      <WorldFeatureScaffold
        title="Shop - Products"
        subtitle="Catalogue produit avancé: variantes taille/couleur, attributs, SKU uniques, galerie d'images et champs SEO."
        form-title="Create / Update product"
        form-description="Renseigne les informations produit, variantes, médias et SEO pour publication e-commerce."
        :fields="[
          { key: 'name', label: 'Product name', type: 'text' },
          { key: 'slug', label: 'Slug', type: 'text' },
          { key: 'baseSku', label: 'Base SKU (unique)', type: 'text' },
          {
            key: 'status',
            label: 'Status',
            type: 'select',
            options: [
              { title: 'Draft', value: 'draft' },
              { title: 'Active', value: 'active' },
              { title: 'Archived', value: 'archived' },
            ],
          },
          {
            key: 'categoryIds',
            label: 'Categories (hierarchy ids)',
            type: 'text',
          },
          {
            key: 'attributes',
            label: 'Attributes JSON (brand/material/fit...)',
            type: 'textarea',
          },
          {
            key: 'variants',
            label: 'Variants JSON (size/color/sku/price/stock)',
            type: 'textarea',
          },
          {
            key: 'images',
            label: 'Image URLs (comma separated)',
            type: 'textarea',
          },
          { key: 'metaTitle', label: 'SEO meta title', type: 'text' },
          {
            key: 'metaDescription',
            label: 'SEO meta description',
            type: 'textarea',
          },
          { key: 'keywords', label: 'SEO keywords', type: 'text' },
          { key: 'canonicalUrl', label: 'SEO canonical URL', type: 'text' },
        ]"
        :headers="[
          { title: 'ID', key: 'id' },
          { title: 'Name', key: 'name' },
          { title: 'Base SKU', key: 'sku' },
          { title: 'Variants', key: 'variants' },
          { title: 'Categories', key: 'categories' },
          { title: 'Facet values', key: 'facets' },
          { title: 'Images', key: 'images' },
          { title: 'SEO', key: 'seo' },
          { title: 'Status', key: 'status' },
        ]"
        :rows="rows"
        create-label="Save product"
      />
    </v-container>
  </div>
</template>
