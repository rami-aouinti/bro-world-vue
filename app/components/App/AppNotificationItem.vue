<script setup lang="ts">
import type { Notification } from '~/stores/notification'
import { formatDateTime } from '~/utils/formatDateTime'

const props = defineProps<{
  timeout: number
  notification: Notification
}>()
const emit = defineEmits(['close'])
const isShow = defineModel<boolean>({ default: false })
const timeout = toRef(props, 'timeout')
const { start, stop } = useTimeoutFn(() => (isShow.value = false), timeout, {
  immediate: false,
})
watch(timeout, (v) => (v !== -1 ? start() : stop()), { immediate: true })
const { locale } = useI18n()
const variant = computed(() => timeout.value === -1)
const notificationTitle = computed(() =>
  formatDateTime(locale.value, props.notification.time),
)
</script>

<template>
  <v-alert
    :border="variant ? 'start' : false"
    :variant="variant ? 'outlined' : undefined"
    :density="variant ? 'compact' : undefined"
    :theme="variant ? undefined : 'dark'"
    :elevation="variant ? 0 : 3"
    :type="notification.type"
    :text="notification.text"
    :title="notificationTitle"
  >
    <template #close>
      <v-btn
        icon="$close"
        aria-label="Close notification"
        @click="emit('close')"
      />
    </template>
  </v-alert>
</template>

<style scoped>
:deep(.v-alert-title) {
  line-height: 1.25rem;
  font-size: 14px;
  font-weight: 300;
}
</style>
