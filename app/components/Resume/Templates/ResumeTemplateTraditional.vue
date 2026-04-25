<script setup lang="ts">
defineProps<{ resume: any; showPhoto?: boolean }>()
</script>

<template>
  <article class="traditional-template">
    <header>
      <v-avatar v-if="showPhoto && resume.photoUrl" size="76" class="mb-3">
        <v-img :src="resume.photoUrl" cover />
      </v-avatar>
      <h1>{{ resume.firstName }} {{ resume.lastName }}</h1>
      <p>{{ resume.role }} · {{ resume.city }}, {{ resume.country }} · {{ resume.phone }} · {{ resume.email }}</p>
    </header>

    <section>
      <h2>Profile</h2>
      <p class="text-dark">{{ resume.profile || 'Add a professional summary from the Edit tab.' }}</p>
    </section>

    <section>
      <h2>Employment History</h2>
      <article v-for="(experience, index) in resume.experiences" :key="`${experience.company}-${index}`" class="entry text-dark">
        <div class="entry-head">
          <h4 class="text-dark">{{ experience.role }}, {{ experience.company }}</h4>
          <span>{{ experience.start }} - {{ experience.end }}</span>
        </div>
        <ul>
          <li class="text-dark" v-for="(bullet, bulletIndex) in experience.bullets" :key="bulletIndex">{{ bullet }}</li>
        </ul>
      </article>
    </section>

    <section>
      <h2>Education</h2>
      <article v-for="(item, index) in resume.education" :key="`${item.school}-${index}`" class="entry text-dark">
        <div class="entry-head text-dark">
          <h4 class="text-dark">{{ item.degree }}, {{ item.school }}</h4>
          <span>{{ item.start }} - {{ item.end }}</span>
        </div>
        <p class="text-dark">{{ item.note }}</p>
      </article>
    </section>
  </article>
</template>

<style scoped>
.traditional-template { min-height: calc(100vh - 80px); background: #fff; color: #111827; border-radius:14px; padding: 34px; }
header { text-align:center; border-bottom:2px solid #d1d5db; padding-bottom:14px; margin-bottom:20px; }
h1 { font-size: 2rem; letter-spacing: .06em; }
h2 { font-size:1.1rem; letter-spacing: .08em; text-transform: uppercase; border-bottom:1px solid #cbd5e1; padding-bottom:6px; margin-bottom:10px; }
.entry { margin-bottom: 14px; }
.entry-head { display:flex; justify-content:space-between; gap:10px; }
.entry-head span { color:#6b7280; font-size:.85rem; }
</style>
