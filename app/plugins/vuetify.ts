import type { IconProps } from 'vuetify'
import { Icon } from '#components'
import { useStorage } from '@vueuse/core'
import { aliases } from 'vuetify/iconsets/mdi'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('vuetify:configuration', ({ vuetifyOptions }) => {
    vuetifyOptions.icons = {
      defaultSet: 'nuxtIcon',
      sets: {
        nuxtIcon: {
          component: ({ icon, tag, ...rest }: IconProps) =>
            h(tag, rest, [
              h(Icon, { name: (aliases[icon as string] as string) ?? icon }),
            ]),
        },
      },
      aliases,
    }
    const primary = useStorage('theme-primary', '#29aeff').value
    const primaryGradient = useStorage(
      'theme-primary-gradient',
      '#3bc0ff',
    ).value
    const colorScheme = useStorage<'light' | 'dark'>(
      'color-scheme',
      'dark',
    ).value
    const defaultTheme = colorScheme === 'light' ? 'light' : 'dark'

    vuetifyOptions.theme = {
      defaultTheme,
      themes: {
        light: { colors: { primary, 'primary-gradient': primaryGradient } },
        dark: { colors: { primary, 'primary-gradient': primaryGradient } },
      },
    }
    vuetifyOptions.defaults = {
      ...(vuetifyOptions.defaults ?? {}),
      VImg: {
        ...(vuetifyOptions.defaults?.VImg ?? {}),
        alt: '',
      },
      VTextField: {
        ...(vuetifyOptions.defaults?.VTextField ?? {}),
        density: 'compact',
      },
      VSelect: {
        ...(vuetifyOptions.defaults?.VSelect ?? {}),
        density: 'compact',
        class: [
          'app-menu-field',
          (vuetifyOptions.defaults?.VSelect as { class?: string | string[] })
            ?.class,
        ],
        menuProps: {
          contained: true,
          closeOnContentClick: true,
          contentClass: 'app-menu-surface',
          ...(
            vuetifyOptions.defaults?.VSelect as {
              menuProps?: Record<string, unknown>
            }
          )?.menuProps,
        },
      },
      VTextarea: {
        ...(vuetifyOptions.defaults?.VTextarea ?? {}),
        density: 'compact',
      },
      VAutocomplete: {
        ...(vuetifyOptions.defaults?.VAutocomplete ?? {}),
        density: 'compact',
        class: [
          'app-menu-field',
          (
            vuetifyOptions.defaults?.VAutocomplete as {
              class?: string | string[]
            }
          )?.class,
        ],
        menuProps: {
          contained: true,
          closeOnContentClick: true,
          contentClass: 'app-menu-surface',
          ...(
            vuetifyOptions.defaults?.VAutocomplete as {
              menuProps?: Record<string, unknown>
            }
          )?.menuProps,
        },
      },
      VCombobox: {
        ...(vuetifyOptions.defaults?.VCombobox ?? {}),
        density: 'compact',
        class: [
          'app-menu-field',
          (vuetifyOptions.defaults?.VCombobox as { class?: string | string[] })
            ?.class,
        ],
        menuProps: {
          contained: true,
          closeOnContentClick: true,
          contentClass: 'app-menu-surface',
          ...(
            vuetifyOptions.defaults?.VCombobox as {
              menuProps?: Record<string, unknown>
            }
          )?.menuProps,
        },
      },
      VFileInput: {
        ...(vuetifyOptions.defaults?.VFileInput ?? {}),
        density: 'compact',
      },
    }
  })
})
