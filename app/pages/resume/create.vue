<script setup lang="ts">
definePageMeta({
  title: 'Create Resume',
})

const resume = reactive({
  role: 'Backend Developer',
  firstName: 'Mohamed Rami',
  lastName: 'Aouinti',
  email: 'rami.aouinti.dourant@gmail.com',
  phone: '017635587613',
  city: 'Köln 50859',
  country: 'Deutschland',
  profile:
    'Hardworking Student seeking employment. Ready to utilize my skills and passion to further the mission of a company. Technologically adept, offering experience with many different social media platforms, office technology programs, and advanced computer skills.',
})

const leftSections = [
  { title: 'Personal details', hint: 'Renseigne les informations de base de ton profil.' },
  { title: 'Professional summary', hint: 'Décris ton impact, ta motivation et tes objectifs.' },
  { title: 'Education', hint: 'Ajoute tes études et formations principales.' },
]

const skills = ['Advanced Communication Skills', 'Office Technology Skills', 'Motivated Attitude', 'Social Media Platforms']
</script>

<template>
  <v-container fluid class="resume-create pa-0">
    <div class="builder-topbar px-3 px-md-6 py-3">
      <div class="topbar-left">
        <v-icon icon="mdi-dots-grid" />
        <strong>Student</strong>
      </div>
      <div class="topbar-center">
        <v-btn variant="text">Edit</v-btn>
        <v-btn variant="flat" color="primary">Customize</v-btn>
        <v-btn variant="text">AI Review</v-btn>
      </div>
      <v-btn color="primary" append-icon="mdi-chevron-down">Download</v-btn>
    </div>

    <div class="builder-layout">
      <section class="builder-form px-3 px-md-6 py-4">
        <div class="completion-card mb-4">
          <strong>100%</strong>
          <span>Resume completeness</span>
        </div>

        <article v-for="section in leftSections" :key="section.title" class="form-section mb-4">
          <header class="d-flex justify-space-between align-center mb-4">
            <div>
              <h2>{{ section.title }}</h2>
              <p>{{ section.hint }}</p>
            </div>
            <v-icon icon="mdi-chevron-up" />
          </header>

          <div v-if="section.title === 'Personal details'" class="grid-2">
            <v-text-field v-model="resume.role" label="Job target" variant="solo-filled" flat hide-details />
            <v-text-field v-model="resume.firstName" label="First name" variant="solo-filled" flat hide-details />
            <v-text-field v-model="resume.lastName" label="Last name" variant="solo-filled" flat hide-details />
            <v-text-field v-model="resume.email" label="Email" variant="solo-filled" flat hide-details />
            <v-text-field v-model="resume.phone" label="Phone" variant="solo-filled" flat hide-details />
            <v-text-field v-model="resume.city" label="City" variant="solo-filled" flat hide-details />
            <v-text-field v-model="resume.country" label="Country" variant="solo-filled" flat hide-details />
          </div>

          <div v-else-if="section.title === 'Professional summary'">
            <v-textarea
              v-model="resume.profile"
              label="Summary"
              rows="7"
              variant="solo-filled"
              flat
              hide-details
            />
          </div>

          <div v-else class="grid-2">
            <v-text-field label="School" model-value="New York University" variant="solo-filled" flat hide-details />
            <v-text-field label="Degree" model-value="Bachelor of Communications" variant="solo-filled" flat hide-details />
            <v-text-field label="Start" model-value="Aug, 2016" variant="solo-filled" flat hide-details />
            <v-text-field label="End" model-value="Aug, 2021" variant="solo-filled" flat hide-details />
          </div>
        </article>
      </section>

      <aside class="builder-preview py-6 px-5 px-md-8">
        <div class="preview-grid">
          <section class="preview-sidebar">
            <h1>{{ resume.firstName }}<br>{{ resume.lastName }}</h1>
            <p class="job">{{ resume.role.toUpperCase() }}</p>

            <h3>Details</h3>
            <ul>
              <li>{{ resume.city }}</li>
              <li>{{ resume.country }}</li>
              <li>{{ resume.phone }}</li>
              <li>{{ resume.email }}</li>
            </ul>

            <h3>Skills</h3>
            <ul>
              <li v-for="skill in skills" :key="skill">{{ skill }}</li>
            </ul>
          </section>

          <section class="preview-content">
            <h2>Profile</h2>
            <p>{{ resume.profile }}</p>

            <h2>Employment History</h2>
            <h4>Sales Associate, Big Apple Bookstore, New York</h4>
            <ul>
              <li>Greeted customers and assisted them with finding books.</li>
              <li>Offered literary suggestions based on customer needs.</li>
              <li>Managed projects with precision and care.</li>
            </ul>

            <h2>Education</h2>
            <h4>Bachelor of Communications, New York University</h4>
            <p>Working towards a Communications Degree.</p>
          </section>
        </div>
      </aside>
    </div>
  </v-container>
</template>

<style scoped>
.resume-create {
  min-height: 100vh;
  background: #f5f6fb;
}

.builder-topbar {
  background: white;
  border-bottom: 1px solid #e3e7f2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  position: sticky;
  top: 0;
  z-index: 2;
}

.topbar-left,
.topbar-center {
  display: flex;
  align-items: center;
  gap: 12px;
}

.builder-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(320px, 1fr);
}

.builder-form {
  border-right: 1px solid #e3e7f2;
}

.completion-card {
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid #c3dbc9;
  background: #fff;
  border-radius: 12px;
  padding: 14px;
}

.form-section {
  background: #fff;
  border-radius: 14px;
  padding: 18px;
  border: 1px solid #e3e7f2;
}

.form-section h2 {
  font-size: 1.65rem;
  margin-bottom: 4px;
  text-transform: capitalize;
}

.form-section p {
  color: #6b7690;
  margin: 0;
}

.grid-2 {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.builder-preview {
  background: #ffffff;
}

.preview-grid {
  display: grid;
  grid-template-columns: 260px 1fr;
  min-height: calc(100vh - 80px);
}

.preview-sidebar {
  background: #07564f;
  color: #fff;
  padding: 28px 24px;
}

.preview-sidebar h1 {
  font-size: 2rem;
  line-height: 1.2;
  margin-bottom: 18px;
}

.preview-sidebar .job {
  letter-spacing: 0.08em;
  font-size: 0.75rem;
  margin-bottom: 24px;
}

.preview-sidebar h3 {
  margin-top: 20px;
}

.preview-sidebar ul {
  list-style: none;
  padding: 0;
  margin: 8px 0;
}

.preview-sidebar li {
  margin-bottom: 8px;
  font-size: 0.95rem;
}

.preview-content {
  padding: 28px;
}

.preview-content h2 {
  margin-bottom: 10px;
  font-size: 2rem;
}

.preview-content h4 {
  margin-bottom: 8px;
  margin-top: 8px;
}

@media (max-width: 1120px) {
  .builder-layout,
  .preview-grid {
    grid-template-columns: 1fr;
  }

  .builder-form {
    border-right: 0;
  }
}

@media (max-width: 760px) {
  .topbar-center {
    display: none;
  }

  .grid-2 {
    grid-template-columns: 1fr;
  }
}
</style>
