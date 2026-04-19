<script setup lang="ts">
definePageMeta({ title: 'world.jobs.label' })

const { t } = useI18n()

const rows = [
  {
    id: 'J-100',
    role: t('world.jobs.sampleRows.j100.role'),
    team: t('world.jobs.sampleRows.j100.team'),
    applicants: 62,
    status: t('world.jobs.sampleRows.j100.status'),
  },
  {
    id: 'J-101',
    role: t('world.jobs.sampleRows.j101.role'),
    team: t('world.jobs.sampleRows.j101.team'),
    applicants: 24,
    status: t('world.jobs.sampleRows.j101.status'),
  },
  {
    id: 'J-102',
    role: t('world.jobs.sampleRows.j102.role'),
    team: t('world.jobs.sampleRows.j102.team'),
    applicants: 15,
    status: t('world.jobs.sampleRows.j102.status'),
  },
]
</script>

<template>
  <div>
    <v-container fluid>
      <v-row class="mb-4">
        <v-col cols="12" md="3"
          ><v-card class="pa-3 postcard-gradient-card" rounded="xl"
            ><p class="text-caption mb-1">
              {{ t('world.jobs.kpis.openOffers') }}
            </p>
            <h3 class="text-h5">18</h3></v-card
          ></v-col
        >
        <v-col cols="12" md="3"
          ><v-card class="pa-3 postcard-gradient-card" rounded="xl"
            ><p class="text-caption mb-1">
              {{ t('world.jobs.kpis.newApplications') }}
            </p>
            <h3 class="text-h5">94</h3></v-card
          ></v-col
        >
        <v-col cols="12" md="3"
          ><v-card class="pa-3 postcard-gradient-card" rounded="xl"
            ><p class="text-caption mb-1">
              {{ t('world.jobs.kpis.interviewsWeek') }}
            </p>
            <h3 class="text-h5">27</h3></v-card
          ></v-col
        >
        <v-col cols="12" md="3"
          ><v-card class="pa-3 postcard-gradient-card" rounded="xl"
            ><p class="text-caption mb-1">
              {{ t('world.jobs.kpis.offerAcceptance') }}
            </p>
            <h3 class="text-h5">68%</h3></v-card
          ></v-col
        >
      </v-row>

      <WorldFeatureScaffold
        :title="t('world.jobs.home.title')"
        :subtitle="t('world.jobs.home.subtitle')"
        :form-title="t('world.jobs.home.formTitle')"
        :form-description="t('world.jobs.home.formDescription')"
        :fields="[
          {
            key: 'title',
            label: t('world.jobs.form.jobTitle'),
            type: 'text',
          },
          {
            key: 'department',
            label: t('world.jobs.form.department'),
            type: 'text',
          },
          {
            key: 'seniority',
            label: t('world.jobs.form.seniority'),
            type: 'select',
            options: [
              {
                title: t('world.jobs.seniority.junior'),
                value: 'junior',
              },
              { title: t('world.jobs.seniority.mid'), value: 'mid' },
              {
                title: t('world.jobs.seniority.senior'),
                value: 'senior',
              },
            ],
          },
          {
            key: 'salary',
            label: t('world.jobs.form.salary'),
            type: 'number',
          },
          {
            key: 'deadline',
            label: t('world.jobs.form.deadline'),
            type: 'date',
          },
          {
            key: 'description',
            label: t('world.jobs.form.roleDescription'),
            type: 'textarea',
          },
        ]"
        :headers="[
          { title: t('world.common.table.id'), key: 'id' },
          { title: t('world.jobs.table.role'), key: 'role' },
          { title: t('world.jobs.table.team'), key: 'team' },
          {
            title: t('world.jobs.table.applicants'),
            key: 'applicants',
          },
          { title: t('world.jobs.table.status'), key: 'status' },
        ]"
        :rows="rows"
        :create-label="t('world.jobs.actions.publish')"
      />
    </v-container>
  </div>
</template>
