<script setup lang="ts">
import { privateApi } from '~/utils/http/privateApi'

type PlatformApplication = {
  id: string
  title: string
  description: string
  photo: string
  platformName: string
  platformKey: string
  status: string
  private: boolean
  pluginKeys: string[]
  isOwner: boolean
}

type PlatformResponse = {
  items: PlatformApplication[]
}

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

const PAGE_SIZE = 6
const PLATFORM_PUBLIC_ENDPOINT = 'https://bro-world.org/api/v1/platform/public'
const PLUGIN_PUBLIC_ENDPOINT = 'https://bro-world.org/api/v1/plugin/public'
const CREATE_APPLICATION_ENDPOINT =
  'https://bro-world.org/api/v1/profile/applications'

const { t } = useI18n()
const { isPageSkeletonVisible } = usePageSkeleton()
const { loggedIn } = useUserSession()

definePageMeta({
  title: 'appbar.platform',
})

const searchTerm = ref('')
const selectedStatus = ref<'all' | 'active' | 'inactive'>('all')
const selectedVisibility = ref<'all' | 'private' | 'public'>('all')
const selectedOwnership = ref<'all' | 'owner' | 'member'>('all')
const selectedPlatformId = ref<string | null>(null)
const currentPage = ref(1)

const isCreateDialogOpen = ref(false)
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

const { data, pending, error, refresh } = await useAsyncData(
  'platform-applications',
  () => {
    const query = { page: 1, limit: 120 }

    if (loggedIn.value) {
      const privateApplicationsUrl = import.meta.client
        ? new URL('/api/application/private', window.location.origin).toString()
        : new URL('/api/application/private', useRequestURL().origin).toString()

      return privateApi.request<PlatformResponse>(privateApplicationsUrl, {
        params: query,
      })
    }

    return $fetch<PlatformResponse>('/api/application/public', { query })
  },
  {
    watch: [loggedIn],
    default: () => ({ items: [] }),
  },
)

const applications = computed(() => data.value?.items ?? [])

const filteredApplications = computed(() => {
  return applications.value.filter((application) => {
    const matchesSearch =
      !searchTerm.value ||
      application.title.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      application.platformName
        .toLowerCase()
        .includes(searchTerm.value.toLowerCase()) ||
      application.platformKey
        .toLowerCase()
        .includes(searchTerm.value.toLowerCase())

    const matchesStatus =
      selectedStatus.value === 'all' ||
      application.status === selectedStatus.value
    const matchesVisibility =
      selectedVisibility.value === 'all' ||
      (selectedVisibility.value === 'private' && application.private) ||
      (selectedVisibility.value === 'public' && !application.private)

    const matchesOwnership =
      selectedOwnership.value === 'all' ||
      (selectedOwnership.value === 'owner' && application.isOwner) ||
      (selectedOwnership.value === 'member' && !application.isOwner)

    return (
      matchesSearch && matchesStatus && matchesVisibility && matchesOwnership
    )
  })
})

const pageCount = computed(() =>
  Math.max(1, Math.ceil(filteredApplications.value.length / PAGE_SIZE)),
)

const paginatedApplications = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return filteredApplications.value.slice(start, start + PAGE_SIZE)
})

const selectedPlatform = computed(
  () =>
    applications.value.find((item) => item.id === selectedPlatformId.value) ??
    null,
)

const selectedCreatePlatform = computed(() => {
  return (
    publicPlatforms.value.find((item) => item.id === selectedCreatePlatformId.value) ??
    null
  )
})

const canGoToStepTwo = computed(() => {
  return appTitle.value.trim().length > 2 && appDescription.value.trim().length > 4
})

const canGoToStepThree = computed(() => Boolean(selectedCreatePlatformId.value))

const selectedPluginList = computed(() => {
  return Object.values(selectedPlugins.value).filter((plugin) => plugin.enabled)
})

const canSubmitCreate = computed(() => {
  return canGoToStepTwo.value && canGoToStepThree.value && loggedIn.value
})

