<script setup lang="ts">
type VariantOption = { title: string; value: string }

const props = withDefaults(
  defineProps<{
    sectionKey: string
    variants?: VariantOption[]
    currentVariant?: string
    canMoveUp?: boolean
    canMoveDown?: boolean
    addModalTitle?: string
  }>(),
  {
    variants: () => [],
    currentVariant: '',
    canMoveUp: true,
    canMoveDown: true,
    addModalTitle: 'Add item',
  },
)

const emit = defineEmits<{
  (event: 'change-variant', sectionKey: string, variant: string): void
  (event: 'add-item', sectionKey: string): void
  (event: 'delete-section', sectionKey: string): void
  (event: 'move-up', sectionKey: string): void
  (event: 'move-down', sectionKey: string): void
}>()

const variantMenuOpen = ref(false)
const addModalOpen = ref(false)

function onSelectVariant(variant: string) {
  emit('change-variant', props.sectionKey, variant)
  variantMenuOpen.value = false
}

function onSubmitAddItem() {
  emit('add-item', props.sectionKey)
  addModalOpen.value = false
}
</script>

<template>
  <section class="resume-hover-section">
    <div class="resume-hover-section__header">
      <slot name="title" />
      <span
        class="resume-hover-section__toolbar"
        role="toolbar"
        :aria-label="`Section actions ${props.sectionKey}`"
      >
        <v-menu
          v-if="props.variants.length"
          v-model="variantMenuOpen"
          location="bottom"
          content-class="app-menu-surface"
        >
          <template #activator="{ props: menuProps }">
            <v-btn
              icon="mdi-earth"
              size="sm"
              variant="text"
              aria-label="Change Form"
              v-bind="menuProps"
            />
          </template>
          <v-list density="compact" min-width="180">
            <v-list-item
              v-for="option in props.variants"
              :key="option.value"
              :active="option.value === props.currentVariant"
              :title="option.title"
              @click="onSelectVariant(option.value)"
            />
          </v-list>
        </v-menu>

        <v-btn
          icon="mdi-plus"
          size="sm"
          variant="text"
          aria-label="Add section"
          @click="addModalOpen = true"
        />
        <v-btn
          icon="mdi-minus"
          size="sm"
          variant="text"
          aria-label="Remove section"
          @click="emit('delete-section', props.sectionKey)"
        />
        <v-btn
          icon="mdi-arrow-down"
          size="sm"
          variant="text"
          aria-label="Down section"
          :disabled="!props.canMoveDown"
          @click="emit('move-down', props.sectionKey)"
        />
        <v-btn
          icon="mdi-arrow-up"
          size="sm"
          variant="text"
          aria-label="Up section"
          :disabled="!props.canMoveUp"
          @click="emit('move-up', props.sectionKey)"
        />
      </span>
    </div>
    <slot />

    <AppModal v-model="addModalOpen" :title="props.addModalTitle" max-width="640">
      <slot name="add-form" :submit="onSubmitAddItem" :close="() => (addModalOpen = false)">
        <div class="d-flex justify-end ga-2">
          <v-btn variant="text" @click="addModalOpen = false">Cancel</v-btn>
          <v-btn color="primary" @click="onSubmitAddItem">Add</v-btn>
        </div>
      </slot>
    </AppModal>
  </section>
</template>

<style scoped>
.resume-hover-section {
  display: grid;
  gap: 8px;
}
.resume-hover-section__header { display: flex; align-items: center; }
.resume-hover-section__toolbar {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  opacity: 0;
  pointer-events: none;
  transform: translateX(-4px);
  transition: opacity .15s ease, transform .15s ease;
  margin: 0 20px 0.65rem;
}
.resume-hover-section:hover .resume-hover-section__toolbar,
.resume-hover-section:focus-within .resume-hover-section__toolbar {
  opacity: 1;
  pointer-events: auto;
  transform: translateX(0);
}
</style>
