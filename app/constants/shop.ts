const SHOP_ID_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9_-]{1,63}$/

type RuntimePublicConfigLike = {
  shop?: {
    globalShopId?: string
  }
}

export function resolveGlobalShopId(
  runtimePublicConfig?: RuntimePublicConfigLike,
) {
  const configuredShopId = runtimePublicConfig?.shop?.globalShopId
  if (
    typeof configuredShopId === 'string' &&
    configuredShopId.trim().length > 0
  ) {
    return configuredShopId.trim()
  }

  return null
}

export function isValidShopId(shopId: unknown): shopId is string {
  return typeof shopId === 'string' && SHOP_ID_PATTERN.test(shopId.trim())
}
