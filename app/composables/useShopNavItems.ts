type ShopNavItem = {
  title: string
  to: string
  icon: string
  rootOnly?: boolean
}

export function useShopNavItems() {
  const { t } = useI18n()

  const shopNavItems = computed<ShopNavItem[]>(() => [
    {
      title: t('world.shop.nav.orders', 'Orders'),
      to: '/world/shop/orders',
      icon: 'mdi-receipt-text-outline',
    },
    {
      title: t('world.shop.nav.admin', 'Admin'),
      to: '/world/shop/admin',
      icon: 'mdi-shield-crown-outline',
      rootOnly: true,
    },
  ])

  return {
    shopNavItems,
  }
}
