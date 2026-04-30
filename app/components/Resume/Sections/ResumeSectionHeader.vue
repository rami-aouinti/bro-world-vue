<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    title: string
    icon?: string
    as?: 'h2' | 'h3'
    inAside?: boolean
  }>(),
  {
    icon: '',
    as: 'h3',
    inAside: false,
  },
)
</script>

<template>
  <component
    :is="props.as"
    class="cv-heading-section resume-section-header"
    :class="{ 'resume-section-header--aside': props.inAside }"
  >
    <v-icon
      v-if="props.icon"
      class="section-icon"
      :icon="props.icon"
      size="18"
    />
    <span>{{ props.title }}</span>
  </component>
</template>

<style scoped>
.resume-section-header {
  display: flex;
  align-items: center;
  gap: var(--resume-section-icon-gap, var(--cv-space-2, 8px));
  margin: 0 0 6px;
}

.resume-section-header--aside {
  margin-top: 2px;
}

.section-icon {
  color: var(--resume-section-icon-color, var(--cv-accent));
}
</style>
