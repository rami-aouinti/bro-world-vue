<script setup lang="ts">import type { ResumeApiItem } from '~/services/resumeApi';defineProps<{ resume: ResumeApiItem }>()</script>
<template><section class="section"><h3>Skill</h3><article v-for="(item,i) in resume.skills||[]" :key="i">{{ item.title }} <small>{{ item.level }}</small></article></section></template>
