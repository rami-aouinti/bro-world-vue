<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    isEmpty?: boolean
  }>(),
  {
    isEmpty: false,
  },
)
</script>

<template>
  <section v-if="!isEmpty" class="resume-section-block">
    <h3 class="resume-section-block__title">{{ title }}</h3>
    <slot />
  </section>
</template>

<style scoped>
.resume-section-block {
  display: grid;
  gap: 8px;
}

.resume-section-block__title {
  margin: 0;
  font-size: 1.05rem;
  line-height: 1.3;
}
</style>
