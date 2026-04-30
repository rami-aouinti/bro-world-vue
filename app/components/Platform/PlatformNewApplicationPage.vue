<script setup lang="ts">
import { privateApi } from '~/utils/http/privateApi'

type PublicPlatform = {
  id: string
  name: string
  description: string
  platformKey: string
  photo: string
}
type PublicPlugin = {
  id: string
  name: string
  description: string
  pluginKey: string
  photo: string
}
type AppConfiguration = {
  configurationKey: string
  configurationValue: Record<string, unknown>
}
type PluginConfiguration = {
  configurationKey: string
  configurationValue: Record<string, unknown>
}
type SelectedPluginConfig = {
  pluginId: string
  enabled: boolean
  cacheTtlSeconds: number
  mode: 'standard' | 'advanced'
  notifications: boolean
}
type GeneralApplicationTemplate = {
  platform?: { id?: string; key?: string; name?: string }
  configurations?: Array<{
    key?: string
    value?: Record<string, unknown> & {
      migrations?: { github?: boolean; google?: boolean; azure?: boolean }
    }
  }>
}

const props = defineProps<{
  platformKey: 'crm' | 'shop' | 'recruit' | 'school'
  heading: string
  subheading: string
  backPath?: string
  platformAlias?: string
  recommendedPluginKeys: string[]
}>()

const { loggedIn } = useUserSession()
const createStep = ref(1)
const isSubmitting = ref(false)
const createError = ref('')
const createSuccess = ref('')
const publicPlatforms = ref<PublicPlatform[]>([])
const publicPlugins = ref<PublicPlugin[]>([])
const generalApplicationTemplates = ref<GeneralApplicationTemplate[]>([])
const publicPlatformsPending = ref(false)
const publicPluginsPending = ref(false)
const generalTemplatesPending = ref(false)

const appTitle = ref('')
const appDescription = ref('')
const appStatus = ref(true)
const appPrivate = ref(false)
const selectedCreatePlatformId = ref<string | null>(null)
const appTheme = ref<'light' | 'dark'>('light')
const selectedPlugins = ref<Record<string, SelectedPluginConfig>>({})
const migrationSettings = ref({ github: false, google: false, azure: false })

const platformAlias = computed(() => props.platformAlias ?? props.platformKey)
const filteredPlatforms = computed(() =>
  publicPlatforms.value.filter(
    (platform) => platform.platformKey.toLowerCase() === props.platformKey,
  ),
)
const selectedCreatePlatform = computed(
  () =>
    filteredPlatforms.value.find(
      (item) => item.id === selectedCreatePlatformId.value,
    ) ?? null,
)
const recommendedPlugins = computed(() =>
  publicPlugins.value.filter((plugin) =>
    props.recommendedPluginKeys.includes(plugin.pluginKey.toLowerCase()),
  ),
)

const canGoToStepTwo = computed(
  () =>
    appTitle.value.trim().length > 2 && appDescription.value.trim().length > 4,
)
const canGoToStepThree = computed(() => Boolean(selectedCreatePlatformId.value))
const selectedPluginList = computed(() =>
  Object.values(selectedPlugins.value).filter((plugin) => plugin.enabled),
)

const selectedGeneralTemplate = computed(() => {
  const selectedPlatformId = selectedCreatePlatformId.value
  if (!selectedPlatformId) return null

  const byPlatformId = generalApplicationTemplates.value.find(
    (item) =>
      item.platform?.id === selectedPlatformId &&
      item.platform?.key?.toLowerCase() === props.platformKey,
  )
  if (byPlatformId) return byPlatformId

  return (
    generalApplicationTemplates.value.find(
      (item) => item.platform?.key?.toLowerCase() === props.platformKey,
    ) ?? null
  )
})

const canSubmitCreate = computed(
  () => canGoToStepTwo.value && canGoToStepThree.value && loggedIn.value,
)

function togglePlugin(plugin: PublicPlugin, enabled: boolean) {
  const existing = selectedPlugins.value[plugin.id]
  selectedPlugins.value[plugin.id] = {
    pluginId: plugin.id,
    enabled,
    cacheTtlSeconds: existing?.cacheTtlSeconds ?? 120,
    mode: existing?.mode ?? 'standard',
    notifications: existing?.notifications ?? true,
  }
}

