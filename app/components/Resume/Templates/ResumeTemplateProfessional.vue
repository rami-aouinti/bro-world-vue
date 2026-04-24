<script setup lang="ts">
defineProps<{ resume: any }>()
</script>

<template>
  <div class="professional-template">
    <aside>
      <h1>{{ resume.firstName }} {{ resume.lastName }}</h1>
      <p class="role">{{ resume.role }}</p>
      <h3>Contact</h3>
      <p>{{ resume.city }}, {{ resume.country }}</p>
      <p>{{ resume.phone }}</p>
      <p>{{ resume.email }}</p>
      <h3>Skills</h3>
      <ul>
        <li v-for="skill in resume.skills" :key="skill.name">{{ skill.name }}</li>
      </ul>
    </aside>

    <main>
      <section>
        <h2>Profile</h2>
        <p>{{ resume.profile }}</p>
      </section>
      <section>
        <h2>Experience</h2>
        <article v-for="(experience, index) in resume.experiences" :key="`${experience.company}-${index}`" class="entry">
          <h4>{{ experience.role }} · {{ experience.company }}</h4>
          <p class="dates">{{ experience.start }} - {{ experience.end }}</p>
          <ul>
            <li v-for="(bullet, bulletIndex) in experience.bullets" :key="bulletIndex">{{ bullet }}</li>
          </ul>
        </article>
      </section>
      <section>
        <h2>Education</h2>
        <article v-for="(item, index) in resume.education" :key="`${item.school}-${index}`" class="entry">
          <h4>{{ item.degree }}</h4>
          <p>{{ item.school }} · {{ item.city }}</p>
          <p class="dates">{{ item.start }} - {{ item.end }}</p>
        </article>
      </section>
    </main>
  </div>
</template>

<style scoped>
.professional-template { min-height: calc(100vh - 80px); display:grid; grid-template-columns: 300px 1fr; border-radius:14px; overflow:hidden; background:#fff; }
aside { background: var(--cv-sidebar); color: #fff; padding: 30px 24px; }
aside h1 { font-size: 2rem; line-height: 1.2; }
.role { text-transform: uppercase; letter-spacing: .08em; margin: 8px 0 22px; }
aside ul { padding-left: 16px; }
main { padding: 28px; }
main h2 { color: var(--cv-accent); margin-bottom: 8px; }
.entry { margin-bottom: 16px; }
.dates { color:#64748b; font-size:.75rem; text-transform:uppercase; }
@media (max-width:1120px){ .professional-template{ grid-template-columns: 1fr; } }
</style>
