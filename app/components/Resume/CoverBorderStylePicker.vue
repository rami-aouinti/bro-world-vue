<script setup lang="ts">
import { COVER_BORDER_STYLES } from '~/constants/coverBorderStyles'

const selectedBorderStyle = defineModel<string>({ default: 'simple' })

const borderStyleOptions = computed(() => [
  {
    id: 'simple',
    name: 'Simple',
    className: 'cover-border--simple',
    accentPlacement: 'classic',
  },
  ...COVER_BORDER_STYLES,
])
const premiumBorderStyleCount = computed(() => COVER_BORDER_STYLES.length)
</script>

<template>
  <div class="cover-border-style-picker">
    <div class="cover-border-style-picker__header">
      <p class="text-body-2 font-weight-bold mb-0">Premium border style</p>
      <span class="cover-border-style-picker__count"
        >{{ premiumBorderStyleCount }} pro looks</span
      >
    </div>

    <v-chip-group
      v-model="selectedBorderStyle"
      selected-class="cover-border-style-card--selected"
      mandatory
      column
      class="cover-border-style-grid"
    >
      <v-chip
        v-for="style in borderStyleOptions"
        :key="style.id"
        :value="style.id"
        class="cover-border-style-card"
        variant="text"
      >
        <span :class="['cover-border-thumb', `cover-border--${style.id}`]" />
        <span class="cover-border-style-card__copy">
          <strong>{{ style.name }}</strong>
          <small>{{ style.accentPlacement }}</small>
        </span>
      </v-chip>
    </v-chip-group>
  </div>
</template>

<style scoped>
.cover-border-style-picker {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cover-border-style-picker__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.cover-border-style-picker__count {
  border-radius: 999px;
  padding: 3px 9px;
  background: rgb(var(--v-theme-primary), 0.1);
  color: rgb(var(--v-theme-primary));
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.cover-border-style-grid {
  max-height: 360px;
  overflow: auto;
  padding-right: 4px;
}

.cover-border-style-card {
  height: auto;
  min-height: 116px;
  width: calc(50% - 6px);
  margin: 3px;
  padding: 10px;
  border: 1px solid rgba(148, 163, 184, 0.36);
  border-radius: 16px;
  background: linear-gradient(180deg, #ffffff, #f8fafc);
  box-shadow: 0 10px 26px rgba(15, 23, 42, 0.06);
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.18s ease;
}

.cover-border-style-card:hover {
  transform: translateY(-1px);
  border-color: rgb(var(--v-theme-primary), 0.42);
  box-shadow: 0 14px 34px rgba(15, 23, 42, 0.1);
}

.cover-border-style-card--selected {
  border-color: rgb(var(--v-theme-primary));
  background: linear-gradient(
    180deg,
    rgb(var(--v-theme-primary), 0.1),
    #ffffff 48%,
    #f8fafc
  );
  box-shadow:
    0 16px 38px rgba(15, 23, 42, 0.14),
    inset 0 0 0 1px rgb(var(--v-theme-primary), 0.18);
}

.cover-border-style-card :deep(.v-chip__content) {
  width: 100%;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  white-space: normal;
}

.cover-border-style-card__copy {
  display: flex;
  flex-direction: column;
  gap: 2px;
  line-height: 1.15;
}

.cover-border-style-card__copy strong {
  color: #0f172a;
  font-size: 0.78rem;
}

.cover-border-style-card__copy small {
  color: #64748b;
  font-size: 0.68rem;
  text-transform: capitalize;
}

@media (max-width: 640px) {
  .cover-border-style-card {
    width: 100%;
  }
}
</style>
