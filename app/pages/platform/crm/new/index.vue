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

const PLATFORM_PUBLIC_ENDPOINT = '/api/platform/public'
const PLUGIN_PUBLIC_ENDPOINT = '/api/plugin/public'
const CREATE_APPLICATION_ENDPOINT = '/api/profile/applications'

const { loggedIn } = useUserSession()

definePageMeta({
  title: 'Create CRM Application',
})

const createStep = ref(1)
const isSubmitting = ref(false)
const createError = ref('')
const createSuccess = ref('')
const publicPlatforms = ref<PublicPlatform[]>([])
const publicPlugins = ref<PublicPlugin[]>([])
const publicPlatformsPending = ref(false)
const publicPluginsPending = ref(false)

const appTitle = ref('')
const appDescription = ref('')
const appStatus = ref(true)
const appPrivate = ref(false)
const selectedCreatePlatformId = ref<string | null>(null)
const appTheme = ref<'light' | 'dark'>('light')
const selectedPlugins = ref<Record<string, SelectedPluginConfig>>({})

const crmPlatforms = computed(() =>
  publicPlatforms.value.filter(platform => platform.platformKey.toLowerCase() === 'crm'),
)

const selectedCreatePlatform = computed(() => {
  return (
    crmPlatforms.value.find(item => item.id === selectedCreatePlatformId.value) ??
    null
  )
})

const canGoToStepTwo = computed(() => {
  return appTitle.value.trim().length > 2 && appDescription.value.trim().length > 4
})

const canGoToStepThree = computed(() => Boolean(selectedCreatePlatformId.value))

const selectedPluginList = computed(() => {
  return Object.values(selectedPlugins.value).filter(plugin => plugin.enabled)
})

const canSubmitCreate = computed(() => {
  return canGoToStepTwo.value && canGoToStepThree.value && loggedIn.value
})

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

function inferPlatformConfigurations(): AppConfiguration[] {
  return [
    {
      configurationKey: 'app.theme',
      configurationValue: { name: appTheme.value },
    },
    {
      configurationKey: 'platform.crm.pipeline.defaultStage',
      configurationValue: { name: 'lead' },
    },
    {
      configurationKey: 'platform.crm.autoReminder.enabled',
      configurationValue: { enabled: true },
    },
  ]
}

function inferPluginConfigurations(plugin: SelectedPluginConfig): PluginConfiguration[] {
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
    publicPlatforms.value = await $fetch<PublicPlatform[]>(PLATFORM_PUBLIC_ENDPOINT)

    if (!selectedCreatePlatformId.value && crmPlatforms.value.length) {
      selectedCreatePlatformId.value = crmPlatforms.value[0].id
    }
  } catch {
    createError.value = 'Unable to load platforms. Please retry.'
  } finally {
    publicPlatformsPending.value = false
  }
}

async function fetchPublicPlugins() {
  publicPluginsPending.value = true

  try {
    publicPlugins.value = await $fetch<PublicPlugin[]>(PLUGIN_PUBLIC_ENDPOINT)
  } catch {
    createError.value = 'Unable to load plugins. Please retry.'
  } finally {
    publicPluginsPending.value = false
  }
}

