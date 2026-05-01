<script setup lang="ts">
const STORAGE_KEY = 'app-cookie-consent'

type CookieConsentChoice = 'accepted' | 'rejected'

const isOpen = ref(false)
const { t } = useI18n()

const saveChoice = (choice: CookieConsentChoice) => {
  localStorage.setItem(STORAGE_KEY, choice)
  isOpen.value = false
}

const closeWithoutChoice = () => {
  isOpen.value = false
}

onMounted(() => {
  const existingChoice = localStorage.getItem(STORAGE_KEY)
  isOpen.value = !existingChoice
})
</script>

<template>
  <v-dialog
    v-model="isOpen"
    max-width="920"
    persistent
    aria-labelledby="cookie-consent-title"
    aria-describedby="cookie-consent-description"
  >
    <v-card class="pa-4 pa-sm-8">
      <v-card-title
        id="cookie-consent-title"
        class="text-wrap text-h4 font-weight-bold pb-4"
      >
        🍪 {{ t('app.cookieConsent.title') }}
      </v-card-title>

      <v-card-text
        id="cookie-consent-description"
        class="text-body-1 text-sm-h6 pb-6"
      >
        {{ t('app.cookieConsent.description') }}
      </v-card-text>

      <v-card-actions class="ga-3 justify-end flex-wrap">
        <v-btn variant="text" color="primary" @click="closeWithoutChoice">
          {{ t('app.cookieConsent.customize') }}
        </v-btn>

        <v-btn variant="flat" color="primary" @click="saveChoice('rejected')">
          {{ t('app.cookieConsent.rejectAll') }}
        </v-btn>

        <v-btn
          variant="outlined"
          color="primary"
          @click="saveChoice('accepted')"
        >
          {{ t('app.cookieConsent.acceptAll') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
