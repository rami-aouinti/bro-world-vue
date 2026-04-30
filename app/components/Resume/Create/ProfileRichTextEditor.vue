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

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const selectedSize = ref('16px')
const selectedColor = ref('#1f3b68')

const editor = useEditor({
  extensions: [StarterKit],
  content: props.modelValue || '<p></p>',
  editorProps: { attributes: { class: 'profile-editor__content' } },
  onUpdate: ({ editor }) =>
    emit('update:modelValue', editor.getText({ blockSeparator: '\n' })),
})

watch(
  () => props.modelValue,
  (nextValue) => {
    if (!editor.value) return
    const current = editor.value.getText({ blockSeparator: '\n' })
    if (current !== nextValue)
      editor.value.commands.setContent(nextValue || '<p></p>')
  },
)

const isEmpty = computed(
  () => !props.modelValue || props.modelValue === '<p></p>',
)
</script>

<template>
  <div class="profile-editor">
    <label class="text-body-2 mb-2 d-inline-block">{{ label }}</label>
    <div class="profile-editor__toolbar">
      <v-btn
        size="small"
        variant="text"
        :active="editor?.isActive('bold')"
        @click="editor?.chain().focus().toggleBold().run()"
        >B</v-btn
      >
      <v-btn
        size="small"
        variant="text"
        :active="editor?.isActive('italic')"
        @click="editor?.chain().focus().toggleItalic().run()"
        >I</v-btn
      >
      <v-btn
        size="small"
        variant="text"
        :active="editor?.isActive('strike')"
        @click="editor?.chain().focus().toggleStrike().run()"
        >S</v-btn
      >
      <v-btn
        size="small"
        variant="text"
        :active="editor?.isActive('bulletList')"
        @click="editor?.chain().focus().toggleBulletList().run()"
        >• List</v-btn
      >
      <v-btn
        size="small"
        variant="text"
        :active="editor?.isActive('orderedList')"
        @click="editor?.chain().focus().toggleOrderedList().run()"
        >1. List</v-btn
      >
      <v-btn
        size="small"
        variant="text"
        @click="editor?.chain().focus().undo().run()"
        >↶</v-btn
      >
      <v-btn
        size="small"
        variant="text"
        @click="editor?.chain().focus().redo().run()"
        >↷</v-btn
      >
      <v-select
        v-model="selectedSize"
        :items="['14px', '16px', '18px', '20px', '24px']"
        density="compact"
        hide-details
        variant="outlined"
        class="editor-select"
        label="Size"
      />
      <v-select
        v-model="selectedColor"
        :items="[
          '#1f3b68',
          '#0f172a',
          '#2563eb',
          '#16a34a',
          '#dc2626',
          '#7c3aed',
        ]"
        density="compact"
        hide-details
        variant="outlined"
        class="editor-select"
        label="Color"
      />
    </div>
    <div
      class="profile-editor__surface"
      :class="{ 'profile-editor__surface--empty': isEmpty }"
      :style="{
        '--editor-font-size': selectedSize,
        '--editor-color': selectedColor,
      }"
    >
      <EditorContent :editor="editor" />
      <span v-if="isEmpty" class="profile-editor__placeholder">{{
        placeholder
      }}</span>
    </div>
  </div>
</template>

<style scoped>
.profile-editor__toolbar {
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
  flex-wrap: wrap;
  align-items: center;
}
.editor-select {
  max-width: 120px;
}
.profile-editor__surface {
  position: relative;
  border: 1px solid rgba(120, 120, 120, 0.5);
  border-radius: 8px;
  min-height: 140px;
  padding: 10px;
}
.profile-editor__placeholder {
  position: absolute;
  top: 12px;
  left: 12px;
  color: rgba(120, 120, 120, 0.8);
  pointer-events: none;
}
:deep(.profile-editor__content) {
  min-height: 110px;
  outline: none;
  font-size: var(--editor-font-size, 16px);
  color: var(--editor-color, #1f3b68);
}
</style>