function getPluginEnabled(pluginId: string): boolean {
  return selectedPlugins.value[pluginId]?.enabled ?? false
}

function ensurePluginConfig(pluginId: string): SelectedPluginConfig {
  if (!selectedPlugins.value[pluginId]) {
    selectedPlugins.value[pluginId] = {
      pluginId,
      enabled: false,
      cacheTtlSeconds: 120,
      mode: 'standard',
      notifications: true,
    }
  }

  return selectedPlugins.value[pluginId] as SelectedPluginConfig
}

function updatePluginEnabled(plugin: PublicPlugin, enabled: boolean | null) {
  togglePlugin(plugin, Boolean(enabled))
}
function truncateToWords(value: string, maxWords = 50): string {
  const words = value.trim().split(/\s+/)
  if (words.length <= maxWords) return value
  return `${words.slice(0, maxWords).join(' ')}…`
}

function inferPlatformConfigurations(): AppConfiguration[] {
  const templateKey = `application.${platformAlias.value}.general`
  const templateConfiguration =
    selectedGeneralTemplate.value?.configurations?.find(
      (configuration) => configuration.key === templateKey,
    )
  const templateValue = (templateConfiguration?.value ?? {}) as Record<
    string,
    unknown
  >
  const templateMigrations = (templateValue.migrations ?? {}) as Record<
    string,
    unknown
  >

  const configs: AppConfiguration[] = [
    {
      configurationKey: 'app.theme',
      configurationValue: { name: appTheme.value },
    },
    {
      configurationKey: `platform.${platformAlias.value}.setup.complete`,
      configurationValue: { enabled: true },
    },
    {
      configurationKey: templateKey,
      configurationValue: {
        ...templateValue,
        enabled:
          typeof templateValue.enabled === 'boolean'
            ? templateValue.enabled
            : true,
      },
    },
  ]

  if (props.platformKey === 'crm') {
    configs.push({
      configurationKey: 'platform.crm.pipeline.defaultStage',
      configurationValue: { name: 'lead' },
    })
    configs.push({
      configurationKey: 'platform.crm.autoReminder.enabled',
      configurationValue: { enabled: true },
    })
    configs.push({
      configurationKey: templateKey,
      configurationValue: {
        ...templateValue,
        enabled:
          typeof templateValue.enabled === 'boolean'
            ? templateValue.enabled
            : true,
        migrations: {
          ...templateMigrations,
          github: migrationSettings.value.github,
          google: migrationSettings.value.google,
          azure: migrationSettings.value.azure,
        },
      },
    })
  }

  return configs
}

function inferPluginConfigurations(
  plugin: SelectedPluginConfig,
): PluginConfiguration[] {
  return [
    {
      configurationKey: 'plugin.cache.ttl',
      configurationValue: { seconds: plugin.cacheTtlSeconds },
    },
    {
      configurationKey: 'plugin.mode',
      configurationValue: { name: plugin.mode },
    },
    {
      configurationKey: 'plugin.notifications.enabled',
      configurationValue: { enabled: plugin.notifications },
    },
  ]
}

async function fetchPublicPlatforms() {
  publicPlatformsPending.value = true
  try {
    publicPlatforms.value = await $fetch<PublicPlatform[]>(
      '/api/platform/public',
    )
    if (!selectedCreatePlatformId.value && filteredPlatforms.value.length)
      selectedCreatePlatformId.value = filteredPlatforms.value.at(0)?.id ?? null
  } catch {
    createError.value = 'Unable to load platforms. Please retry.'
  } finally {
    publicPlatformsPending.value = false
  }
}

async function fetchPublicPlugins() {
  publicPluginsPending.value = true
  try {
    publicPlugins.value = await $fetch<PublicPlugin[]>('/api/plugin/public')
  } catch {
    createError.value = 'Unable to load plugins. Please retry.'
  } finally {
    publicPluginsPending.value = false
  }
}

function syncMigrationSettingsFromTemplate() {
  if (props.platformKey !== 'crm') return
  const templateConfiguration =
    selectedGeneralTemplate.value?.configurations?.find(
      (configuration) => configuration.key === 'application.crm.general',
    )
  const migrations = templateConfiguration?.value?.migrations
  migrationSettings.value = {
    github: Boolean(migrations?.github),
    google: Boolean(migrations?.google),
    azure: Boolean(migrations?.azure),
  }
}

