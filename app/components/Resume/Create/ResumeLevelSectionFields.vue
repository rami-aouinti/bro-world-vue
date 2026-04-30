<script setup lang="ts">
const draft = defineModel<Record<string, any>>({ required: true })
const props = defineProps<{
  section: 'skill' | 'language'
  t: (key: string) => string
  showStars?: boolean
}>()
</script>

<template>
  <v-text-field
    v-model="draft.name"
    :label="
      props.section === 'skill'
        ? props.t('resumeBuilder.create.fields.skillName')
        : props.t('resumeBuilder.create.fields.languageName')
    "
    variant="outlined"
    hide-details
  />

  <template v-if="props.section === 'language'">
    <v-text-field
      v-model="draft.countryCode"
      :label="props.t('resumeBuilder.create.fields.countryCodeOptional')"
      :placeholder="props.t('resumeBuilder.create.placeholders.countryCode')"
      maxlength="2"
      variant="outlined"
      hide-details
    />
    <v-text-field
      v-model="draft.flag"
      :label="props.t('resumeBuilder.create.fields.flagOptional')"
      :placeholder="props.t('resumeBuilder.create.placeholders.flag')"
      variant="outlined"
      hide-details
    />
  </template>

  <v-rating
    v-if="props.showStars"
    v-model="draft.stars"
    color="amber"
    active-color="amber"
    length="5"
  />
  <v-slider
    v-else
    v-model="draft.level"
    min="0"
    max="100"
    step="5"
    color="primary"
    thumb-label
  />
</template>
