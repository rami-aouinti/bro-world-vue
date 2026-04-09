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
    const primary = useStorage('theme-primary', '#e91e63').value
    vuetifyOptions.theme = {
      defaultTheme: 'dark',
      themes: {
        light: { colors: { primary } },
        dark: { colors: { primary } },
      },
    }
    vuetifyOptions.defaults = {
      ...(vuetifyOptions.defaults ?? {}),
      VImg: {
        ...(vuetifyOptions.defaults?.VImg ?? {}),
        alt: '',
      },
    }
  })
})
