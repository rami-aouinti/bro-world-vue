<script setup lang="ts">
import GENERATED_RESUME_TEMPLATES from '~/data/resume-templates/generated-20-resume.json'
import { sectionRendererRegistry } from '~/modules/resume/renderers/sections/sectionRendererRegistry'

type VariantOption = { title: string; value: string }
type AddFieldType = 'text' | 'textarea' | 'date'
type AddField = { key: string; label: string; type: AddFieldType; required?: boolean }
type AddPayload = Record<string, string>

const SECTION_ADD_FIELDS: Record<string, AddField[]> = {
  experience: [
    { key: 'title', label: 'Job title', type: 'text', required: true },
    { key: 'company', label: 'Company', type: 'text', required: true },
    { key: 'startDate', label: 'Start date', type: 'date' },
    { key: 'endDate', label: 'End date', type: 'date' },
    { key: 'description', label: 'Description', type: 'textarea' },
  ],
  education: [
    { key: 'title', label: 'Degree', type: 'text', required: true },
    { key: 'school', label: 'School', type: 'text', required: true },
    { key: 'startDate', label: 'Start date', type: 'date' },
    { key: 'endDate', label: 'End date', type: 'date' },
    { key: 'location', label: 'Location', type: 'text' },
  ],
  skill: [{ key: 'title', label: 'Skill', type: 'text', required: true }],
  language: [{ key: 'title', label: 'Language', type: 'text', required: true }],
  project: [
    { key: 'title', label: 'Project', type: 'text', required: true },
    { key: 'description', label: 'Description', type: 'textarea' },
  ],
  certification: [
    { key: 'title', label: 'Certification', type: 'text', required: true },
    { key: 'issuer', label: 'Issuer', type: 'text' },
    { key: 'date', label: 'Date', type: 'date' },
  ],
  reference: [
    { key: 'title', label: 'Name', type: 'text', required: true },
    { key: 'description', label: 'Reference details', type: 'textarea' },
  ],
  hobby: [{ key: 'title', label: 'Hobby', type: 'text', required: true }],
}

const props = withDefaults(defineProps<{ sectionKey: string; variants?: VariantOption[]; currentVariant?: string; canMoveUp?: boolean; canMoveDown?: boolean; addModalTitle?: string }>(), {
  variants: () => [],
  currentVariant: '',
  canMoveUp: true,
  canMoveDown: true,
  addModalTitle: 'Add item',
})

const emit = defineEmits<{
  (event: 'change-variant', sectionKey: string, variant: string): void
  (event: 'add-item', sectionKey: string): void
  (event: 'submit-add-item', sectionKey: string, payload: AddPayload): void
  (event: 'delete-section', sectionKey: string): void
  (event: 'move-up', sectionKey: string): void
  (event: 'move-down', sectionKey: string): void
}>()


const SECTION_KEY_ALIASES: Record<string, string[]> = {
  experience: ['experience', 'experiences'],
  education: ['education', 'educations'],
  skill: ['skill', 'skills'],
  language: ['language', 'languages'],
  project: ['project', 'projects'],
  certification: ['certification', 'certifications'],
  reference: ['reference', 'references'],
  hobby: ['hobby', 'interests'],
  contact: ['contact'],
}

function normalizedSectionKey(sectionKey: string) {
  const lower = sectionKey.toLowerCase().trim()
  for (const [canonical, aliases] of Object.entries(SECTION_KEY_ALIASES)) {
    if (aliases.includes(lower)) return canonical
  }
  return lower
}

const addModalOpen = ref(false)
const selectedVariant = ref('')
const formState = ref<AddPayload>({})

const autoVariants = computed<VariantOption[]>(() => {
  const values = new Set<string>()
  const key = normalizedSectionKey(props.sectionKey)
  const aliases = SECTION_KEY_ALIASES[key] || [key]
  GENERATED_RESUME_TEMPLATES.forEach((template) => {
    aliases.forEach((alias) => {
      const variant = (template.sections || {})[alias as keyof typeof template.sections]
      if (variant) values.add(String(variant))
    })
  })
  return Array.from(values).map((value) => ({ title: value, value }))
})


const SECTION_KEY_TO_RENDERER_KEY: Record<string, keyof typeof sectionRendererRegistry> = {
  experience: 'experience',
  education: 'education',
  skill: 'skills',
  language: 'languages',
  project: 'projects',
  certification: 'certifications',
  reference: 'references',
  hobby: 'interests',
}

const registryVariants = computed<VariantOption[]>(() => {
  const key = normalizedSectionKey(props.sectionKey)
  const rendererKey = SECTION_KEY_TO_RENDERER_KEY[key]
  if (!rendererKey) return []
  const variants = Object.keys(sectionRendererRegistry[rendererKey] || {})
  return variants.map((value) => ({ title: value, value }))
})

