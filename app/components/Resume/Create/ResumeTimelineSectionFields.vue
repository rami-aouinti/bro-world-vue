<script setup lang="ts">
const draft = defineModel<Record<string, any>>({ required: true })

const props = defineProps<{
  section: 'experience' | 'education'
  contentStyleItems: Array<{ label: string; value: string }>
  logoErrorMessages?: string[]
  showTimelineExtras?: boolean
}>()

const emit = defineEmits<{
  openLogoUpload: []
  clearLogoError: []
}>()
</script>

<template>
  <template v-if="props.section === 'experience'">
    <v-text-field
      v-model="draft.role"
      label="Role"
      variant="outlined"
      hide-details
    />
    <v-text-field
      v-model="draft.company"
      label="Company"
      variant="outlined"
      hide-details
    />
    <v-text-field
      v-model="draft.companyImageUrl"
      label="Company logo URL"
      variant="outlined"
      :error-messages="props.logoErrorMessages"
      @update:model-value="emit('clearLogoError')"
    />
    <div class="d-flex align-center ga-2">
      <v-btn
        prepend-icon="mdi-image-plus-outline"
        size="small"
        variant="tonal"
        @click="emit('openLogoUpload')"
      >
        Upload logo
      </v-btn>
    </div>
    <v-text-field
      v-model="draft.city"
      label="City"
      variant="outlined"
      hide-details
    />
    <div class="grid-2">
      <v-text-field
        v-model="draft.start"
        label="Start"
        variant="outlined"
        hide-details
      />
      <v-text-field
        v-model="draft.end"
        label="End"
        variant="outlined"
        hide-details
      />
    </div>
    <v-select
      v-model="draft.contentStyle"
      :items="props.contentStyleItems"
      item-title="label"
      item-value="value"
      label="Content style"
      variant="outlined"
      hide-details
    />
    <v-textarea
      v-model="draft.bullets"
      label="Content (one per line, timeline: Label | Detail)"
      rows="4"
      variant="outlined"
      hide-details
    />

    <template
      v-if="props.showTimelineExtras && draft.contentStyle === 'timeline'"
    >
      <v-text-field
        v-model="draft.timelineEventTitle"
        label="Event title"
        variant="outlined"
        hide-details
      />
      <v-text-field
        v-model="draft.timelineDateRange"
        label="Date range"
        variant="outlined"
        hide-details
      />
      <v-textarea
        v-model="draft.timelineDescription"
        label="Short description"
        rows="3"
        variant="outlined"
        hide-details
      />
    </template>
  </template>

  <template v-else>
    <v-text-field
      v-model="draft.degree"
      label="Degree"
      variant="outlined"
      hide-details
    />
    <v-text-field
      v-model="draft.school"
      label="School"
      variant="outlined"
      hide-details
    />
    <v-text-field
      v-model="draft.schoolImageUrl"
      label="School logo URL (optional)"
      variant="outlined"
      hide-details
    />
    <div class="d-flex align-center ga-2">
      <v-btn
        prepend-icon="mdi-image-plus-outline"
        variant="outlined"
        size="small"
        @click="emit('openLogoUpload')"
      >
        Upload logo
      </v-btn>
      <v-avatar v-if="draft.schoolImageUrl" rounded="lg" size="40">
        <v-img :src="draft.schoolImageUrl" alt="School logo preview" cover />
      </v-avatar>
    </div>
    <v-text-field
      v-model="draft.city"
      label="City"
      variant="outlined"
      hide-details
    />
    <div class="grid-2">
      <v-text-field
        v-model="draft.start"
        label="Start"
        variant="outlined"
        hide-details
      />
      <v-text-field
        v-model="draft.end"
        label="End"
        variant="outlined"
        hide-details
      />
    </div>
    <v-select
      v-model="draft.contentStyle"
      :items="props.contentStyleItems"
      label="Content style"
      variant="outlined"
      hide-details
    />
    <v-textarea
      v-model="draft.note"
      label="Content (one per line, timeline: Label | Detail)"
      rows="3"
      variant="outlined"
      hide-details
    />
  </template>
</template>
