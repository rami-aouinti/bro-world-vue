<script setup lang="ts">
const { t } = useI18n()

const dialog = ref(false)
const confirmed = ref(false)
let resolve: (value: boolean) => void
const message = ref('')
watch(dialog, (v) => {
  if (!v) {
    resolve(confirmed.value)
  }
})
function open(text: string) {
  confirmed.value = false
  dialog.value = true
  message.value = text
  return new Promise<boolean>((resolveFn) => {
    resolve = resolveFn
  })
}
function confirm() {
  confirmed.value = true
  dialog.value = false
}
function cancel() {
  confirmed.value = false
  dialog.value = false
}
defineExpose({ open })
</script>

<template>
  <AppModal v-model="dialog" :title="t('common.confirm')" max-width="400px">
    <div class="font-weight-bold d-flex align-center">
      <v-icon class="mr-2" color="warning" icon="$warning" />
      <span>{{ message }}</span>
    </div>

    <template #actions>
      <v-spacer />
      <v-btn color="primary" @click="cancel">
        {{ t('common.cancel') }}
      </v-btn>
      <v-btn color="primary" @click="confirm">
        {{ t('common.confirm') }}
      </v-btn>
      <v-spacer />
    </template>
  </AppModal>
</template>
