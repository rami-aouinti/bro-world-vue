<script setup lang="ts">
import { computed, watch } from 'vue'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'

const props = withDefaults(
  defineProps<{
    modelValue: string
    label?: string
    placeholder?: string
  }>(),
  {
    label: 'Profile summary',
    placeholder: 'Tell recruiters about your profile...',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const editor = useEditor({
  extensions: [StarterKit],
  content: props.modelValue || '<p></p>',
  editorProps: {
    attributes: {
      class: 'profile-editor__content',
    },
  },
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getText({ blockSeparator: '\n' }))
  },
})

watch(
  () => props.modelValue,
  (nextValue) => {
    if (!editor.value) return
    const current = editor.value.getText({ blockSeparator: '\n' })
    if (current !== nextValue) {
      editor.value.commands.setContent(nextValue || '<p></p>')
    }
  },
)

const isEmpty = computed(() => !props.modelValue || props.modelValue === '<p></p>')
</script>

<template>
  <div class="profile-editor">
    <label class="text-body-2 mb-2 d-inline-block">{{ label }}</label>
    <div class="profile-editor__toolbar">
      <v-btn size="small" variant="text" :active="editor?.isActive('bold')" @click="editor?.chain().focus().toggleBold().run()">B</v-btn>
      <v-btn size="small" variant="text" :active="editor?.isActive('italic')" @click="editor?.chain().focus().toggleItalic().run()">I</v-btn>
      <v-btn size="small" variant="text" :active="editor?.isActive('bulletList')" @click="editor?.chain().focus().toggleBulletList().run()">• List</v-btn>
    </div>
    <div class="profile-editor__surface" :class="{ 'profile-editor__surface--empty': isEmpty }">
      <EditorContent :editor="editor" />
      <span v-if="isEmpty" class="profile-editor__placeholder">{{ placeholder }}</span>
    </div>
  </div>
</template>

<style scoped>
.profile-editor__toolbar { display: flex; gap: 6px; margin-bottom: 8px; }
.profile-editor__surface { position: relative; border: 1px solid rgba(120,120,120,.5); border-radius: 8px; min-height: 140px; padding: 10px; }
.profile-editor__placeholder { position: absolute; top: 12px; left: 12px; color: rgba(120,120,120,.8); pointer-events: none; }
:deep(.profile-editor__content) { min-height: 110px; outline: none; }
</style>
