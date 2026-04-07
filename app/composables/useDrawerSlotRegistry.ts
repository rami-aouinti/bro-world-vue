import type { InjectionKey, ShallowRef, VNode } from 'vue'

export type DrawerSlotRenderer = (() => VNode[] | undefined) | null

type DrawerSlotRegistry = {
  left: ShallowRef<DrawerSlotRenderer>
  right: ShallowRef<DrawerSlotRenderer>
  setLeft: (renderer: DrawerSlotRenderer) => void
  setRight: (renderer: DrawerSlotRenderer) => void
}

const DRAWER_SLOT_REGISTRY_KEY: InjectionKey<DrawerSlotRegistry> = Symbol(
  'drawer-slot-registry',
)

export function provideDrawerSlotRegistry() {
  const left = shallowRef<DrawerSlotRenderer>(null)
  const right = shallowRef<DrawerSlotRenderer>(null)

  const registry: DrawerSlotRegistry = {
    left,
    right,
    setLeft(renderer) {
      left.value = renderer
    },
    setRight(renderer) {
      right.value = renderer
    },
  }

  provide(DRAWER_SLOT_REGISTRY_KEY, registry)

  return registry
}

export function useDrawerSlotRegistry() {
  return inject(DRAWER_SLOT_REGISTRY_KEY, null)
}
