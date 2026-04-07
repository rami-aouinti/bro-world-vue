<script setup lang="ts">
const props = withDefaults(defineProps<{
  mode?: 'comment' | 'reply'
  loading?: boolean
  placeholder?: string
}>(), {
  mode: 'comment',
  loading: false,
  placeholder: '',
})

const emit = defineEmits<{
  submit: [content: string]
  cancel: []
}>()

const content = ref('')
const { user } = useUserSession()
const { t } = useI18n()

const actionLabel = computed(() => props.mode === 'reply' ? t('blog.comment.actions.reply') : t('blog.comment.actions.comment'))
const isCommentMode = computed(() => props.mode === 'comment')
const canSubmit = computed(() => content.value.trim().length > 0 && !props.loading)
const userAvatar = computed(() => user.value?.photo || null)
const resolvedPlaceholder = computed(() => props.placeholder || t('blog.comment.placeholders.commentAsUser'))

const quickActions = [
  'mdi-star-outline',
  'mdi-emoticon-happy-outline',
  'mdi-emoticon-outline',
  'mdi-camera-outline',
  'mdi-gif',
  'mdi-sticker-emoji',
]

function onSubmit() {
  const value = content.value.trim()

  if (!value || props.loading) {
    return
  }

  emit('submit', value)
  content.value = ''
}

function onEnter(event: KeyboardEvent) {
  if (event.shiftKey) {
    return
  }

  event.preventDefault()
  onSubmit()
}
</script>

<template>
  <div v-if="isCommentMode" class="comment-composer d-flex align-start ga-2">
    <v-avatar size="34" color="grey-darken-2">
      <v-img v-if="userAvatar" :src="userAvatar" cover />
      <v-icon v-else icon="mdi-account" />
    </v-avatar>

    <div class="composer-shell">
      <v-textarea
        v-model="content"
        :placeholder="resolvedPlaceholder"
        rows="1"
        auto-grow
        variant="plain"
        flat
        hide-details
        class="comment-input"
        @keydown.enter="onEnter"
      />

      <div class="composer-tools">
        <div class="d-flex align-center ga-1">
          <v-btn
            v-for="icon in quickActions"
            :key="icon"
            :icon="icon"
            size="small"
            variant="text"
            color="grey-lighten-1"
            class="tool-btn"
          />
        </div>

        <v-btn
          :icon="canSubmit ? 'mdi-send' : 'mdi-send-outline'"
          size="small"
          variant="text"
          :color="canSubmit ? 'primary' : 'grey-lighten-1'"
          :disabled="!canSubmit"
          @click="onSubmit"
        />
      </div>
    </div>
  </div>

  <div v-else class="d-flex flex-column ga-2">
    <v-textarea
      v-model="content"
      :placeholder="resolvedPlaceholder"
      rows="2"
      auto-grow
      variant="solo"
      flat
      hide-details
      class="comment-input"
    />

    <div class="d-flex ga-2 justify-end">
      <v-btn variant="text" :disabled="loading" @click="emit('cancel')">
        {{ t('common.cancel') }}
      </v-btn>
      <v-btn color="primary" :loading="loading" @click="onSubmit">
        {{ actionLabel }}
      </v-btn>
    </div>
  </div>
</template>

<style scoped>
.comment-input :deep(.v-field) {
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.1);
}

.comment-composer {
  width: 100%;
}

.avatar-wrap {
  position: relative;
}

.status-dot {
  position: absolute;
  right: -3px;
  bottom: -3px;
  width: 16px;
  height: 16px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(45, 48, 55, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.composer-shell {
  flex: 1;
  border-radius: 24px;
  padding: 0.45rem 0.7rem 0.35rem;
  background: rgba(55, 57, 65, 0.92);
}

.composer-shell .comment-input :deep(.v-field) {
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}

.composer-tools {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.15rem;
}

.tool-btn {
  opacity: 0.82;
}
</style>
