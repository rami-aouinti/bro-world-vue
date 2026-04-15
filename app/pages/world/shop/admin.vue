<script setup lang="ts">
import type { SessionUser } from '~/types/session'

definePageMeta({ title: 'Shop Admin' })

const { user } = useUserSession()
const sessionUser = computed(() => user.value as SessionUser | null)
const isRoot = computed(
  () => sessionUser.value?.roles?.includes('ROLE_ROOT') ?? false,
)

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
</script>

<template>
  <div>
    <WorldModuleDrawers
      module-title="Shop"
      module-icon="mdi-storefront-outline"
      module-description="Navigation complète du module Shop."
      :nav-items="shopNavItems"
      action-label="Publish shop policy"
      action-icon="mdi-shield-check-outline"
    />

    <v-container fluid>
      <v-card rounded="xl" class="pa-5 postcard-gradient-card">
        <template v-if="isRoot">
          <h2 class="text-h5 mb-2">Shop Admin Center</h2>
          <p class="text-medium-emphasis mb-4">
            Configure taxes, payment providers and order governance.
          </p>
          <v-row>
            <v-col cols="12" md="6">
              <v-select
                label="Default currency"
                variant="outlined"
                :items="['USD', 'EUR', 'GBP']"
              />
              <v-select
                label="Primary payment provider"
                variant="outlined"
                :items="['Stripe', 'PayPal', 'Adyen']"
              />
              <v-switch label="Enable fraud review" color="primary" inset />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                label="Tax rate (%)"
                type="number"
                variant="outlined"
              />
              <v-text-field
                label="Refund window (days)"
                type="number"
                variant="outlined"
              />
              <v-btn
                color="primary"
                prepend-icon="mdi-content-save-outline"
                block
                >Save Shop settings</v-btn
              >
            </v-col>
          </v-row>
        </template>
        <p v-else class="text-error mb-0">
          Access denied. This page requires ROLE_ROOT.
        </p>
      </v-card>
    </v-container>
  </div>
</template>
