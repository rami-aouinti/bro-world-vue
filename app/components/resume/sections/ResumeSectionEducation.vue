<script setup lang="ts">import type { ResumeApiItem } from '~/services/resumeApi';defineProps<{ resume: ResumeApiItem }>()</script>
<template><section class="section"><h3>Education</h3><article v-for="(item,i) in resume.educations||[]" :key="i">{{ item.title }} · {{ item.school }}</article></section></template>