const variantOptions = computed(() => (props.variants.length ? props.variants : (registryVariants.value.length ? registryVariants.value : autoVariants.value)))
const addFields = computed(() => SECTION_ADD_FIELDS[normalizedSectionKey(props.sectionKey)] || [{ key: 'title', label: 'Title', type: 'text', required: true }])

watch(
  () => props.currentVariant,
  (value) => { selectedVariant.value = value || variantOptions.value[0]?.value || '' },
  { immediate: true },
)

watch(addFields, (fields) => {
  const next: AddPayload = {}
  fields.forEach((field) => { next[field.key] = '' })
  formState.value = next
}, { immediate: true })

function normalizeVariantValue(value: unknown): string {
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>
    const rawValue = record.value ?? record.raw
    if (typeof rawValue === 'string' || typeof rawValue === 'number') return String(rawValue)
  }
  return ''
}

function normalizeVariantAlias(value: string): string {
  if (value === 'two-columns') return 'two-column'
  return value
}

const prettyVariantOptions = computed<VariantOption[]>(() =>
  variantOptions.value.map((option) => ({
    ...option,
    title: option.value === 'two-column' ? 'two-columns' : option.title,
  })),
)

const selectedVariantForUi = computed(() => (selectedVariant.value === 'two-column' ? 'two-columns' : selectedVariant.value))

function onVariantChange(value: unknown) {
  const nextVariant = normalizeVariantAlias(normalizeVariantValue(value))
  if (!nextVariant) return
  selectedVariant.value = nextVariant
  emit('change-variant', normalizedSectionKey(props.sectionKey), nextVariant)
}

function onSubmitAddItem() {
  const key = normalizedSectionKey(props.sectionKey)
  emit('submit-add-item', key, { ...formState.value })
  emit('add-item', key)
  addModalOpen.value = false
}
</script>

<template>
  <section class="resume-hover-section">
    <div class="resume-hover-section__header">
      <slot name="title" />
      <span class="resume-hover-section__toolbar" role="toolbar" :aria-label="`Section actions ${props.sectionKey}`">
        <AppSelect
          :model-value="selectedVariantForUi"
          :items="prettyVariantOptions"
          item-title="title"
          variant="solo"
          item-value="value"
          density="compact"
          hide-details
          class="resume-hover-section__select"
          @update:model-value="onVariantChange($event)"
        >
  <template #selection>
    <v-icon>
      mdi-earth
    </v-icon>
  </template>

  <template #item="{ props, item }">
    <v-list-item
      v-bind="props"
      :title="item.title"
    />
  </template>
</AppSelect>
        <v-btn icon="mdi-plus" size="sm" variant="text" aria-label="Add section" @click="addModalOpen = true" />
        <v-btn icon="mdi-minus" size="sm" variant="text" aria-label="Remove section" @click="emit('delete-section', props.sectionKey)" />
        <v-btn icon="mdi-arrow-down" size="sm" variant="text" aria-label="Down section" :disabled="!props.canMoveDown" @click="emit('move-down', props.sectionKey)" />
        <v-btn icon="mdi-arrow-up" size="sm" variant="text" aria-label="Up section" :disabled="!props.canMoveUp" @click="emit('move-up', props.sectionKey)" />
      </span>
    </div>
    <slot />

    <AppModal v-model="addModalOpen" :title="props.addModalTitle" max-width="720">
      <div class="resume-hover-section__form-grid py-2">
        <template v-for="field in addFields" :key="field.key">
          <v-textarea
            v-if="field.type === 'textarea'"
            v-model="formState[field.key]"
            :label="field.label"
            :required="field.required"
            rows="3"
            auto-grow
            hide-details
          />
          <v-text-field
            v-else
            v-model="formState[field.key]"
            :label="field.label"
            :required="field.required"
            :type="field.type === 'date' ? 'date' : 'text'"
            hide-details
          />
        </template>
      </div>
      <div class="d-flex justify-end ga-2 mt-2">
        <v-btn variant="text" @click="addModalOpen = false">Cancel</v-btn>
        <v-btn color="primary" @click="onSubmitAddItem">Add</v-btn>
      </div>
    </AppModal>
  </section>
</template>

<style scoped>
.resume-hover-section { display: grid; gap: 8px; }
.resume-hover-section__header { display: flex; align-items: center; }
.resume-hover-section__toolbar {
  display: inline-flex; align-items: center; gap: 0.3rem; opacity: 0; pointer-events: none;
  transform: translateX(-4px); transition: opacity .15s ease, transform .15s ease; margin: 0 20px 0.65rem;
}
.resume-hover-section__select-wrap { min-width: 170px; }
.resume-hover-section__select :deep(.v-field) { min-height: 32px; }
.resume-hover-section:hover .resume-hover-section__toolbar,
.resume-hover-section:focus-within .resume-hover-section__toolbar { opacity: 1; pointer-events: auto; transform: translateX(0); }
.resume-hover-section__form-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
@media (max-width: 720px) {
  .resume-hover-section__form-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
