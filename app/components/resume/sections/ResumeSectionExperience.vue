<script setup lang="ts">import type { ResumeApiItem } from '~/services/resumeApi';defineProps<{ resume: ResumeApiItem }>()</script>
<template><section class="section"><h3>Experience</h3><article v-for="(item,i) in resume.experiences||[]" :key="i"><strong>{{ item.title }}</strong> · {{ item.company }}<p>{{ item.description }}</p></article></section></template>