watch(
  filteredApplications,
  (items) => {
    if (!items.length) {
      currentPage.value = 1
      selectedPlatformId.value = null
      return
    }

    if (currentPage.value > pageCount.value) {
      currentPage.value = pageCount.value
    }

    const selectionStillExists = items.some(
      (item) => item.id === selectedPlatformId.value,
    )

    if (!selectionStillExists) {
      selectedPlatformId.value = items[0]?.id ?? null
    }
  },
  { immediate: true },
)

watch(currentPage, () => {
  const visibleIds = new Set(paginatedApplications.value.map((item) => item.id))

  if (!selectedPlatformId.value || !visibleIds.has(selectedPlatformId.value)) {
    selectedPlatformId.value = paginatedApplications.value[0]?.id ?? null
  }
})

function resetFilters() {
  searchTerm.value = ''
  selectedStatus.value = 'all'
  selectedVisibility.value = 'all'
  selectedOwnership.value = 'all'
  currentPage.value = 1
}

function resetCreateForm() {
  createStep.value = 1
  createError.value = ''
  createSuccess.value = ''
  appTitle.value = ''
  appDescription.value = ''
  appStatus.value = true
  appPrivate.value = false
  selectedCreatePlatformId.value = null
  appTheme.value = 'light'
  selectedPlugins.value = {}
}

async function openCreateDialog() {
  isCreateDialogOpen.value = true
  createError.value = ''
  createSuccess.value = ''

  if (!publicPlatforms.value.length) {
    await fetchPublicPlatforms()
  }

  if (!publicPlugins.value.length) {
    await fetchPublicPlugins()
  }
}

function closeCreateDialog() {
  isCreateDialogOpen.value = false
  resetCreateForm()
}

