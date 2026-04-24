<script setup lang="ts">
defineProps<{ resume: any }>()
</script>

<template>
  <div class="classic-template">
    <aside class="classic-sidebar">
      <h1>{{ resume.firstName }}<br>{{ resume.lastName }}</h1>
      <p class="job">{{ resume.role }}</p>
      <h3>Details</h3>
      <ul>
        <li>{{ resume.city }}, {{ resume.country }}</li>
        <li>{{ resume.phone }}</li>
        <li>{{ resume.email }}</li>
      </ul>

      <h3>Skills</h3>
      <ul class="level-list">
        <li v-for="skill in resume.skills" :key="skill.name">
          <span>{{ skill.name }}</span>
          <div class="progress"><i :style="{ width: `${skill.level}%` }" /></div>
        </li>
      </ul>

      <h3>Languages</h3>
      <ul class="level-list">
        <li v-for="language in resume.languages" :key="language.name">
          <span>{{ language.name }}</span>
          <div class="progress"><i :style="{ width: `${language.level}%` }" /></div>
        </li>
      </ul>
    </aside>

    <main class="classic-content">
      <section>
        <h2>Profile</h2>
        <p>{{ resume.profile }}</p>
      </section>
      <section>
        <h2>Employment History</h2>
        <article v-for="(experience, index) in resume.experiences" :key="`${experience.company}-${index}`" class="entry">
          <h4>{{ experience.role }}, {{ experience.company }}, {{ experience.city }}</h4>
          <p class="dates">{{ experience.start }} - {{ experience.end }}</p>
          <ul>
            <li v-for="(bullet, bulletIndex) in experience.bullets" :key="bulletIndex">{{ bullet }}</li>
          </ul>
        </article>
      </section>
      <section>
        <h2>Education</h2>
        <article v-for="(item, index) in resume.education" :key="`${item.school}-${index}`" class="entry">
          <h4>{{ item.degree }}, {{ item.school }}</h4>
          <p class="dates">{{ item.start }} - {{ item.end }}</p>
          <p>{{ item.note }}</p>
        </article>
      </section>
    </main>
  </div>
</template>

<style scoped>
.classic-template { display:grid; grid-template-columns:260px 1fr; min-height: calc(100vh - 80px); background: var(--cv-page); border-radius: 14px; overflow:hidden; }
.classic-sidebar { background: var(--cv-sidebar); color:#fff; padding:28px 24px; }
.classic-sidebar h1 { font-size:2rem; line-height:1.2; margin-bottom:18px; }
.job { letter-spacing:.08em; font-size:.8rem; margin-bottom:24px; text-transform: uppercase; }
.classic-sidebar ul { list-style:none; padding:0; }
.classic-sidebar li { margin-bottom:10px; }
.level-list .progress { height:4px; background:rgba(255,255,255,.3); margin-top:4px; }
.level-list .progress i { display:block; height:4px; background:#fff; }
.classic-content { padding:28px; }
.classic-content h2 { color: var(--cv-accent); margin-bottom: 8px; }
.entry { margin-bottom: 16px; }
.dates { font-size:.75rem; text-transform:uppercase; color:#6b7280; letter-spacing:.08em; }
@media (max-width:1120px){ .classic-template{ grid-template-columns:1fr; } }
</style>
