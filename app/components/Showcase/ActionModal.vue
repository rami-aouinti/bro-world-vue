<script setup lang="ts">
const { t } = useI18n()

const dialog = defineModel<boolean>({ default: false })

defineEmits<{
  confirm: []
}>()
</script>

<template>
  <v-dialog v-model="dialog" max-width="540">
    <v-card>
      <v-card-title class="d-flex align-center ga-2">
        <v-icon icon="mdi-rocket-launch-outline" color="primary" />
        {{ t('dashboard.showcase.modalTitle') }}
      </v-card-title>
      <v-card-text>
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
      </v-card-text>
      <v-card-actions class="px-6 pb-5">
        <v-spacer />
        <v-btn variant="text" @click="dialog = false">
          {{ t('common.cancel') }}
        </v-btn>
        <v-btn color="primary" @click="$emit('confirm')">
          {{ t('dashboard.showcase.modalAction') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
