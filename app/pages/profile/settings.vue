<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import type { UserSessionInfo } from '~/stores/profile'

const { isPageSkeletonVisible } = usePageSkeleton()
const theme = useTheme()
const isLightTheme = computed(() => !theme.current.value.dark)
const profileStore = useProfileStore()
const privateApi = usePrivateApi()
const { fetch: refreshSession } = useUserSession()

definePageMeta({
  title: 'appbar.settings',
  middleware: 'auth',
})

interface BasicInfoForm {
  firstName: string
  lastName: string
  birthday: string
  phone: string
  location: string
  timezone: string
}

const visible = ref(false)
const settingsSections = [
  { id: 'profile', label: 'Profile', icon: 'mdi-account-circle-outline' },
  {
    id: 'basic-info',
    label: 'Basic info',
    icon: 'mdi-card-account-details-outline',
  },
  { id: 'change-password', label: 'Change password', icon: 'mdi-lock-reset' },
  { id: 'two-fa', label: '2FA', icon: 'mdi-shield-key-outline' },
  { id: 'accounts', label: 'Accounts', icon: 'mdi-link-variant' },
  { id: 'notifications', label: 'Notifications', icon: 'mdi-bell-outline' },
  { id: 'sessions', label: 'Sessions', icon: 'mdi-monitor-cellphone' },
  { id: 'delete-account', label: 'Delete account', icon: 'mdi-alert-outline' },
]
const { profile } = storeToRefs(profileStore)
const userProfile = computed(() => profile.value?.profile)
const isSubmittingProfile = ref(false)
const isUploadingPhoto = ref(false)
const sessionsLoading = ref(false)
const sessionsError = ref('')
const sessions = ref<UserSessionInfo[]>([])
const isSessionsDialogOpen = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)
const profileFeedback = ref<{ type: 'success' | 'error'; message: string } | null>(
  null,
)
const photoFeedback = ref<{ type: 'success' | 'error'; message: string } | null>(
  null,
)

const basicInfoForm = ref<BasicInfoForm>({
  firstName: '',
  lastName: '',
  birthday: '',
  phone: '',
  location: '',
  timezone: '',
})

const fullName = computed(() => {
  const user = profile.value
  if (!user) return ''

  return [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username
})

const profileTitle = computed(() => userProfile.value?.title || 'Member')
const displayedSessions = computed(() => sessions.value.slice(-2).reverse())

const basicInfoFields = computed(() => [
  { key: 'firstName', label: 'First name' },
  { key: 'lastName', label: 'Last name' },
  { key: 'birthday', label: 'Birth date', type: 'date' as const },
  { key: 'email', label: 'Email', readonly: true },
  { key: 'phone', label: 'Phone' },
  { key: 'location', label: 'Location' },
  { key: 'timezone', label: 'Timezone' },
])

type BasicInfoFieldKey = keyof BasicInfoForm | 'email'

function getBasicInfoValue(fieldKey: BasicInfoFieldKey) {
  if (fieldKey === 'email') {
    return profile.value?.email || ''
  }

  return basicInfoForm.value[fieldKey]
}

function setBasicInfoValue(fieldKey: BasicInfoFieldKey, value: unknown) {
  if (fieldKey === 'email') {
    return
  }

  basicInfoForm.value[fieldKey] = String(value ?? '')
}

watch(
  () => profile.value,
  (value) => {
    basicInfoForm.value = {
      firstName: value?.firstName || '',
      lastName: value?.lastName || '',
      birthday: value?.profile?.birthday || '',
      phone: value?.profile?.phone || '',
      location: value?.profile?.location || '',
      timezone: value?.timezone || '',
    }
  },
  { immediate: true },
)

const passwordRequirements = [
  'At least 8 characters',
  'One uppercase letter',
  'One number and one special character',
]

const twoFaActions = [
  {
    title: 'Authenticator app',
    subtitle: 'Add or edit your OTP app',
    action: 'Setup',
  },
  {
    title: 'Recovery codes',
    subtitle: 'Generate new backup codes',
    action: 'Regenerate',
  },
  {
    title: 'SMS fallback',
    subtitle: 'Edit your backup phone number',
    action: 'Edit',
  },
]

const accountProviders = [
  { provider: 'Google', connected: true, email: 'alex.martin@gmail.com' },
  { provider: 'GitHub', connected: false, email: 'Not connected' },
  { provider: 'Apple', connected: false, email: 'Not connected' },
]

const notificationRows = [
  {
    title: 'New login detected',
    activity: true,
    email: true,
    push: true,
    sms: false,
  },
  {
    title: 'Product updates',
    activity: true,
    email: true,
    push: false,
    sms: false,
  },
  {
    title: 'Billing alerts',
    activity: true,
    email: true,
    push: true,
    sms: true,
  },
]

const activeSection = ref(settingsSections[0]?.id ?? '')
const sectionObserver = ref<IntersectionObserver | null>(null)

const updateHash = (sectionId: string) => {
  history.replaceState(null, '', `#${sectionId}`)
}

const scrollToSection = (sectionId: string) => {
  activeSection.value = sectionId
  updateHash(sectionId)
  document.getElementById(sectionId)?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  })
}

