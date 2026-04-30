<script setup lang="ts">
import { mergeProps } from 'vue'
import { useStorage } from '@vueuse/core'

const { t } = useI18n()
const { mobile } = useDisplay()

const theme = useTheme()
const vision = useStorage('color-scheme', 'dark')
const primary = useStorage('theme-primary', '#29aeff')
const primaryGradient = useStorage('theme-primary-gradient', '#3bc0ff')
const rounded = useStorage('theme-rounded', 'md')
const shadow = useStorage('theme-shadow', 'none')

if (import.meta.client) {
  watchEffect(() => {
    document.documentElement.dataset.appRounded = rounded.value
    document.documentElement.dataset.appShadow = shadow.value
  })
}

const roundedOptions = computed(() => [
  { title: t('appbar.rounded.none'), value: 'none' },
  { title: t('appbar.rounded.soft'), value: 'sm' },
  { title: t('appbar.rounded.default'), value: 'md' },
  { title: t('appbar.rounded.large'), value: 'lg' },
])

const shadowOptions = computed(() => [
  { title: t('appbar.shadow.flat'), value: 'none' },
  { title: t('appbar.shadow.soft'), value: 'soft' },
  { title: t('appbar.shadow.default'), value: 'medium' },
  { title: t('appbar.shadow.strong'), value: 'strong' },
])

function clampChannel(value: number) {
  return Math.max(0, Math.min(255, Math.round(value)))
}

function shiftHexColor(hex: string, shift: number) {
  const normalized = hex.replace('#', '')
  if (normalized.length !== 6) return hex

  const channels = [
    Number.parseInt(normalized.slice(0, 2), 16),
    Number.parseInt(normalized.slice(2, 4), 16),
    Number.parseInt(normalized.slice(4, 6), 16),
  ]

  if (channels.some((channel) => Number.isNaN(channel))) {
    return hex
  }

  return `#${channels
    .map((channel) =>
      clampChannel(channel + shift)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`
}

function toHexColor(value: string) {
  if (!value.startsWith('rgb')) return value
  const [r = 0, g = 0, b = 0] = value
    .replace(/rgba?\(/, '')
    .replace(')', '')
    .split(',')
    .map((chunk) => Number.parseInt(chunk.trim(), 10))
  return `#${[r, g, b]
    .map((channel) =>
      Math.max(0, Math.min(255, channel)).toString(16).padStart(2, '0'),
    )
    .join('')}`
}

function applyPrimaryColor(value: string) {
  const next = toHexColor(value)
  const nextGradient = shiftHexColor(next, 18)

  primary.value = next
  primaryGradient.value = nextGradient

  if (theme.themes.value.light?.colors) {
    Object.assign(theme.themes.value.light.colors, {
      primary: next,
      'primary-gradient': nextGradient,
    })
  }
  if (theme.themes.value.dark?.colors) {
    Object.assign(theme.themes.value.dark.colors, {
      primary: next,
      'primary-gradient': nextGradient,
    })
  }
  Object.assign(theme.global.current.value.colors, {
    primary: next,
    'primary-gradient': nextGradient,
  })

  if (import.meta.client) {
    document.documentElement.style.setProperty('--color-primary', next)
    document.documentElement.style.setProperty(
      '--color-primary-gradient',
      nextGradient,
    )
  }
}

watch(primary, (value) => applyPrimaryColor(value), { immediate: true })

watch(
  vision,
  (value) => {
    theme.change(value === 'light' ? 'light' : 'dark')
  },
  { immediate: true },
)

const color = computed({
  get() {
    return primary.value
  },
  set(val: string) {
    applyPrimaryColor(val)
  },
})

const colors = [
  ['#29aeff', '#ff9800'],
  ['#4CAF50', '#FF5252'],
  ['#9C27b0', '#E91E63'],
  ['#304156', '#3f51b5'],
  ['#002FA7', '#492d22'],
]

const menuShow = ref(false)
</script>

<template>
  <v-menu
    v-model="menuShow"
    :close-on-content-click="false"
    location="top"
    offset="15"
  >
    <template #activator="{ props: menu }">
      <div class="settings-fab-wrap">
        <div v-if="!mobile" class="settings-fab">
          <v-tooltip
            location="top"
            :aria-label="t('appbar.themePalette')"
            :text="t('appbar.themePalette')"
            :content-props="{ 'aria-label': t('appbar.themePalette') }"
          >
            <template #activator="{ props: tooltip }">
              <v-btn
                icon="mdi-cog"
                size="48"
                color="primary"
                variant="tonal"
                :aria-label="t('appbar.themePalette')"
                v-bind="mergeProps(menu, tooltip)"
              />
            </template>
          </v-tooltip>
        </div>
      </div>
    </template>

    <v-card width="360">
      <v-card-text>
        <v-label class="mb-2 d-block text-center">{{
          t('appbar.themePalette')
        }}</v-label>

        <v-color-picker
          v-model="color"
          show-swatches
          elevation="0"
          width="320"
          mode="rgb"
          :modes="['rgb', 'hex', 'hsl']"
          :swatches="colors"
        />

        <v-label class="mb-2 d-block text-center">{{
          t('appbar.rounded.label')
        }}</v-label>
        <div class="d-flex justify-center mb-4">
          <v-btn-toggle
            v-model="rounded"
            mandatory
            density="compact"
            class="settings-toggle"
            divided
          >
            <v-btn
              v-for="option in roundedOptions"
              :key="option.value"
              :value="option.value"
              variant="text"
            >
              {{ option.title }}
            </v-btn>
          </v-btn-toggle>
        </div>

        <v-label class="mb-2 d-block text-center">{{
          t('appbar.shadow.label')
        }}</v-label>
        <div class="d-flex justify-center">
          <v-btn-toggle
            v-model="shadow"
            mandatory
            density="compact"
            class="settings-toggle"
            divided
          >
            <v-btn
              v-for="option in shadowOptions"
              :key="option.value"
              :value="option.value"
              variant="text"
            >
              {{ option.title }}
            </v-btn>
          </v-btn-toggle>
        </div>
      </v-card-text>
    </v-card>
  </v-menu>
</template>

<style scoped>
.settings-fab {
  z-index: 1301;
  display: inline-flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-end;
}

.settings-fab-wrap {
  position: fixed;
  right: 16px;
  left: 16px;
  bottom: 16px;
  z-index: 1300;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  pointer-events: none;
}

.settings-fab-wrap > * {
  pointer-events: auto;
}

.settings-toggle {
  flex-wrap: wrap;
  justify-content: center;
}

.settings-toggle :deep(.v-btn) {
  text-transform: none;
}
</style>