async function submitCreateApplication() {
  if (!canSubmitCreate.value || !selectedCreatePlatformId.value) {
    return
  }

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
    plugins: selectedPluginList.value.map(plugin => ({
      pluginId: plugin.pluginId,
      configurations: inferPluginConfigurations(plugin),
    })),
  }

  try {
    await privateApi.request(CREATE_APPLICATION_ENDPOINT, {
      method: 'POST',
      data: payload,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    createSuccess.value = 'CRM application created successfully.'
    await navigateTo('/platform')
  } catch {
    createError.value =
      'Unable to create application. Please verify your data and retry.'
  } finally {
    isSubmitting.value = false
  }
}

await Promise.all([fetchPublicPlatforms(), fetchPublicPlugins()])
</script>

<template>
  <v-container class="py-6" fluid>
    <v-row justify="center">
      <v-col cols="12" xl="10">
        <v-card class="pa-4 postcard-gradient-card">
          <div class="d-flex justify-space-between align-center mb-4 flex-wrap ga-2">
            <div>
              <h1 class="text-h5 mb-1">Create CRM Application</h1>
              <p class="text-body-2 text-medium-emphasis mb-0">Assistant de création avec stepper, configuration et plugins.</p>
            </div>
            <v-btn variant="tonal" prepend-icon="mdi-arrow-left" @click="navigateTo('/platform')">Back to Platform</v-btn>
          </div>

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

          <v-stepper v-model="createStep" flat>
            <v-stepper-header>
              <v-stepper-item :value="1" title="Application" />
              <v-divider />
              <v-stepper-item :value="2" title="Platform & Configuration" />
              <v-divider />
              <v-stepper-item :value="3" title="Plugins" />
            </v-stepper-header>

            <v-stepper-window>
              <v-stepper-window-item :value="1">
                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="appTitle"
                      label="Title"
                      variant="outlined"
                      required
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <div class="d-flex flex-column ga-2 pt-1">
                      <v-switch
                        v-model="appStatus"
                        color="success"
                        inset
                        :label="`Status: ${appStatus ? 'active' : 'inactive'}`"
                      />
                      <v-switch
                        v-model="appPrivate"
                        color="primary"
                        inset
                        :label="`Private: ${appPrivate ? 'yes' : 'no'}`"
                      />
                    </div>
                  </v-col>
                  <v-col cols="12">
                    <v-textarea
                      v-model="appDescription"
                      label="Description"
                      variant="outlined"
                      rows="3"
                      required
                    />
                  </v-col>
                </v-row>
              </v-stepper-window-item>

              <v-stepper-window-item :value="2">
                <v-row>
                  <v-col cols="12">
                    <div class="d-flex align-center justify-space-between mb-2">
                      <h3 class="text-subtitle-1">Select CRM platform</h3>
                      <v-btn
                        variant="text"
                        color="primary"
                        :loading="publicPlatformsPending"
                        @click="fetchPublicPlatforms"
                      >
                        Reload
                      </v-btn>
                    </div>
                  </v-col>
                </v-row>

                <v-row>
                  <v-col
                    v-for="platform in crmPlatforms"
                    :key="platform.id"
                    cols="12"
                    md="6"
                    class="d-flex"
                  >
                    <v-card
                      variant="outlined"
                      class="w-100 create-card"
                      :class="{
                        'create-card--selected':
                          selectedCreatePlatformId === platform.id,
                      }"
                      @click="selectedCreatePlatformId = platform.id"
                    >
                      <v-card-title class="text-subtitle-2 text-wrap">
                        {{ platform.name }}
                      </v-card-title>
                      <v-card-text class="text-body-2 text-medium-emphasis">
                        {{ platform.description }}
                      </v-card-text>
                      <v-card-actions>
                        <v-chip size="small" color="primary" variant="tonal">
                          {{ platform.platformKey }}
                        </v-chip>
                      </v-card-actions>
                    </v-card>
                  </v-col>
                </v-row>

                <v-alert v-if="!crmPlatforms.length && !publicPlatformsPending" type="info" variant="tonal" class="mt-2">
                  No CRM platform available in the public platform catalog.
                </v-alert>

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

                <v-alert v-if="selectedCreatePlatform" type="info" variant="tonal" class="mt-3">
                  Selected platform: <strong>{{ selectedCreatePlatform.name }}</strong>
                </v-alert>
              </v-stepper-window-item>

              <v-stepper-window-item :value="3">
                <v-row>
                  <v-col cols="12">
                    <div class="d-flex align-center justify-space-between mb-2">
                      <h3 class="text-subtitle-1">Plugins (one or more)</h3>
                      <v-btn
                        variant="text"
                        color="primary"
                        :loading="publicPluginsPending"
                        @click="fetchPublicPlugins"
                      >
                        Reload
                      </v-btn>
                    </div>
                  </v-col>

                  <v-col
                    v-for="plugin in publicPlugins"
                    :key="plugin.id"
                    cols="12"
                    md="6"
                    class="d-flex"
                  >
                    <v-card variant="outlined" class="w-100 pa-2">
                      <div class="d-flex justify-space-between align-start ga-2">
                        <div>
                          <div class="text-subtitle-2">{{ plugin.name }}</div>
                          <div class="text-body-2 text-medium-emphasis">
                            {{ plugin.description }}
                          </div>
                        </div>
                        <v-switch
                          :model-value="selectedPlugins[plugin.id]?.enabled ?? false"
                          color="primary"
                          hide-details
                          @update:model-value="togglePlugin(plugin, $event)"
                        />
                      </div>

                      <template v-if="selectedPlugins[plugin.id]?.enabled">
                        <v-divider class="my-3" />
                        <v-text-field
                          v-model.number="selectedPlugins[plugin.id].cacheTtlSeconds"
                          label="Cache TTL (seconds)"
                          type="number"
                          :min="60"
                          :max="3600"
                          :step="30"
                          variant="outlined"
                        />

                        <AppSelect
                          v-model="selectedPlugins[plugin.id].mode"
                          label="Mode"
                          :items="[
                            { title: 'Standard', value: 'standard' },
                            { title: 'Advanced', value: 'advanced' },
                          ]"
                        />

                        <v-switch
                          v-model="selectedPlugins[plugin.id].notifications"
                          label="Notifications"
                          color="primary"
                          inset
                        />
                      </template>
                    </v-card>
                  </v-col>
                </v-row>
              </v-stepper-window-item>
            </v-stepper-window>
          </v-stepper>

          <v-card-actions class="justify-space-between px-0 pb-0 mt-4">
            <div>
              <v-btn
                variant="text"
                :disabled="createStep <= 1"
                @click="createStep = Math.max(1, createStep - 1)"
              >
                Back
              </v-btn>
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
              >
                Continue
              </v-btn>
              <v-btn
                v-else
                color="primary"
                :loading="isSubmitting"
                :disabled="!canSubmitCreate"
                @click="submitCreateApplication"
              >
                Create Application
              </v-btn>
            </div>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.create-card {
  border-width: 1.5px;
  border-color: rgba(100, 116, 139, 0.35);
  transition: border-color 0.2s ease, transform 0.2s ease;
}

.create-card:hover {
  transform: translateY(-2px);
}

.create-card--selected {
  border-color: rgb(var(--v-theme-primary));
  box-shadow: 0 0 0 1px rgba(var(--v-theme-primary), 0.3);
}
</style>
