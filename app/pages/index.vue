<script setup lang="ts">
const { t } = useI18n()

const name = ref('')
function sayHi() {
  Notify.success(t('notification.greeting', { name: name.value }))
}
function warning() {
  Notify.warning(t('notification.warningRefuse', { name: name.value }))
}
</script>

<template>
  <v-container fluid class="d-flex align-center justify-center fill-height">
    <div class="text-center">
      <v-icon
        icon="custom:vitify-nuxt"
        size="3em"
        color="primary"
        class="mb-4"
      />
      <p>{{ t('dashboard.caption') }}</p>
      <v-text-field
        v-model="name"
        max-width="300"
        :placeholder="t('common.helloWorld')"
        :label="t('common.whatsYourName')"
        class="mt-8"
      />
      <v-btn :disabled="!name" class="mr-2" color="primary" @click="sayHi">
        {{ t('common.confirm') }}
      </v-btn>
      <v-btn :disabled="!name" @click="warning"> {{ t('common.cancel') }} </v-btn>
    </div>
  </v-container>
</template>
