import type { SessionUser } from './app/types/session'

declare module '#app' {
  interface PageMeta {
    icon?: string
    title?: string
    subtitle?: string
    drawerIndex?: number
    publicPage?: boolean
  }
}

declare module '#auth-utils' {
  interface User extends SessionUser {}
}

export {}
