<script setup lang="ts">
import GENERATED_RESUME_TEMPLATES from '~/data/resume-templates/generated-20-resume.json'

definePageMeta({ title: 'Resume · CV Preview' })

function openPreview(templateId: string) {
  navigateTo(`/resume/preview?template=${templateId}`)
}
</script>

<template>
  <div class="cv-preview-page pa-6">
    <div class="d-flex align-center justify-space-between mb-6 flex-wrap ga-3">
      <div>
        <h1 class="text-h4 font-weight-bold mb-1">Generated CV Templates</h1>
        <p class="text-medium-emphasis mb-0">20 generated resume templates (12+ configurable sections/items) ready for preview.</p>
      </div>
    </div>

    <v-row>
      <v-col
        v-for="template in GENERATED_RESUME_TEMPLATES"
        :key="template.id"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <v-card class="h-100 d-flex flex-column" variant="outlined">
          <v-img :src="`/img/cv/generated/${template.id}.png`" height="220" cover />
          <v-card-title class="text-subtitle-1">{{ template.name }}</v-card-title>
          <v-card-subtitle>{{ template.id }} · {{ template.layout }}</v-card-subtitle>
          <v-card-text class="text-caption text-medium-emphasis">
            {{ Object.keys(template.sections || {}).length }} items
          </v-card-text>
          <v-spacer />
          <v-card-actions>
            <v-btn block color="primary" variant="flat" @click="openPreview(template.id)">Open CV preview</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>
