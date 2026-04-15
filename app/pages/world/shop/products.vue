<script setup lang="ts">
definePageMeta({ title: 'Shop Products' })

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
  { id: 'SH-01', name: 'Products workflow A', owner: 'Team Alpha', status: 'Active', priority: 'High' },
  { id: 'SH-02', name: 'Products workflow B', owner: 'Team Beta', status: 'Review', priority: 'Medium' },
  { id: 'SH-03', name: 'Products workflow C', owner: 'Team Gamma', status: 'Draft', priority: 'Low' },
]
</script>

<template>
  <div>
    <WorldModuleDrawers
      module-title="Shop"
      module-icon="mdi-storefront-outline"
      module-description="Navigation complète du module Shop."
      :nav-items="shopNavItems"
      action-label="Create Products item"
    />

    <v-container fluid class="pt-0">
      <WorldFeatureScaffold
        title="Shop - Products"
        subtitle="Gestion opérationnelle de products avec formulaires et tableau de suivi."
        form-title="Create Products record"
        form-description="Renseigne les informations métier pour le module products."
        :fields="[
          { key: 'title', label: 'Title', type: 'text' },
          { key: 'owner', label: 'Owner', type: 'text' },
          { key: 'status', label: 'Status', type: 'select', options: [
            { title: 'Draft', value: 'draft' },
            { title: 'Active', value: 'active' },
            { title: 'Archived', value: 'archived' },
          ] },
          { key: 'target', label: 'Target', type: 'number' },
          { key: 'date', label: 'Date', type: 'date' },
          { key: 'notes', label: 'Notes', type: 'textarea' },
        ]"
        :headers="[
          { title: 'ID', key: 'id' },
          { title: 'Name', key: 'name' },
          { title: 'Owner', key: 'owner' },
          { title: 'Status', key: 'status' },
          { title: 'Priority', key: 'priority' },
        ]"
        :rows="rows"
        create-label="Save Products"
      />
    </v-container>
  </div>
</template>