async function fetchGeneralApplicationTemplates() {
  generalTemplatesPending.value = true
  try {
    const response = await $fetch<{ items?: GeneralApplicationTemplate[] }>(
      '/api/application/public/general',
    )
    generalApplicationTemplates.value = response.items ?? []
    syncMigrationSettingsFromTemplate()
  } catch {
    createError.value = 'Unable to load application templates. Please retry.'
  } finally {
    generalTemplatesPending.value = false
  }
}

async function submitCreateApplication() {
  if (!canSubmitCreate.value || !selectedCreatePlatformId.value) return
  isSubmitting.value = true
  createError.value = ''
  createSuccess.value = ''

  const payload = {
    platformId: selectedCreatePlatformId.value,
    title: appTitle.value.trim(),
    description: appDescription.value.trim(),
    status: appStatus.value ? 'active' : 'inactive',
    private: appPrivate.value,
    configurations: inferPlatformConfigurations(),
    plugins: selectedPluginList.value.map((plugin) => ({
      pluginId: plugin.pluginId,
      configurations: inferPluginConfigurations(plugin),
    })),
  }

  try {
    await privateApi.request('/api/profile/applications', {
      method: 'POST',
      data: payload,
      headers: { 'Content-Type': 'application/json' },
    })
    createSuccess.value = `${props.heading} created successfully.`
    await navigateTo('/platform')
  } catch {
    createError.value =
      'Unable to create application. Please verify your data and retry.'
  } finally {
    isSubmitting.value = false
  }
}

watch(selectedCreatePlatformId, () => syncMigrationSettingsFromTemplate())
await Promise.all([
  fetchPublicPlatforms(),
  fetchPublicPlugins(),
  fetchGeneralApplicationTemplates(),
])
</script>

