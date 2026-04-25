<script setup lang="ts">
defineProps<{ resume: any; showPhoto?: boolean }>()
</script>

<template>
  <div class="modern-template">
    <header class="modern-header">
      <v-avatar v-if="showPhoto && resume.photoUrl" size="82" class="mb-3">
        <v-img :src="resume.photoUrl" cover />
      </v-avatar>
      <h1>{{ resume.firstName }} {{ resume.lastName }}</h1>
      <p>{{ resume.role }}</p>
      <p>{{ resume.city }}, {{ resume.country }} · {{ resume.phone }} · {{ resume.email }}</p>
    </header>

    <div class="modern-grid">
      <aside>
        <section>
          <h3>Skills</h3>
          <ul class="bars">
            <li class="text-dark" v-for="skill in resume.skills" :key="skill.name">
              <span>{{ skill.name }}</span>
              <div><i :style="{ width: `${skill.level}%` }" /></div>
            </li>
          </ul>
        </section>
        <section>
          <h3>Languages</h3>
          <ul class="bars">
            <li class="text-dark" v-for="language in resume.languages" :key="language.name">
              <span>{{ language.name }}</span>
              <div><i :style="{ width: `${language.level}%` }" /></div>
            </li>
          </ul>
        </section>
      </aside>

      <main>
        <section>
          <h2>Profile</h2>
          <p class="text-dark">{{ resume.profile || 'Add a professional summary from the Edit tab.' }}</p>
        </section>
        <section>
          <h2>Employment History</h2>
          <article v-for="(experience, index) in resume.experiences" :key="`${experience.company}-${index}`" class="entry text-dark">
            <h4 class="text-dark">{{ experience.role }}, {{ experience.company }}, {{ experience.city }}</h4>
            <p class="dates">{{ experience.start }} - {{ experience.end }}</p>
            <ul>
              <li class="text-dark" v-for="(bullet, bulletIndex) in experience.bullets" :key="bulletIndex">{{ bullet }}</li>
            </ul>
          </article>
        </section>
      </main>
    </div>
  </div>
</template>

<style scoped>
.modern-template { min-height: calc(100vh - 80px); border-radius:14px; overflow:hidden; background: #fff; }
.modern-header { background: color-mix(in srgb, var(--cv-accent) 85%, white); color: #071325; padding:26px 30px; }
.modern-header h1 { font-size:2.2rem; margin-bottom:4px; }
.modern-grid { display:grid; grid-template-columns: 280px 1fr; }
aside { background:#f8fafc; padding:22px; }
main { padding:24px; }
h2,h3 { color:var(--cv-accent); margin-bottom:8px; }
.bars { list-style:none; padding:0; }
.bars li { margin-bottom:10px; }
.bars div { height:4px; background:#d1d5db; margin-top:4px; }
.bars i { display:block; height:4px; background:var(--cv-accent); }
.dates { font-size:.75rem; color:#6b7280; text-transform: uppercase; }
@media (max-width:1120px){ .modern-grid{ grid-template-columns: 1fr; } }
</style>
