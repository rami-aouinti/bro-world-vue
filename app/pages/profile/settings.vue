<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const { t } = useI18n()
const { isPageSkeletonVisible } = usePageSkeleton()

definePageMeta({
  title: 'appbar.settings',
  middleware: 'auth',
})

const settingsSections = [
  { id: 'profile', label: 'Profile', icon: 'mdi-account-circle-outline' },
  { id: 'basic-info', label: 'Basic info', icon: 'mdi-card-account-details-outline' },
  { id: 'change-password', label: 'Change password', icon: 'mdi-lock-reset' },
  { id: 'two-fa', label: '2FA', icon: 'mdi-shield-key-outline' },
  { id: 'accounts', label: 'Accounts', icon: 'mdi-link-variant' },
  { id: 'notifications', label: 'Notifications', icon: 'mdi-bell-outline' },
  { id: 'sessions', label: 'Sessions', icon: 'mdi-monitor-cellphone' },
  { id: 'delete-account', label: 'Delete account', icon: 'mdi-alert-outline' },
]

const profile = {
  name: 'Alexandre Martin',
  role: 'Product Designer',
  avatar: 'https://i.pravatar.cc/160?img=13',
  visible: true,
}

const basicInfoFields = [
  { key: 'firstName', label: 'First name', value: 'Alexandre' },
  { key: 'lastName', label: 'Last name', value: 'Martin' },
  { key: 'birthDate', label: 'Birth date', value: '1993-05-12' },
  { key: 'email', label: 'Email', value: 'alexandre.martin@example.com' },
  { key: 'phone', label: 'Phone', value: '+1 202 555 0189' },
  { key: 'location', label: 'Location', value: 'San Francisco, CA' },
  { key: 'company', label: 'Company', value: 'Bro World Inc.' },
  { key: 'timezone', label: 'Timezone', value: 'UTC-08:00 (Pacific Time)' },
]

const passwordRequirements = [
  'At least 8 characters',
  'One uppercase letter',
  'One number and one special character',
]

const twoFaActions = [
  { title: 'Authenticator app', subtitle: 'Add or edit your OTP app', action: 'Setup' },
  { title: 'Recovery codes', subtitle: 'Generate new backup codes', action: 'Regenerate' },
  { title: 'SMS fallback', subtitle: 'Edit your backup phone number', action: 'Edit' },
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

const scrollToSection = (sectionId: string) => {
  activeSection.value = sectionId
  document.getElementById(sectionId)?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  })
}

const updateActiveSection = () => {
  const scrollOffset = 140
  let currentSection = settingsSections[0]?.id ?? ''

  for (const section of settingsSections) {
    const element = document.getElementById(section.id)

    if (!element) continue

    if (element.getBoundingClientRect().top - scrollOffset <= 0) {
      currentSection = section.id
      continue
    }

    break
  }

  activeSection.value = currentSection
}