<template>
  <div>
    <AppPageDrawers>
      <template #left>
        <div class="d-flex flex-column ga-4">
          <v-card variant="text" color="primary" class="pa-4">
            <div class="d-flex ga-3 align-start">
              <v-avatar size="56" rounded="xl"
                ><v-img
                  :src="
                    selectedCreatePlatform?.photo ||
                    '/images/placeholders/platform-media-fallback.svg'
                  "
                  :alt="selectedCreatePlatform?.name || heading"
                  cover
              /></v-avatar>
              <div>
                <div class="text-subtitle-1 font-weight-bold">
                  {{ selectedCreatePlatform?.name || heading }}
                </div>
                <p class="text-body-2 text-medium-emphasis mb-0">
                  {{ selectedCreatePlatform?.description || subheading }}
                </p>
              </div>
            </div>
          </v-card>
          <v-card variant="text" color="primary" class="pa-4">
            <div class="text-subtitle-2 font-weight-bold mb-2">
              Platform snapshot
            </div>
            <div class="d-flex flex-column ga-2">
              <v-chip color="primary" variant="tonal" label
                >Key:
                {{ selectedCreatePlatform?.platformKey || platformKey }}</v-chip
              >
              <v-chip color="info" variant="tonal" label
                >Name: {{ selectedCreatePlatform?.name || heading }}</v-chip
              >
              <v-chip color="success" variant="tonal" label
                >Status: ready to configure</v-chip
              >
            </div>
          </v-card>
        </div>
      </template>
      <template #right>
        <div class="d-flex flex-column ga-4">
          <v-card
            v-for="plugin in recommendedPlugins"
            :key="plugin.id"
            variant="text"
            color="primary"
            class="pa-4"
          >
            <div class="d-flex ga-3 align-start">
              <v-avatar size="52" rounded="xl"
                ><v-img :src="plugin.photo" :alt="plugin.name" cover
              /></v-avatar>
              <div class="flex-grow-1">
                <div class="text-subtitle-2 font-weight-bold mb-1">
                  {{ plugin.name }}
                </div>
                <p class="text-body-2 text-medium-emphasis mb-0">
                  {{ truncateToWords(plugin.description, 50) }}
                </p>
              </div>
            </div>
          </v-card>
        </div>
      </template>
    </AppPageDrawers>

    <v-container class="py-6" fluid>
      <v-row justify="center"
        ><v-col cols="12" xl="10"
          ><v-card class="pa-4 postcard-gradient-card">
            <v-alert
              v-if="!loggedIn"
              type="warning"
              variant="tonal"
              class="mb-4"
              text="You must be logged in to create an application."
            />
            <v-alert
              v-if="createError"
              type="error"
              variant="tonal"
              class="mb-4"
              :text="createError"
            />
            <v-alert
              v-if="createSuccess"
              type="success"
              variant="tonal"
              class="mb-4"
              :text="createSuccess"
            />

            <v-stepper v-model="createStep" flat class="postcard-gradient-card">
              <v-stepper-header
                ><v-stepper-item
                  :value="1"
                  title="Application" /><v-divider /><v-stepper-item
                  :value="2"
                  title="Platform & Configuration" /><v-divider /><v-stepper-item
                  :value="3"
                  title="Plugins"
              /></v-stepper-header>
              <v-stepper-window>
                <v-stepper-window-item :value="1"
                  ><v-row
                    ><v-col cols="12" md="6"
                      ><v-text-field
                        v-model="appTitle"
                        label="Title"
                        variant="outlined"
                        required /></v-col
                    ><v-col cols="12" md="6"
                      ><div class="d-flex flex-column ga-2 pt-1">
                        <v-switch
                          v-model="appStatus"
                          color="success"
                          inset
                          :label="`Status: ${appStatus ? 'active' : 'inactive'}`"
                        /><v-switch
                          v-model="appPrivate"
                          color="primary"
                          inset
                          :label="`Private: ${appPrivate ? 'yes' : 'no'}`"
                        /></div></v-col
                    ><v-col cols="12"
                      ><v-textarea
                        v-model="appDescription"
                        label="Description"
                        variant="outlined"
                        rows="3"
                        required /></v-col></v-row
                ></v-stepper-window-item>
                <v-stepper-window-item :value="2">
                  <v-row
                    ><v-col cols="12"
                      ><div
                        class="d-flex align-center justify-space-between mb-2"
                      >
                        <h3 class="text-subtitle-1">Select {{ heading }}</h3>
                        <v-btn
                          variant="text"
                          color="primary"
                          :loading="publicPlatformsPending"
                          @click="fetchPublicPlatforms"
                          >Reload</v-btn
                        >
                      </div></v-col
                    ></v-row
                  >
                  <v-row
                    ><v-col
                      v-for="platform in filteredPlatforms"
                      :key="platform.id"
                      cols="12"
                      md="6"
                      class="d-flex"
                      ><v-card
                        variant="outlined"
                        class="w-100 create-card"
                        :class="{
                          'create-card--selected':
                            selectedCreatePlatformId === platform.id,
                        }"
                        @click="selectedCreatePlatformId = platform.id"
                        ><v-card-title class="text-subtitle-2 text-wrap">{{
                          platform.name
                        }}</v-card-title
                        ><v-card-text
                          class="text-body-2 text-medium-emphasis"
                          >{{ platform.description }}</v-card-text
                        ><v-card-actions
                          ><v-chip
                            size="small"
                            color="primary"
                            variant="tonal"
                            >{{ platform.platformKey }}</v-chip
                          ></v-card-actions
                        ></v-card
                      ></v-col
                    ></v-row
                  >
                  <v-alert
                    v-if="!filteredPlatforms.length && !publicPlatformsPending"
                    type="info"
                    variant="tonal"
                    class="mt-2"
                    >No {{ heading }} available in the public platform
                    catalog.</v-alert
                  >
                  <v-divider class="my-4" />
                  <h3 class="text-subtitle-1 mb-2">Configuration</h3>
                  <v-switch
                    v-model="appTheme"
                    true-value="dark"
                    false-value="light"
                    color="primary"
                    inset
                    :label="`Theme: ${appTheme}`"
                  />
                  <template v-if="platformKey === 'crm'"
                    ><v-divider class="my-4" />
                    <div class="d-flex align-center justify-space-between mb-2">
                      <h3 class="text-subtitle-1 mb-0">Migrations</h3>
                      <v-btn
                        variant="text"
                        color="primary"
                        :loading="generalTemplatesPending"
                        @click="fetchGeneralApplicationTemplates"
                        >Reload</v-btn
                      >
                    </div>
                    <p class="text-body-2 text-medium-emphasis mb-2">
                      Activez les synchronisations disponibles pour GitHub,
                      Google et Azure.
                    </p>
                    <v-switch
                      v-model="migrationSettings.github"
                      color="primary"
                      inset
                      label="Migration GitHub" /><v-switch
                      v-model="migrationSettings.google"
                      color="primary"
                      inset
                      label="Migration Google" /><v-switch
                      v-model="migrationSettings.azure"
                      color="primary"
                      inset
                      label="Migration Azure"
                  /></template>
                  <v-alert
                    v-if="selectedCreatePlatform"
                    type="info"
                    variant="tonal"
                    class="mt-3"
                    >Selected platform:
                    <strong>{{ selectedCreatePlatform.name }}</strong></v-alert
                  >
                </v-stepper-window-item>
                <v-stepper-window-item :value="3">
                  <v-row
                    ><v-col cols="12"
                      ><div
                        class="d-flex align-center justify-space-between mb-2"
                      >
                        <h3 class="text-subtitle-1">Recommended plugins</h3>
                        <v-btn
                          variant="text"
                          color="primary"
                          :loading="publicPluginsPending"
                          @click="fetchPublicPlugins"
                          >Reload</v-btn
                        >
                      </div></v-col
                    >
                    <v-col
                      v-for="plugin in recommendedPlugins"
                      :key="plugin.id"
                      cols="12"
                      md="6"
                      class="d-flex"
                      ><v-card variant="outlined" class="w-100 pa-2"
                        ><div
                          class="d-flex justify-space-between align-start ga-2"
                        >
                          <div>
                            <div class="text-subtitle-2">{{ plugin.name }}</div>
                            <div class="text-body-2 text-medium-emphasis">
                              {{ plugin.description }}
                            </div>
                          </div>
                          <v-switch
                            :model-value="getPluginEnabled(plugin.id)"
                            color="primary"
                            hide-details
                            @update:model-value="
                              updatePluginEnabled(plugin, $event)
                            "
                          />
                        </div>
                        <template v-if="getPluginEnabled(plugin.id)"
                          ><v-divider class="my-3" /><v-text-field
                            v-model.number="
                              ensurePluginConfig(plugin.id).cacheTtlSeconds
                            "
                            label="Cache TTL (seconds)"
                            type="number"
                            :min="60"
                            :max="3600"
                            :step="30"
                            variant="outlined" /><AppSelect
                            v-model="ensurePluginConfig(plugin.id).mode"
                            label="Mode"
                            :items="[
                              { title: 'Standard', value: 'standard' },
                              { title: 'Advanced', value: 'advanced' },
                            ]" /><v-switch
                            v-model="
                              ensurePluginConfig(plugin.id).notifications
                            "
                            label="Notifications"
                            color="primary"
                            inset /></template></v-card
                    ></v-col>
                  </v-row>
                </v-stepper-window-item>
              </v-stepper-window>
            </v-stepper>

            <v-card-actions class="justify-space-between px-0 pb-0 mt-4"
              ><div>
                <v-btn
                  variant="text"
                  :disabled="createStep <= 1"
                  @click="createStep = Math.max(1, createStep - 1)"
                  >Back</v-btn
                >
              </div>
              <div class="d-flex ga-2">
                <v-btn
                  v-if="createStep < 3"
                  color="primary"
                  :disabled="
                    (createStep === 1 && !canGoToStepTwo) ||
                    (createStep === 2 && !canGoToStepThree)
                  "
                  @click="createStep += 1"
                  >Continue</v-btn
                ><v-btn
                  v-else
                  color="primary"
                  :loading="isSubmitting"
                  :disabled="!canSubmitCreate"
                  @click="submitCreateApplication"
                  >Create Application</v-btn
                >
              </div></v-card-actions
            >
          </v-card></v-col
        ></v-row
      >
    </v-container>
  </div>
</template>

<style scoped>
.create-card {
  border-width: 1.5px;
  border-color: rgba(100, 116, 139, 0.35);
  transition:
    border-color 0.2s ease,
    transform 0.2s ease;
}
.create-card:hover {
  transform: translateY(-2px);
}
.create-card--selected {
  border-color: rgb(var(--v-theme-primary));
  box-shadow: 0 0 0 1px rgba(var(--v-theme-primary), 0.3);
}
</style>
