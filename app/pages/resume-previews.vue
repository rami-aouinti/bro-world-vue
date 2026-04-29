<script setup lang="ts">
import { RESUME_TEMPLATES_CATALOG } from '~/constants/resumeTemplates.catalog'

const resumeTemplates = RESUME_TEMPLATES_CATALOG.filter((template) => template.type === 'resume')
</script>

<template>
  <main class="resume-previews-page">
    <h1>Resume template previews</h1>
    <p>Visual checks for template thumbnails and main settings.</p>
    <section class="grid">
      <article v-for="template in resumeTemplates" :key="template.id" class="card">
        <img :src="template.image" :alt="`Preview ${template.label}`" loading="lazy">
        <h2>{{ template.label }}</h2>
        <p>{{ template.subtitle }}</p>
        <ul>
          <li><strong>Variant:</strong> {{ template.variant }}</li>
          <li><strong>Layout:</strong> {{ template.layoutMode }}</li>
          <li><strong>Palette:</strong> {{ template.styleVars.palette }}</li>
          <li><strong>Typography:</strong> {{ template.styleVars.typography }}</li>
        </ul>
      </article>
    </section>
  </main>
</template>

<style scoped>
.resume-previews-page { padding: 24px; }
.grid { display:grid; grid-template-columns: repeat(auto-fill,minmax(280px,1fr)); gap:16px; }
.card { background:#fff; border:1px solid #e5e7eb; border-radius:12px; padding:12px; }
img { width:100%; aspect-ratio:3/4; object-fit:cover; border-radius:8px; border:1px solid #e5e7eb; }
h2 { margin:10px 0 6px; font-size:1rem; }
p { margin:0 0 8px; color:#4b5563; font-size:.9rem; }
ul { margin:0; padding-left:16px; color:#374151; font-size:.85rem; }
</style>
