<script setup lang="ts">
import { computed, watch } from 'vue'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { Extension } from '@tiptap/core'

const FontSize = Extension.create({
  name: 'fontSize',
  addGlobalAttributes() {
    return [
      {
        types: ['textStyle'],
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize || null,
            renderHTML: (attributes) => {
              if (!attributes.fontSize) return {}
              return { style: `font-size: ${attributes.fontSize}` }
            },
          },
          fontWeight: {
            default: null,
            parseHTML: (element) => element.style.fontWeight || null,
            renderHTML: (attributes) => {
              if (!attributes.fontWeight) return {}
              return { style: `font-weight: ${attributes.fontWeight}` }
            },
          },
        },
      },
    ]
  },
})

const props = withDefaults(
  defineProps<{ modelValue: string; label?: string; placeholder?: string; fontSize?: string; color?: string; fontWeight?: string | number; fontFamily?: string }>(),
  {
    label: '',
    placeholder: 'Write here...',
    fontSize: '',
    color: '',
    fontWeight: '400',
    fontFamily: '',
  },
)

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

function clearContent() {
  editor.value?.commands.clearContent()
  emit('update:modelValue', '')
}

function addLineBreak() {
  editor.value?.chain().focus().setHardBreak().run()
}

function removeLastLineBreak() {
  const current = editor.value?.getText({ blockSeparator: '\n' }) || ''
  const next = current.replace(/\n+$/, '')
  editor.value?.commands.setContent(next || '<p></p>')
  emit('update:modelValue', next)
}

function onDragStart(event: DragEvent) {
  const dataTransfer = event.dataTransfer
  if (!dataTransfer) return
  dataTransfer.setData('application/x-resume-editor-id', editorInstanceId)
  dataTransfer.effectAllowed = 'move'
  dataTransfer.setDragImage((event.currentTarget as HTMLElement), 10, 10)
}

function onDrop(event: DragEvent) {
  event.preventDefault()
  const sourceId = event.dataTransfer?.getData('application/x-resume-editor-id')
  if (!sourceId || sourceId === editorInstanceId) return

  const sourceElement = document.querySelector<HTMLElement>(`[data-editor-id="${sourceId}"]`)
  const targetElement = rootElement.value

  if (!sourceElement || !targetElement || !targetElement.parentElement || sourceElement === targetElement) return

  targetElement.parentElement.insertBefore(sourceElement, targetElement.nextSibling)
}
const editorInstanceId = `hover-editor-${Math.random().toString(36).slice(2, 11)}`
const rootElement = ref<HTMLElement | null>(null)
const hover = ref(false)
const selectedColor = ref('#0f172a')
const selectedSize = ref('24px')

const editor = useEditor({
  extensions: [StarterKit, TextStyle, Color, FontSize],
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

watch(() => props.fontSize, (value) => {
  if (!value) return
  selectedSize.value = value
  editor.value?.chain().focus().selectAll().setMark('textStyle', { fontSize: value }).run()
}, { immediate: true })

watch(() => props.color, (value) => {
  if (!value) return
  selectedColor.value = value
  editor.value?.chain().focus().selectAll().setColor(value).run()
}, { immediate: true })

watch(() => props.fontWeight, (value) => {
  if (!value) return
  editor.value?.chain().focus().selectAll().setMark('textStyle', { fontWeight: String(value) }).run()
}, { immediate: true })
</script>

<template>
  <div
    ref="rootElement"
    class="hover-editor"
    :data-editor-id="editorInstanceId"
    @mouseenter="hover = true"
    @mouseleave="hover = false"
    @dragover.prevent
    @drop="onDrop"
  >
    <label v-if="label" class="text-body-2 mb-2 d-inline-block">{{ label }}</label>
    <div v-show="hover" class="hover-editor__toolbar">
      <input
        v-model="selectedColor"
        type="color"
        class="toolbar-color"
        @input="editor?.chain().focus().setColor(selectedColor).run()"
      >
      <select
        v-model="selectedSize"
        class="toolbar-size"
        @change="editor?.chain().focus().selectAll().setMark('textStyle', { fontSize: selectedSize }).run()"
      >
        <option value="16px">16</option>
        <option value="18px">18</option>
        <option value="20px">20</option>
        <option value="24px">24</option>
        <option value="28px">28</option>
        <option value="32px">32</option>
        <option value="40px">40</option>
        <option value="48px">48</option>
        <option value="64px">64</option>
        <option value="96px">96</option>
        <option value="128px">128</option>
      </select>
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
      <v-btn size="x-small" variant="text" icon="mdi-trash-can-outline" @click="clearContent" />
      <v-btn size="x-small" variant="text" icon="mdi-arrow-up" @click="removeLastLineBreak" />
      <v-btn size="x-small" variant="text" icon="mdi-arrow-down" @click="addLineBreak" />
      <v-btn size="x-small" variant="text" icon="mdi-drag" class="toolbar-drag" draggable="true" @dragstart="onDragStart" />
    </div>
    <div
      class="hover-editor__surface"
      :class="{ 'hover-editor__surface--empty': isEmpty }"
      :style="{ '--editor-font-size': props.fontSize || selectedSize, '--editor-color': props.color || selectedColor, '--editor-font-weight': String(props.fontWeight || '400'), '--editor-font-family': props.fontFamily || 'inherit' }"
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
  padding: 2px 0;
  margin-bottom: 6px;
  align-items: center;
}
.toolbar-color { width: 28px; height: 24px; border: 0; background: transparent; padding: 0; }
.toolbar-size { border: 1px solid rgba(120,120,120,.4); border-radius: 6px; font-size: 12px; padding: 2px 4px; }
.hover-editor__surface {
  position: relative;
  border: 1px solid transparent;
  border-radius: 10px;
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
  outline: none;
  color: var(--editor-color);
  font-size: var(--editor-font-size);
  font-weight: var(--editor-font-weight);
  font-family: var(--editor-font-family);
}
:deep(.hover-editor__content p) {
  font-family: var(--editor-font-family);
}
.toolbar-drag { cursor: grab; }
.toolbar-drag:active { cursor: grabbing; }

</style>
