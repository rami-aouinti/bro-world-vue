<script setup lang="ts">
import { computed, watch } from 'vue'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'

const props = withDefaults(
  defineProps<{ modelValue: string; label?: string; placeholder?: string }>(),
  {
    label: 'Text',
    placeholder: 'Write here...',
  },
)

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const hover = ref(false)

const editor = useEditor({
  extensions: [StarterKit],
  content: props.modelValue || '<p></p>',
  editorProps: { attributes: { class: 'hover-editor__content' } },
  onUpdate: ({ editor }) =>
    emit('update:modelValue', editor.getText({ blockSeparator: '\n' })),
})

watch(
  () => props.modelValue,
  (value) => {
    if (!editor.value) return
    const current = editor.value.getText({ blockSeparator: '\n' })
    if (current !== value) editor.value.commands.setContent(value || '<p></p>')
  },
)

const isEmpty = computed(() => !props.modelValue)
</script>

<template>
  <div
    class="hover-editor"
    @mouseenter="hover = true"
    @mouseleave="hover = false"
  >
    <label class="text-body-2 mb-2 d-inline-block">{{ label }}</label>
    <div v-show="hover" class="hover-editor__toolbar">
      <v-btn
        size="x-small"
        variant="text"
        :active="editor?.isActive('bold')"
        @click="editor?.chain().focus().toggleBold().run()"
        >B</v-btn
      >
      <v-btn
        size="x-small"
        variant="text"
        :active="editor?.isActive('italic')"
        @click="editor?.chain().focus().toggleItalic().run()"
        >I</v-btn
      >
      <v-btn
        size="x-small"
        variant="text"
        :active="editor?.isActive('bulletList')"
        @click="editor?.chain().focus().toggleBulletList().run()"
        >•</v-btn
      >
    </div>
    <div
      class="hover-editor__surface"
      :class="{ 'hover-editor__surface--empty': isEmpty }"
    >
      <EditorContent :editor="editor" />
      <span v-if="isEmpty" class="hover-editor__placeholder">{{
        placeholder
      }}</span>
    </div>
  </div>
</template>

<style scoped>
.hover-editor__toolbar {
  display: flex;
  gap: 4px;
  margin-bottom: 6px;
}
.hover-editor__surface {
  position: relative;
  border: 1px solid transparent;
  border-radius: 10px;
  min-height: 100px;
  padding: 10px;
  transition: border-color .15s ease;
}
.hover-editor:hover .hover-editor__surface,
.hover-editor__surface:focus-within {
  border-color: rgba(120, 120, 120, 0.45);
}
.hover-editor__placeholder {
  position: absolute;
  top: 10px;
  left: 12px;
  color: rgba(120, 120, 120, 0.7);
  pointer-events: none;
}
:deep(.hover-editor__content) {
  min-height: 78px;
  outline: none;
}
</style>