onMounted(() => {
  updateActiveSection()
  window.addEventListener('scroll', updateActiveSection, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', updateActiveSection)
})
</script>

<template>
  <div>
    <AppPageDrawers>
      <template #left>
        <SkeletonDrawerLeft v-if="isPageSkeletonVisible" />
        <ProfileDrawer v-else />
      </template>
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
    </AppPageDrawers>

    <v-container fluid>
      <SkeletonPageContent v-if="isPageSkeletonVisible" />
      <template v-else>
        <h1 class="text-h4 mb-2">{{ t('appbar.settings') }}</h1>
        <p class="text-body-1 text-medium-emphasis mb-6">
          {{ t('pages.profileOverview.settingsSubtitle') }}
        </p>

        <v-card rounded="xl" class="mb-6 pa-4">
          <div class="text-subtitle-1 font-weight-medium mb-3">Jump to section</div>
          <div class="d-flex flex-wrap ga-2">
            <v-chip
              v-for="section in settingsSections"
              :key="section.id"
              :href="`#${section.id}`"
              prepend-icon="mdi-link-variant"
              variant="tonal"
            >
              <v-icon start :icon="section.icon" />
              {{ section.label }}
            </v-chip>
          </div>
        </v-card>

        <div class="d-flex flex-column ga-6">
          <v-card id="profile" rounded="xl" class="pa-6 settings-section">
            <div class="d-flex align-center justify-space-between flex-wrap ga-4">
              <div class="d-flex align-center ga-4">
                <v-avatar size="72" :image="profile.avatar" />
                <div>
                  <div class="text-h6">{{ profile.name }}</div>
                  <div class="text-body-2 text-medium-emphasis">{{ profile.role }}</div>
                </div>
              </div>
              <div class="d-flex align-center ga-2">
                <span class="text-body-2">Visible profile</span>
                <v-switch v-model="profile.visible" color="primary" hide-details inset />
              </div>
            </div>
          </v-card>

          <v-card id="basic-info" rounded="xl" class="pa-6 settings-section">
            <div class="text-h6 mb-4">Basic information</div>
            <v-row>
              <v-col v-for="field in basicInfoFields" :key="field.key" cols="12" md="6">
                <v-text-field :label="field.label" :model-value="field.value" variant="outlined" hide-details />
              </v-col>
            </v-row>
            <div class="mt-4">
              <v-btn color="primary">Save changes</v-btn>
            </div>
          </v-card>

          <v-card id="change-password" rounded="xl" class="pa-6 settings-section">
            <div class="text-h6 mb-4">Change password</div>
            <v-row>
              <v-col cols="12" md="4">
                <v-text-field label="Current password" type="password" variant="outlined" hide-details />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field label="New password" type="password" variant="outlined" hide-details />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field label="Confirm password" type="password" variant="outlined" hide-details />
              </v-col>
            </v-row>
            <v-list density="compact" class="bg-transparent px-0">
              <v-list-item v-for="item in passwordRequirements" :key="item" prepend-icon="mdi-check-circle-outline" :title="item" />
            </v-list>
            <v-btn color="primary">Update password</v-btn>
          </v-card>

          <v-card id="two-fa" rounded="xl" class="pa-6 settings-section">
            <div class="text-h6 mb-4">Two-factor authentication</div>
            <v-list lines="two" class="pa-0">
              <v-list-item
                v-for="item in twoFaActions"
                :key="item.title"
                :title="item.title"
                :subtitle="item.subtitle"
                append-icon="mdi-chevron-right"
              >
                <template #append>
                  <v-btn size="small" variant="text" color="primary">{{ item.action }}</v-btn>
                </template>
              </v-list-item>
            </v-list>
          </v-card>

          <v-card id="accounts" rounded="xl" class="pa-6 settings-section">
            <div class="text-h6 mb-4">Connected accounts</div>
            <v-list class="pa-0 mb-4">
              <v-list-item v-for="item in accountProviders" :key="item.provider" :title="item.provider" :subtitle="item.email">
                <template #append>
                  <v-switch :model-value="item.connected" hide-details inset color="primary" />
                </template>
              </v-list-item>
            </v-list>

            <v-alert type="info" variant="tonal" border="start" title="Connected account">
              Your Google account is currently used as your primary connected account.
            </v-alert>
          </v-card>

          <v-card id="notifications" rounded="xl" class="pa-6 settings-section">
            <div class="text-h6 mb-4">Notifications</div>
            <v-table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th class="text-center">Activity</th>
                  <th class="text-center">Email</th>
                  <th class="text-center">Push</th>
                  <th class="text-center">SMS</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in notificationRows" :key="row.title">
                  <td>{{ row.title }}</td>
                  <td class="text-center"><v-checkbox :model-value="row.activity" hide-details density="compact" /></td>
                  <td class="text-center"><v-checkbox :model-value="row.email" hide-details density="compact" /></td>
                  <td class="text-center"><v-checkbox :model-value="row.push" hide-details density="compact" /></td>
                  <td class="text-center"><v-checkbox :model-value="row.sms" hide-details density="compact" /></td>
                </tr>
              </tbody>
            </v-table>
          </v-card>

          <v-card id="sessions" rounded="xl" class="pa-6 settings-section">
            <div class="d-flex align-center justify-space-between mb-4">
              <div class="text-h6">Sessions</div>
              <v-btn variant="text" color="primary">See more</v-btn>
            </div>
            <v-list class="pa-0">
              <v-list-item
                v-for="session in sessions"
                :key="session.device"
                :title="session.device"
                :subtitle="`${session.location} • ${session.lastSeen}`"
              >
                <template #append>
                  <v-chip v-if="session.active" color="success" size="small">Active</v-chip>
                </template>
              </v-list-item>
            </v-list>
          </v-card>

          <v-card id="delete-account" rounded="xl" class="pa-6 settings-section">
            <div class="text-h6 mb-2">Delete account</div>
            <p class="text-body-2 text-medium-emphasis mb-4">
              You can deactivate your account temporarily or permanently delete all associated data.
            </p>
            <div class="d-flex ga-3 flex-wrap">
              <v-btn variant="outlined" color="warning">Deactivate account</v-btn>
              <v-btn color="error">Delete account</v-btn>
            </div>
          </v-card>
        </div>
      </template>
    </v-container>
  </div>
</template>

<style scoped>
.settings-section {
  scroll-margin-top: 120px;
}
</style>
