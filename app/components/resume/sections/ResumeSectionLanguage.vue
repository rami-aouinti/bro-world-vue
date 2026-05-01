<script setup lang="ts">import type { ResumeApiItem } from '~/services/resumeApi';defineProps<{ resume: ResumeApiItem }>()</script>
<template><section class="section"><h3>Language</h3><article v-for="(item,i) in resume.languages||[]" :key="i">{{ item.name || item.title }} - {{ item.countryCode }}</article></section></template>
