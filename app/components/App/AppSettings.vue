<script setup lang="ts">
import { mergeProps } from 'vue'
import { useStorage } from '@vueuse/core'

const { t, locale } = useI18n()

const theme = useTheme()
const primary = useStorage('theme-primary', '#1697f6')
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
  { title: t('appbar.rounded.extra'), value: 'xl' },
])

const shadowOptions = computed(() => [
  { title: t('appbar.shadow.flat'), value: 'none' },
  { title: t('appbar.shadow.soft'), value: 'soft' },
  { title: t('appbar.shadow.default'), value: 'medium' },
  { title: t('appbar.shadow.strong'), value: 'strong' },
])

function toHexColor(value: string) {
  if (!value.startsWith('rgb')) return value
  const [r, g, b] = value
    .replace(/rgba?\(/, '')
    .replace(')', '')
    .split(',')
    .map((chunk) => Number.parseInt(chunk.trim(), 10))
  return `#${[r, g, b]
    .map((channel) => Math.max(0, Math.min(255, channel)).toString(16).padStart(2, '0'))
    .join('')}`
}

function applyPrimaryColor(value: string) {
  const next = toHexColor(value)
  primary.value = next
  theme.themes.value.light!.colors.primary = next
  theme.themes.value.dark!.colors.primary = next
  theme.global.current.value.colors.primary = next
}

watch(primary, (value) => applyPrimaryColor(value), { immediate: true })

const color = computed({
  get() {
    return primary.value
  },
  set(val: string) {
    applyPrimaryColor(val)
  },
})

const colors = [
  ['#1697f6', '#ff9800'],
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
    location="top right"
    offset="15"
  >
    <template #activator="{ props: menu }">
      <v-tooltip location="top" :text="t('appbar.themePalette')">
        <template #activator="{ props: tooltip }">
          <v-btn
            icon="mdi-palette-outline"
            v-bind="mergeProps(menu, tooltip)"
            :rounded="0"
          />
        </template>
      </v-tooltip>
    </template>

    <v-card width="360">
      <v-card-text>
        <v-label class="mb-3 d-inline-block">{{ t('appbar.themePalette') }}</v-label>

        <v-color-picker
          v-model="color"
          show-swatches
          elevation="0"
          width="320"
          mode="rgb"
          :modes="['rgb', 'hex', 'hsl']"
          :swatches="colors"
        />

        <v-divider class="my-4" />

        <v-label class="mb-2 d-block text-center">{{ t('appbar.rounded.label') }}</v-label>
        <div class="d-flex justify-center mb-4">
          <v-btn-toggle
            v-model="rounded"
            mandatory
            density="comfortable"
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

        <v-label class="mb-2 d-block text-center">{{ t('appbar.shadow.label') }}</v-label>
        <div class="d-flex justify-center">
          <v-btn-toggle
            v-model="shadow"
            mandatory
            density="comfortable"
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
.settings-toggle {
  flex-wrap: wrap;
  justify-content: center;
}

.settings-toggle :deep(.v-btn) {
  text-transform: none;
}
</style>
