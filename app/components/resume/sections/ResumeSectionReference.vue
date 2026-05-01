<script setup lang="ts">import type { ResumeApiItem } from '~/services/resumeApi';defineProps<{ resume: ResumeApiItem }>()</script>
<template><section class="section"><h3>Reference</h3><article v-for="(item,i) in resume.references||[]" :key="i">{{ item.title }}<p>{{ item.description }}</p></article></section></template>