function openPhotoPicker() {
  fileInputRef.value?.click()
}

function updateProfileStore(nextProfile: typeof profile.value) {
  if (!nextProfile) {
    return
  }

  profileStore.profile = nextProfile
  profileStore.lastFetchedAt = Date.now()
}

async function refreshProfileState() {
  await Promise.all([profileStore.fetchProfile(true), refreshSession()])
}

async function loadSessions() {
  sessionsLoading.value = true
  sessionsError.value = ''

  try {
    sessions.value = await privateApi<UserSessionInfo[]>('/users/me/sessions')
  } catch (error) {
    sessions.value = []
    sessionsError.value =
      error instanceof Error ? error.message : 'Unable to load sessions'
  } finally {
    sessionsLoading.value = false
  }
}

async function submitBasicInfo() {
  if (!profile.value) {
    return
  }

  isSubmittingProfile.value = true
  profileFeedback.value = null
  try {
    const accountPayload = {
      firstName: basicInfoForm.value.firstName.trim(),
      lastName: basicInfoForm.value.lastName.trim(),
      timezone: basicInfoForm.value.timezone.trim() || undefined,
    }
    const profilePayload = {
      birthday: basicInfoForm.value.birthday || undefined,
      phone: basicInfoForm.value.phone.trim() || undefined,
      location: basicInfoForm.value.location.trim() || undefined,
    }

    const [accountResponse, detailsResponse] = await Promise.all([
      privateApi('/profile', {
        method: 'PATCH',
        body: accountPayload,
      }),
      privateApi('/users/me/profile', {
        method: 'PATCH',
        body: profilePayload,
      }),
    ])

    updateProfileStore({
      ...profile.value,
      ...(accountResponse as object),
      profile: {
        ...profile.value.profile,
        ...(detailsResponse as object),
      },
    })
    await refreshProfileState()
    profileFeedback.value = {
      type: 'success',
      message: 'Profile updated successfully.',
    }
  } catch (error) {
    profileFeedback.value = {
      type: 'error',
      message: error instanceof Error ? error.message : 'Unable to update profile.',
    }
  } finally {
    isSubmittingProfile.value = false
  }
}

async function onPhotoSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) {
    return
  }

  const formData = new FormData()
  formData.append('photo', file)

  isUploadingPhoto.value = true
  photoFeedback.value = null
  try {
    const response = await privateApi<{ photo: string }>('/profile/photo', {
      method: 'POST',
      body: formData,
    })

    if (profile.value) {
      updateProfileStore({
        ...profile.value,
        photo: response.photo,
      })
    }
    await refreshProfileState()
    photoFeedback.value = {
      type: 'success',
      message: 'Photo updated successfully.',
    }
  } catch (error) {
    photoFeedback.value = {
      type: 'error',
      message: error instanceof Error ? error.message : 'Photo upload failed.',
    }
  } finally {
    isUploadingPhoto.value = false
    input.value = ''
  }
}

