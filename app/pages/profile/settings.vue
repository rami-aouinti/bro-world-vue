<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { storeToRefs } from 'pinia'

const { isPageSkeletonVisible } = usePageSkeleton()
const theme = useTheme()
const isLightTheme = computed(() => !theme.current.value.dark)
const profileStore = useProfileStore()

definePageMeta({
  title: 'appbar.settings',
  middleware: 'auth',
})
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

const fullName = computed(() => {
  const user = userProfile.value
  if (!user) return ''

  return (
    [user.firstName, user.lastName].filter(Boolean).join(' ') ||
    profile.value?.username ||
    ''
  )
})

const profileTitle = computed(() => userProfile.value?.title || 'Member')

const basicInfoFields = computed(() => [
  {
    key: 'firstName',
    label: 'First name',
    value: profile.value?.firstName || '',
  },
  { key: 'lastName', label: 'Last name', value: profile.value?.lastName || '' },
  {
    key: 'birthDate',
    label: 'Birth date',
    value: userProfile.value?.birthDate || '',
  },
  { key: 'email', label: 'Email', value: profile.value?.email || '' },
  { key: 'phone', label: 'Phone', value: userProfile.value?.phone || '' },
  {
    key: 'location',
    label: 'Location',
    value: userProfile.value?.location || '',
  },
  { key: 'company', label: 'Company', value: userProfile.value?.company || '' },
  {
    key: 'timezone',
    label: 'Timezone',
    value: userProfile.value?.timezone || '',
  },
])

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

const sessions = [
  {
    device: 'MacBook Pro • Chrome',
    location: 'San Francisco, United States',
    lastSeen: 'Active now',
    active: true,
  },
  {
    device: 'iPhone 15 • Safari',
    location: 'San Francisco, United States',
    lastSeen: '2 hours ago',
    active: false,
  },
  {
    device: 'Windows PC • Edge',
    location: 'Seattle, United States',
    lastSeen: 'Yesterday',
    active: false,
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
        <v-list nav density="comfortable" class="bg-transparent">
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
                <v-avatar size="72" :image="profile?.photo" />
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
                  :model-value="field.value"
                  variant="outlined"
                  hide-details
                />
              </v-col>
            </v-row>
            <div class="mt-4">
              <v-btn variant="outlined" color="primary">Save changes</v-btn>
            </div>
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
              <v-btn variant="text" color="primary">See more</v-btn>
            </div>
            <v-list class="bg-transparent pa-0">
              <v-list-item
                v-for="session in sessions"
                :key="session.device"
                :title="session.device"
                :subtitle="`${session.location} • ${session.lastSeen}`"
              >
                <template #append>
                  <v-chip v-if="session.active" color="success" size="small"
                    >Active</v-chip
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
</style>
