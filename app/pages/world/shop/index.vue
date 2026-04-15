<script setup lang="ts">
import type { SessionUser } from '~/types/session'

definePageMeta({ title: 'Shop' })

const { user } = useUserSession()
const sessionUser = computed(() => user.value as SessionUser | null)
const isRoot = computed(() => sessionUser.value?.roles?.includes('ROLE_ROOT') ?? false)

const shopItems = computed(() => {
  const base = [
    { title: 'Categories', to: '/world/shop/categories', icon: 'mdi-shape-outline' },
    { title: 'Products', to: '/world/shop/products', icon: 'mdi-package-variant-closed' },
    { title: 'Checkout', to: '/world/shop/checkout', icon: 'mdi-cart-outline' },
    { title: 'Payment', to: '/world/shop/payment', icon: 'mdi-credit-card-outline' },
    { title: 'Orders', to: '/world/shop/orders', icon: 'mdi-receipt-text-outline' },
  ]

  return isRoot.value
    ? [...base, { title: 'Admin', to: '/world/shop/admin', icon: 'mdi-shield-crown-outline' }]
    : base
})
</script>

<template>
  <v-container fluid>
    <v-card rounded="xl" class="pa-3">
      <v-card-title class="text-h5">Shop</v-card-title>
      <v-row class="mt-2">
        <v-col v-for="item in shopItems" :key="item.to" cols="12" sm="6">
          <v-card :to="item.to" rounded="lg" variant="tonal">
            <v-card-item>
              <template #prepend>
                <v-icon :icon="item.icon" class="mr-3" />
              </template>
              <v-card-title>{{ item.title }}</v-card-title>
            </v-card-item>
          </v-card>
        </v-col>
      </v-row>
    </v-card>
  </v-container>
</template>