onMounted(() => {
  const sectionElements = settingsSections
    .map(({ id }) => document.getElementById(id))
    .filter((element): element is HTMLElement => Boolean(element))

  if (!sectionElements.length) return

  sectionObserver.value = new IntersectionObserver(
    (entries) => {
      const visibleEntries = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)

      const nextVisibleSection = visibleEntries[0]?.target.getAttribute('id')

      if (!nextVisibleSection) return

      activeSection.value = nextVisibleSection
    },
    {
      threshold: [0.15, 0.35, 0.6],
      rootMargin: '-120px 0px -45% 0px',
    },
  )

  sectionElements.forEach((element) => sectionObserver.value?.observe(element))
  void loadSessions()
})

onUnmounted(() => {
  sectionObserver.value?.disconnect()
  sectionObserver.value = null
})
</script>

<template>
  <div>
    <AppPageDrawers>
      <template #right>
        <v-list nav density="comfortable">
          <v-list-item
            v-for="section in settingsSections"
            :key="section.id"
            :href="'#' + section.id"
            :prepend-icon="section.icon"
            :title="section.label"
            :active="activeSection === section.id"
            @click.prevent="scrollToSection(section.id)"
          />
        </v-list>
      </template>
      <template #left>
        <ProfileDrawer />
      </template>
    </AppPageDrawers>

    <v-container fluid>
      <SkeletonPageContent v-if="isPageSkeletonVisible" />
      <template v-else>
        <div class="d-flex flex-column ga-6">
          <v-card
            id="profile"
            rounded="xl"
            class="pa-6 settings-section settings-card"
            :class="{ 'settings-card--light': isLightTheme }"
          >
            <div
              class="d-flex align-center justify-space-between flex-wrap ga-4"
            >
              <div class="d-flex align-center ga-4">
                <div class="avatar-upload">
                  <v-avatar size="72" :image="profile?.photo" />
                  <v-btn
                    class="avatar-upload__action"
                    icon="mdi-camera"
                    size="x-small"
                    color="primary"
                    :loading="isUploadingPhoto"
                    :disabled="isUploadingPhoto"
                    @click="openPhotoPicker"
                  />
                  <input
                    ref="fileInputRef"
                    class="d-none"
                    type="file"
                    accept="image/*"
                    @change="onPhotoSelected"
                  />
                </div>
                <div>
                  <div class="text-h6">{{ fullName }}</div>
                  <div class="text-body-2 text-medium-emphasis">
                    {{ profileTitle }}
                  </div>
                </div>
              </div>
              <div class="d-flex align-center ga-2">
                <span class="text-body-2">Visible</span>
                <v-switch
                  v-model="visible"
                  color="primary"
                  hide-details
                  inset
                />
              </div>
            </div>
            <v-alert
              v-if="photoFeedback"
              class="mt-4"
              :type="photoFeedback.type"
              variant="tonal"
              border="start"
              :text="photoFeedback.message"
            />
          </v-card>

          <v-card
            id="basic-info"
            rounded="xl"
            class="pa-6 settings-section settings-card"
            :class="{ 'settings-card--light': isLightTheme }"
          >
            <div class="text-h6 mb-4">Basic information</div>
            <v-row>
              <v-col
                v-for="field in basicInfoFields"
                :key="field.key"
                cols="12"
                md="6"
              >
                <v-text-field
                  :label="field.label"
                  :model-value="getBasicInfoValue(field.key as BasicInfoFieldKey)"
                  :readonly="Boolean(field.readonly)"
                  :type="field.type || 'text'"
                  variant="outlined"
                  hide-details
                  @update:model-value="
                    setBasicInfoValue(field.key as BasicInfoFieldKey, $event)
                  "
                />
              </v-col>
            </v-row>
            <div class="mt-4">
              <v-btn
                variant="outlined"
                color="primary"
                :loading="isSubmittingProfile"
                :disabled="isSubmittingProfile"
                @click="submitBasicInfo"
                >Save changes</v-btn
              >
            </div>
            <v-alert
              v-if="profileFeedback"
              class="mt-4"
              :type="profileFeedback.type"
              variant="tonal"
              border="start"
              :text="profileFeedback.message"
            />
          </v-card>

          <v-card
            id="change-password"
            rounded="xl"
            class="pa-6 settings-section settings-card"
            :class="{ 'settings-card--light': isLightTheme }"
          >
            <div class="text-h6 mb-4">Change password</div>
            <v-row>
              <v-col cols="12" md="4">
                <v-text-field
                  label="Current password"
                  type="password"
                  variant="outlined"
                  hide-details
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  label="New password"
                  type="password"
                  variant="outlined"
                  hide-details
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  label="Confirm password"
                  type="password"
                  variant="outlined"
                  hide-details
                />
              </v-col>
            </v-row>
            <v-list density="compact" class="bg-transparent px-0">
              <v-list-item
                v-for="item in passwordRequirements"
                :key="item"
                prepend-icon="mdi-check-circle-outline"
                :title="item"
              />
            </v-list>
            <v-btn variant="outlined" color="primary">Update password</v-btn>
          </v-card>

          <v-card
            id="two-fa"
            rounded="xl"
            class="pa-6 settings-section settings-card"
            :class="{ 'settings-card--light': isLightTheme }"
          >
            <div class="text-h6 mb-4">Two-factor authentication</div>
            <v-list lines="two" class="bg-transparent pa-0">
              <v-list-item
                v-for="item in twoFaActions"
                :key="item.title"
                :title="item.title"
                :subtitle="item.subtitle"
                append-icon="mdi-chevron-right"
              >
                <template #append>
                  <v-btn size="small" variant="text" color="primary">{{
                    item.action
                  }}</v-btn>
                </template>
              </v-list-item>
            </v-list>
          </v-card>

          <v-card
            id="accounts"
            rounded="xl"
            class="pa-6 settings-section settings-card"
            :class="{ 'settings-card--light': isLightTheme }"
          >
            <div class="text-h6 mb-4">Connected accounts</div>
            <v-list class="bg-transparent pa-0 mb-4">
              <v-list-item
                v-for="item in accountProviders"
                :key="item.provider"
                :title="item.provider"
                :subtitle="item.email"
              >
                <template #append>
                  <v-switch
                    :model-value="item.connected"
                    hide-details
                    inset
                    color="primary"
                  />
                </template>
              </v-list-item>
            </v-list>

            <v-alert
              type="info"
              variant="tonal"
              border="start"
              title="Connected account"
            >
              Your Google account is currently used as your primary connected
              account.
            </v-alert>
          </v-card>

          <v-card
            id="notifications"
            rounded="xl"
            class="pa-6 settings-section settings-card"
            :class="{ 'settings-card--light': isLightTheme }"
          >
            <div class="text-h6 mb-4">Notifications</div>
            <v-table class="bg-transparent" density="compact">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Activity</th>
                  <th>Email</th>
                  <th>Push</th>
                  <th>SMS</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in notificationRows" :key="row.title">
                  <td>{{ row.title }}</td>
                  <td class="text-center">
                    <v-checkbox
                      :model-value="row.activity"
                      hide-details
                      density="compact"
                    />
                  </td>
                  <td class="text-center">
                    <v-checkbox
                      :model-value="row.email"
                      hide-details
                      density="compact"
                    />
                  </td>
                  <td class="text-center">
                    <v-checkbox
                      :model-value="row.push"
                      hide-details
                      density="compact"
                    />
                  </td>
                  <td class="text-center">
                    <v-checkbox
                      :model-value="row.sms"
                      hide-details
                      density="compact"
                    />
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card>

          <v-card
            id="sessions"
            rounded="xl"
            class="pa-6 settings-section settings-card"
            :class="{ 'settings-card--light': isLightTheme }"
          >
            <div class="d-flex align-center justify-space-between mb-4">
              <div class="text-h6">Sessions</div>
              <v-btn
                variant="text"
                color="primary"
                :disabled="sessions.length <= 2"
                @click="isSessionsDialogOpen = true"
                >See more</v-btn
              >
            </div>
            <v-progress-linear
              v-if="sessionsLoading"
              indeterminate
              color="primary"
              class="mb-4"
            />
            <v-alert
              v-else-if="sessionsError"
              type="error"
              variant="tonal"
              border="start"
              class="mb-4"
              :text="sessionsError"
            />
            <v-list v-else class="bg-transparent pa-0">
              <v-list-item
                v-for="session in displayedSessions"
                :key="`${session.ip}-${session.title}`"
                :prepend-icon="session.icon || 'mdi-monitor'"
                :title="session.title"
                :subtitle="`${session.city || 'Unknown'} • ${session.ip}`"
              >
                <template #append>
                  <v-chip
                    v-if="session.badge"
                    color="success"
                    size="small"
                    variant="tonal"
                    >{{ session.badge }}</v-chip
                  >
                </template>
              </v-list-item>
            </v-list>
          </v-card>

          <v-card
            id="delete-account"
            rounded="xl"
            class="pa-6 settings-section settings-card"
            :class="{ 'settings-card--light': isLightTheme }"
          >
            <div class="text-h6 mb-2">Delete account</div>
            <p class="text-body-2 text-medium-emphasis mb-4">
              You can deactivate your account temporarily or permanently delete
              all associated data.
            </p>
            <div class="d-flex ga-3 flex-wrap">
              <v-btn variant="outlined" color="warning"
                >Deactivate account</v-btn
              >
              <v-btn variant="outlined" color="error">Delete account</v-btn>
            </div>
          </v-card>
        </div>
      </template>
    </v-container>

    <v-dialog v-model="isSessionsDialogOpen" max-width="760">
      <v-card rounded="xl">
        <v-card-title class="d-flex justify-space-between align-center">
          <span>All sessions</span>
          <v-btn
            icon="mdi-close"
            variant="text"
            size="small"
            @click="isSessionsDialogOpen = false"
          />
        </v-card-title>
        <v-card-text>
          <v-list class="bg-transparent pa-0">
            <v-list-item
              v-for="session in sessions.slice().reverse()"
              :key="`${session.ip}-${session.title}-${session.badge}`"
              :prepend-icon="session.icon || 'mdi-monitor'"
              :title="session.title"
              :subtitle="`${session.city || 'Unknown'} • ${session.ip}`"
            >
              <template #append>
                <v-chip
                  v-if="session.badge"
                  color="success"
                  size="small"
                  variant="tonal"
                  >{{ session.badge }}</v-chip
                >
              </template>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
:global(html) {
  scroll-behavior: smooth;
}

.settings-section {
  scroll-margin-top: 120px;
}

.settings-card {
  background: linear-gradient(
    240deg,
    rgba(var(--v-theme-primary), 0.18) 0%,
    transparent 20%
  );
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.settings-card--light {
  background: linear-gradient(
    240deg,
    rgba(var(--v-theme-primary), 0.18) 0%,
    transparent 20%
  );
  border: 1px solid rgba(15, 23, 42, 0.1);
}

.avatar-upload {
  position: relative;
}

.avatar-upload__action {
  position: absolute;
  right: -6px;
  bottom: -6px;
}
</style>
