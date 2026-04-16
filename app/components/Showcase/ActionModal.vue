<script setup lang="ts">
const { t } = useI18n()

const dialog = defineModel<boolean>({ default: false })

defineEmits<{
  confirm: []
}>()
</script>

<template>
  <AppModal
    v-model="dialog"
    :title="t('dashboard.showcase.modalTitle')"
    :max-width="540"
  >
    <p class="text-body-2 mb-3">
      {{ t('dashboard.showcase.modalDescription') }}
    </p>
    <v-list density="comfortable" lines="one">
      <v-list-item
        prepend-icon="mdi-check-circle-outline"
        :title="t('dashboard.showcase.modalFeatureA')"
      />
      <v-list-item
        prepend-icon="mdi-check-circle-outline"
        :title="t('dashboard.showcase.modalFeatureB')"
      />
    </v-list>

    <template #actions>
      <v-spacer />
      <v-btn variant="text" @click="dialog = false">
        {{ t('common.cancel') }}
      </v-btn>
      <v-btn color="primary" @click="$emit('confirm')">
        {{ t('dashboard.showcase.modalAction') }}
      </v-btn>
    </template>
  </AppModal>
</template>
