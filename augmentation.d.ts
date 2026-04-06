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
  interface User {
    login: string
    avatar_url: string
  }
}

export {}