async function fetchPublicPlatforms() {
  publicPlatformsPending.value = true

  try {
    publicPlatforms.value = await $fetch<PublicPlatform[]>(PLATFORM_PUBLIC_ENDPOINT)
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
  const platformKey = selectedCreatePlatform.value?.platformKey ?? 'generic'

  const defaults: Record<string, AppConfiguration[]> = {
    crm: [
      {
        configurationKey: 'platform.crm.pipeline.defaultStage',
        configurationValue: { name: 'lead' },
      },
      {
        configurationKey: 'platform.crm.autoReminder.enabled',
        configurationValue: { enabled: true },
      },
    ],
    recruit: [
      {
        configurationKey: 'platform.recruit.interview.mode',
        configurationValue: { name: 'hybrid' },
      },
      {
        configurationKey: 'platform.recruit.scoring.enabled',
        configurationValue: { enabled: true },
      },
    ],
    school: [
      {
        configurationKey: 'platform.school.grading.scale',
        configurationValue: { type: 'A-F' },
      },
      {
        configurationKey: 'platform.school.attendance.required',
        configurationValue: { enabled: true },
      },
    ],
    shop: [
      {
        configurationKey: 'platform.shop.currency',
        configurationValue: { code: 'USD' },
      },
      {
        configurationKey: 'platform.shop.inventory.sync',
        configurationValue: { enabled: true },
      },
    ],
  }

  return [
    {
      configurationKey: 'app.theme',
      configurationValue: { name: appTheme.value },
    },
    ...(defaults[platformKey] ?? []),
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
    plugins: selectedPluginList.value.map((plugin) => ({
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

    createSuccess.value = 'Application created successfully.'
    await refresh()
    closeCreateDialog()
  } catch {
    createError.value =
      'Unable to create application. Please verify your data and retry.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div>
    <AppPageDrawers>
      <template #left>
        <SkeletonDrawerLeft v-if="isPageSkeletonVisible" />
        <div v-else class="d-flex flex-column ga-2">
          <v-btn
            variant="tonal"
            color="primary"
            prepend-icon="mdi-plus-outline"
            @click="openCreateDialog"
          >
            Create Platform
          </v-btn>

          <v-text-field
            v-model="searchTerm"
            :label="t('common.search')"
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="compact"
            hide-details
            clearable
          />

          <AppSelect
            v-model="selectedStatus"
            :label="t('platform.status')"
            :items="[
              { title: t('platform.all'), value: 'all' },
              { title: 'Active', value: 'active' },
              { title: 'Inactive', value: 'inactive' },
            ]"
          />

          <AppSelect
            v-model="selectedVisibility"
            :label="t('platform.visibility')"
            :items="[
              { title: t('platform.all'), value: 'all' },
              { title: t('platform.private'), value: 'private' },
              { title: t('platform.public'), value: 'public' },
            ]"
          />

          <AppSelect
            v-model="selectedOwnership"
            :label="t('platform.role')"
            :items="[
              { title: t('platform.all'), value: 'all' },
              { title: t('platform.owner'), value: 'owner' },
              { title: t('platform.member'), value: 'member' },
            ]"
          />

          <v-btn
            variant="tonal"
            prepend-icon="mdi-filter-off-outline"
            @click="resetFilters"
          >
            {{ t('platform.clearFilters') }}
          </v-btn>
        </div>
      </template>

      <template #right>
        <SkeletonDrawerRight v-if="isPageSkeletonVisible" />
        <v-card-text v-else-if="selectedPlatform">
          <div>
            <h3 class="text-h6 font-weight-bold">
              {{ selectedPlatform?.title || t('platform.selectPlatform') }}
            </h3>
          </div>
          <v-img
            :src="selectedPlatform.photo"
            :alt="selectedPlatform.title"
            height="120"
            cover
          />
          <v-card-text class="d-flex flex-column ga-3">
            <div class="text-body-2 text-medium-emphasis">
              {{ selectedPlatform.description }}
            </div>
            <div class="d-flex flex-wrap ga-2">
              <v-chip
                size="small"
                :color="
                  selectedPlatform.status === 'active' ? 'success' : 'warning'
                "
                label
              >
                {{ selectedPlatform.status }}
              </v-chip>
              <v-chip size="small" color="primary" variant="outlined" label>
                {{ selectedPlatform.platformName }}
              </v-chip>
              <v-chip
                size="small"
                :color="
                  selectedPlatform.private
                    ? 'deep-purple-accent-4'
                    : 'teal-darken-1'
                "
                label
              >
                {{
                  selectedPlatform.private
                    ? t('platform.private')
                    : t('platform.public')
                }}
              </v-chip>
            </div>

            <div class="d-flex flex-wrap ga-2">
              <v-chip
                v-for="pluginKey in selectedPlatform.pluginKeys"
                :key="`selected-${pluginKey}`"
                size="small"
                variant="outlined"
              >
                {{ pluginKey }}
              </v-chip>
            </div>

            <div class="d-flex flex-wrap ga-2">
              <v-btn
                v-if="selectedPlatform.isOwner"
                color="primary"
                variant="outlined"
                prepend-icon="mdi-pencil"
              >
                {{ t('common.edit') }}
              </v-btn>
              <v-btn
                v-if="selectedPlatform.isOwner"
                color="error"
                variant="tonal"
                prepend-icon="mdi-delete-outline"
              >
                {{ t('common.delete') }}
              </v-btn>
              <v-chip v-else color="grey" variant="tonal" label>
                {{ t('platform.member') }}
              </v-chip>
            </div>
          </v-card-text>
        </v-card-text>
        <v-alert
          v-else
          type="info"
          variant="tonal"
          :text="t('platform.selectPlatformHint')"
        />
      </template>
    </AppPageDrawers>

    <v-container fluid>
      <SkeletonPageContent v-if="isPageSkeletonVisible" />
      <template v-else>
        <client-only>
          <teleport to="#app-bar">
            <v-btn
              variant="tonal"
              color="primary"
              icon="mdi-refresh"
              :loading="pending"
              @click="refresh()"
            />
          </teleport>
        </client-only>

        <v-card
          variant="text"
          class="content-main postcard-gradient-card mb-3 pa-3 platform-page__content"
        >
          <v-alert
            v-if="error"
            type="error"
            variant="tonal"
            class="mb-4"
            :text="t('platform.error')"
          />

          <v-row v-if="pending" density="comfortable">
            <v-col
              v-for="index in 6"
              :key="`skeleton-${index}`"
              cols="12"
              md="6"
            >
              <v-skeleton-loader type="image, article" class="skeleton-card" />
            </v-col>
          </v-row>

          <v-row
            v-else-if="paginatedApplications.length"
            density="comfortable"
            class="platform-grid"
          >
            <v-col
              v-for="application in paginatedApplications"
              :key="application.id"
              cols="12"
              md="6"
              class="d-flex"
            >
              <v-card
                variant="text"
                class="platform-card w-100 postcard-gradient-card"
                :class="{
                  'platform-card--selected':
                    selectedPlatformId === application.id,
                }"
                @click="selectedPlatformId = application.id"
              >
                <div class="platform-card__overlay pa-1 d-flex justify-end">
                  <v-chip
                    size="small"
                    label
                    :color="
                      application.status === 'active' ? 'success' : 'warning'
                    "
                  >
                    {{ application.status }}
                  </v-chip>
                </div>

                <v-card-item>
                  <v-card-title class="text-wrap text-subtitle-2">{{
                    application.title
                  }}</v-card-title>
                </v-card-item>

                <v-card-text class="pt-0">
                  <div class="d-flex flex-wrap ga-2">
                    <v-chip
                      v-for="pluginKey in application.pluginKeys"
                      :key="pluginKey"
                      size="small"
                      variant="outlined"
                      color="primary"
                    >
                      {{ pluginKey }}
                    </v-chip>
                    <v-chip size="small" variant="outlined" color="secondary">
                      {{
                        application.private
                          ? t('platform.private')
                          : t('platform.public')
                      }}
                    </v-chip>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <v-alert
            v-else
            type="info"
            variant="tonal"
            class="mt-4"
            :title="t('platform.emptyTitle')"
            :text="t('platform.emptySubtitle')"
          />

          <div
            v-if="!pending && filteredApplications.length"
            class="platform-page__pagination d-flex justify-center"
          >
            <v-pagination
              v-model="currentPage"
              :length="pageCount"
              :total-visible="7"
              rounded="circle"
            />
          </div>
        </v-card>
      </template>
    </v-container>

    <v-dialog v-model="isCreateDialogOpen" max-width="980">
      <v-card class="pa-2">
        <v-card-title class="d-flex justify-space-between align-center">
          <span>Create Application</span>
          <v-btn icon="mdi-close" variant="text" @click="closeCreateDialog" />
        </v-card-title>

        <v-card-text>
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
                      <h3 class="text-subtitle-1">Select one platform</h3>
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
                    v-for="platform in publicPlatforms"
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
        </v-card-text>

        <v-card-actions class="justify-space-between px-6 pb-4">
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
            <v-btn variant="tonal" @click="closeCreateDialog">Cancel</v-btn>
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
    </v-dialog>
  </div>
</template>

<style scoped>
.platform-page {
  min-height: calc(90vh - var(--v-layout-top, 0px));
  display: flex;
  flex-direction: column;
}

.platform-page__content {
  min-height: calc(100vh - 220px);
  display: flex;
  flex-direction: column;
  flex: 1;
}

.platform-page__pagination {
  margin-top: auto;
  padding-top: 10px;
  padding-bottom: 5px;
}

.skeleton-card {
  border-radius: 20px;
}

.platform-grid {
  animation: fade-in 0.35s ease;
}

.platform-card {
  cursor: pointer;
  min-height: 100px;
  max-height: 320px;
  overflow: hidden;
  border: 1px solid rgba(100, 116, 139, 0.15);
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease,
    border-color 0.25s ease,
    filter 0.25s ease;
}

.platform-card__image {
  transition: transform 0.3s ease;
}

.platform-card:hover {
  transform: translateY(-6px) scale(1.01);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.16);
}

.platform-card:hover .platform-card__image {
  transform: scale(1.03);
}

.platform-card--selected,
.create-card--selected {
  border-color: rgb(var(--v-theme-primary));
  box-shadow: 0 10px 28px rgba(var(--v-theme-primary), 0.3);
}

.create-card {
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.create-card:hover {
  transform: translateY(-2px);
}

.platform-card__overlay {
  background: linear-gradient(to bottom, rgba(15, 23, 42, 0.4), transparent);
}

.selected-platform-card {
  animation: slide-up 0.3s ease;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
