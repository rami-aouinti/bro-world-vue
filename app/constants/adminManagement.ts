export type AdminSectionKey =
  | 'users'
  | 'user-groups'
  | 'roles'
  | 'api-keys'
  | 'pages'
  | 'configurations'
  | 'platforms'
  | 'plugins'

export type AdminCapability = {
  create: boolean
  update: boolean
  remove: boolean
}

export type AdminSectionConfig = {
  key: AdminSectionKey
  title: string
  navTitle: string
  icon: string
  route: string
  description: string
  primaryField: string
  capabilities: AdminCapability
}

export const PAGE_MANAGEMENT_NAV_ITEMS = [
  { key: 'home', title: 'Home' },
  { key: 'about', title: 'About' },
  { key: 'faq', title: 'Faq' },
  { key: 'contact', title: 'Contact' },
] as const

export type PageManagementNavKey = (typeof PAGE_MANAGEMENT_NAV_ITEMS)[number]['key']

export const ADMIN_SECTIONS: AdminSectionConfig[] = [
  {
    key: 'users',
    title: 'User Management',
    navTitle: 'User Management',
    icon: 'mdi-account-multiple-outline',
    route: '/admin/users',
    description: 'Manage users list, search and CRUD operations.',
    primaryField: 'username',
    capabilities: { create: true, update: true, remove: true },
  },
  {
    key: 'user-groups',
    title: 'User Group Management',
    navTitle: 'User Group Management',
    icon: 'mdi-account-group-outline',
    route: '/admin/user-groups',
    description: 'Manage user groups and memberships.',
    primaryField: 'name',
    capabilities: { create: true, update: true, remove: true },
  },
  {
    key: 'roles',
    title: 'Role Management',
    navTitle: 'Role Management',
    icon: 'mdi-shield-account-outline',
    route: '/admin/roles',
    description: 'Browse available roles and inherited permissions.',
    primaryField: 'role',
    capabilities: { create: false, update: false, remove: false },
  },
  {
    key: 'api-keys',
    title: 'Api Key Management',
    navTitle: 'Api Key Management',
    icon: 'mdi-key-variant',
    route: '/admin/api-keys',
    description: 'Manage API keys available for integrations.',
    primaryField: 'token',
    capabilities: { create: true, update: true, remove: true },
  },
  {
    key: 'pages',
    title: 'Page Management',
    navTitle: 'Page Management',
    icon: 'mdi-file-document-multiple-outline',
    route: '/admin/pages',
    description: 'Manage application pages metadata.',
    primaryField: 'title',
    capabilities: { create: true, update: true, remove: true },
  },
  {
    key: 'configurations',
    title: 'Configuration Management',
    navTitle: 'Configuration Management',
    icon: 'mdi-cog-outline',
    route: '/admin/configurations',
    description: 'Manage application configuration entries.',
    primaryField: 'key',
    capabilities: { create: true, update: true, remove: true },
  },
  {
    key: 'platforms',
    title: 'Platform Management',
    navTitle: 'Platform Management',
    icon: 'mdi-layers-triple-outline',
    route: '/admin/platforms',
    description: 'Manage available platforms and metadata.',
    primaryField: 'name',
    capabilities: { create: true, update: true, remove: true },
  },
  {
    key: 'plugins',
    title: 'Plugin Management',
    navTitle: 'Plugin Management',
    icon: 'mdi-puzzle-outline',
    route: '/admin/plugins',
    description: 'Manage plugin catalog and lifecycle.',
    primaryField: 'name',
    capabilities: { create: true, update: true, remove: true },
  },
]

export const ADMIN_SECTIONS_BY_KEY = Object.fromEntries(
  ADMIN_SECTIONS.map((section) => [section.key, section]),
) as Record<AdminSectionKey, AdminSectionConfig>
