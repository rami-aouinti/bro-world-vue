<script setup lang="ts">
definePageMeta({ title: 'Jobs Apply' })

type ApplicationStatus = 'draft' | 'submitted' | 'withdrawn'

type StatusEvent = {
  status: ApplicationStatus
  at: string
  note: string
}

type CandidateApplication = {
  id: string
  jobId: string
  candidateName: string
  email: string
  portfolioUrl: string
  status: ApplicationStatus
  createdAt: string
  updatedAt: string
  duplicateKey: string
  cvFileName: string
  events: StatusEvent[]
}

const jobsNavItems = [
  { title: 'Overview Jobs', to: '/world/jobs', icon: 'mdi-view-dashboard-outline' },
  { title: 'Offers', to: '/world/jobs/offers', icon: 'mdi-briefcase-outline' },
  { title: 'My Offers', to: '/world/jobs/my-offers', icon: 'mdi-account-tie-outline' },
  { title: 'Applications', to: '/world/jobs/applications', icon: 'mdi-file-document-outline' },
  { title: 'Apply', to: '/world/jobs/apply', icon: 'mdi-send-outline' },
  { title: 'Admin', to: '/world/jobs/admin', icon: 'mdi-shield-crown-outline', rootOnly: true },
]

const maxCvSizeBytes = 5 * 1024 * 1024
const allowedCvExtensions = ['pdf', 'doc', 'docx']
const allowedCvMimeTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

const applicationForm = reactive({
  jobId: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  portfolioUrl: '',
  coverLetter: '',
  authorizedToWork: null as boolean | null,
  yearsExperience: null as number | null,
  expectedSalary: null as number | null,
  availableDate: '',
  openToRelocate: null as boolean | null,
})

const cvFile = ref<File | null>(null)
const formRef = ref()
const selectedApplicationId = ref<string | null>(null)
const errorMessage = ref('')
const successMessage = ref('')

const applications = ref<CandidateApplication[]>([
  {
    id: 'APP-1001',
    jobId: 'JOB-FE-2026',
    candidateName: 'Alex Martin',
    email: 'alex.martin@example.com',
    portfolioUrl: 'https://portfolio.example.com/alex',
    status: 'submitted',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    duplicateKey: 'job-fe-2026::alex.martin@example.com',
    cvFileName: 'alex_martin_cv.pdf',
    events: [
      { status: 'draft', at: new Date().toISOString(), note: 'Brouillon créé par le candidat' },
      { status: 'submitted', at: new Date().toISOString(), note: 'Candidature soumise' },
    ],
  },
])

const statusLabel: Record<ApplicationStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  withdrawn: 'Withdrawn',
}

const statusColor: Record<ApplicationStatus, string> = {
  draft: 'warning',
  submitted: 'success',
  withdrawn: 'error',
}

const tableHeaders = [
  { title: 'ID', key: 'id' },
  { title: 'Job ID', key: 'jobId' },
  { title: 'Candidate', key: 'candidateName' },
  { title: 'Email', key: 'email' },
  { title: 'Portfolio', key: 'portfolioUrl' },
  { title: 'Status', key: 'status' },
  { title: 'Updated', key: 'updatedAt' },
]

const requiredRule = (value: string | number | boolean | null) => value !== null && value !== '' || 'Champ obligatoire'
const emailRule = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || 'Email invalide'
const portfolioRule = (value: string) => {
  try {
    const parsed = new URL(value)
    return ['http:', 'https:'].includes(parsed.protocol) || 'URL portfolio invalide'
  }
  catch {
    return 'URL portfolio invalide'
  }
}
const coverLetterRule = (value: string) => value.trim().length >= 120 || 'La cover letter doit contenir au moins 120 caractères'
const phoneRule = (value: string) => /^[+\d\s().-]{8,20}$/.test(value) || 'Téléphone invalide'

const cvValidationError = computed(() => {
  if (!cvFile.value)
    return 'CV requis'

  const fileExtension = cvFile.value.name.split('.').pop()?.toLowerCase() || ''
  if (!allowedCvExtensions.includes(fileExtension))
    return `Type de fichier non autorisé (${allowedCvExtensions.join(', ')})`

  if (cvFile.value.type && !allowedCvMimeTypes.includes(cvFile.value.type))
    return 'MIME type du fichier CV non autorisé'

  if (cvFile.value.size > maxCvSizeBytes)
    return 'CV trop volumineux (max 5MB)'

  return ''
})

const selectedApplication = computed(() => {
  if (!selectedApplicationId.value)
    return null

  return applications.value.find(app => app.id === selectedApplicationId.value) || null
})

const createDuplicateKey = (jobId: string, email: string) => `${jobId.trim().toLowerCase()}::${email.trim().toLowerCase()}`

const createCvFingerprint = (file: File) => `${file.name}-${file.size}-${file.lastModified}`

const resetForm = () => {
  Object.assign(applicationForm, {
    jobId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    portfolioUrl: '',
    coverLetter: '',
    authorizedToWork: null,
    yearsExperience: null,
    expectedSalary: null,
    availableDate: '',
    openToRelocate: null,
  })
  cvFile.value = null
  formRef.value?.resetValidation()
}

const clearMessages = () => {
  errorMessage.value = ''
  successMessage.value = ''
}

const validateForm = async () => {
  const validationResult = await formRef.value?.validate()
  const isFormValid = Boolean(validationResult?.valid)
  if (!isFormValid)
    return false

  if (cvValidationError.value) {
    errorMessage.value = cvValidationError.value
    return false
  }

  if (applicationForm.authorizedToWork === false || applicationForm.yearsExperience === null || applicationForm.yearsExperience < 2) {
    errorMessage.value = 'Le candidat ne passe pas les critères knockout (autorisation de travail + minimum 2 ans d\'expérience).'
    return false
  }

  return true
}

const buildApplication = (status: ApplicationStatus): CandidateApplication => {
  const now = new Date().toISOString()
  const duplicateKey = createDuplicateKey(applicationForm.jobId, applicationForm.email)
  const baseCvFingerprint = cvFile.value ? createCvFingerprint(cvFile.value) : ''

  return {
    id: `APP-${Math.floor(1000 + Math.random() * 9000)}`,
    jobId: applicationForm.jobId.trim(),
    candidateName: `${applicationForm.firstName.trim()} ${applicationForm.lastName.trim()}`,
    email: applicationForm.email.trim().toLowerCase(),
    portfolioUrl: applicationForm.portfolioUrl.trim(),
    status,
    createdAt: now,
    updatedAt: now,
    duplicateKey: `${duplicateKey}::${baseCvFingerprint}`,
    cvFileName: cvFile.value?.name || '',
    events: [{ status, at: now, note: status === 'draft' ? 'Brouillon sauvegardé' : 'Candidature soumise' }],
  }
}

const hasDuplicateApplication = (candidate: CandidateApplication) => {
  return applications.value.some(existing =>
    existing.status !== 'withdrawn' && existing.duplicateKey === candidate.duplicateKey,
  )
}

const saveDraft = async () => {
  clearMessages()
  const isValid = await validateForm()
  if (!isValid)
    return

  const candidate = buildApplication('draft')
  if (hasDuplicateApplication(candidate)) {
    errorMessage.value = 'Un brouillon/candidature identique existe déjà pour ce job et ce CV.'
    return
  }

  applications.value.unshift(candidate)
  selectedApplicationId.value = candidate.id
  successMessage.value = 'Brouillon enregistré.'
  resetForm()
}

const submitApplication = async () => {
  clearMessages()
  const isValid = await validateForm()
  if (!isValid)
    return

  const candidate = buildApplication('submitted')
  if (hasDuplicateApplication(candidate)) {
    errorMessage.value = 'Candidature dupliquée détectée. Veuillez mettre à jour la candidature existante.'
    return
  }

  applications.value.unshift(candidate)
  selectedApplicationId.value = candidate.id
  successMessage.value = 'Candidature soumise avec succès.'
  resetForm()
}

const handleRowClick = (_event: Event, ctx: { item: CandidateApplication }) => {
  selectedApplicationId.value = ctx.item.id
}

const updateApplicationStatus = (status: ApplicationStatus, note: string) => {
  clearMessages()
  if (!selectedApplication.value) {
    errorMessage.value = 'Sélectionnez une candidature pour changer son statut.'
    return
  }

  selectedApplication.value.status = status
  selectedApplication.value.updatedAt = new Date().toISOString()
  selectedApplication.value.events.unshift({
    status,
    at: new Date().toISOString(),
    note,
  })

  successMessage.value = `Statut mis à jour: ${statusLabel[status]}.`
}
</script>

<template>
  <div>
    <WorldModuleDrawers
      module-title="Jobs"
      module-icon="mdi-briefcase-search-outline"
      module-description="Navigation complète du module Jobs."
      :nav-items="jobsNavItems"
      action-label="Postuler"
    />

    <v-container fluid class="pt-0">
      <v-row>
        <v-col cols="12" lg="7">
          <v-card>
            <v-card-title class="d-flex align-center justify-space-between">
              <span>Candidat · Formulaire complet</span>
              <v-chip color="primary" variant="tonal">ATS Ready</v-chip>
            </v-card-title>
            <v-card-text>
              <v-alert
                v-if="errorMessage"
                type="error"
                variant="tonal"
                class="mb-4"
                closable
                @click:close="errorMessage = ''"
              >
                {{ errorMessage }}
              </v-alert>

              <v-alert
                v-if="successMessage"
                type="success"
                variant="tonal"
                class="mb-4"
                closable
                @click:close="successMessage = ''"
              >
                {{ successMessage }}
              </v-alert>

              <v-form ref="formRef">
                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field v-model="applicationForm.jobId" label="Job ID" :rules="[requiredRule]" />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field v-model="applicationForm.email" label="Email" :rules="[requiredRule, emailRule]" />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field v-model="applicationForm.firstName" label="First name" :rules="[requiredRule]" />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field v-model="applicationForm.lastName" label="Last name" :rules="[requiredRule]" />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field v-model="applicationForm.phone" label="Phone" :rules="[requiredRule, phoneRule]" />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="applicationForm.portfolioUrl"
                      label="Portfolio URL"
                      :rules="[requiredRule, portfolioRule]"
                    />
                  </v-col>
                  <v-col cols="12">
                    <v-file-input
                      v-model="cvFile"
                      label="CV (PDF/DOC/DOCX, max 5MB)"
                      accept=".pdf,.doc,.docx"
                      prepend-icon="mdi-file-account-outline"
                      show-size
                      :error-messages="cvValidationError ? [cvValidationError] : []"
                      :rules="[() => !cvValidationError || cvValidationError === '' || cvValidationError]"
                    />
                  </v-col>
                  <v-col cols="12">
                    <v-textarea
                      v-model="applicationForm.coverLetter"
                      label="Cover letter"
                      rows="6"
                      counter="1200"
                      :rules="[requiredRule, coverLetterRule]"
                    />
                  </v-col>
                </v-row>

                <v-divider class="my-6" />

                <h4 class="text-subtitle-1 mb-3">Questions knockout</h4>

                <v-row>
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="applicationForm.authorizedToWork"
                      label="Authorized to work?"
                      :items="[
                        { title: 'Oui', value: true },
                        { title: 'Non', value: false },
                      ]"
                      :rules="[requiredRule]"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model.number="applicationForm.yearsExperience"
                      type="number"
                      label="Years of experience"
                      :min="0"
                      :max="40"
                      :rules="[requiredRule]"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model.number="applicationForm.expectedSalary"
                      type="number"
                      label="Expected salary (USD)"
                      :min="30000"
                      :max="500000"
                      :rules="[requiredRule]"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="applicationForm.availableDate"
                      type="date"
                      label="Available date"
                      :rules="[requiredRule]"
                    />
                  </v-col>
                  <v-col cols="12">
                    <v-select
                      v-model="applicationForm.openToRelocate"
                      label="Open to relocation?"
                      :items="[
                        { title: 'Oui', value: true },
                        { title: 'Non', value: false },
                      ]"
                      :rules="[requiredRule]"
                    />
                  </v-col>
                </v-row>

                <div class="d-flex flex-wrap ga-3 mt-6">
                  <v-btn color="warning" variant="flat" prepend-icon="mdi-content-save-outline" @click="saveDraft">
                    Save draft
                  </v-btn>
                  <v-btn color="primary" prepend-icon="mdi-send-outline" @click="submitApplication">
                    Submit application
                  </v-btn>
                  <v-btn variant="text" prepend-icon="mdi-refresh" @click="resetForm">Reset</v-btn>
                </div>
              </v-form>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" lg="5">
          <v-card class="mb-4">
            <v-card-title>Suivi candidat</v-card-title>
            <v-card-text>
              <v-data-table
                :headers="tableHeaders"
                :items="applications"
                item-value="id"
                density="comfortable"
                @click:row="handleRowClick"
              >
                <template #item.portfolioUrl="{ item }">
                  <a :href="item.portfolioUrl" target="_blank" rel="noreferrer">Portfolio</a>
                </template>
                <template #item.status="{ item }">
                  <v-chip :color="statusColor[item.status]" size="small" variant="tonal">
                    {{ statusLabel[item.status] }}
                  </v-chip>
                </template>
                <template #item.updatedAt="{ item }">
                  {{ new Date(item.updatedAt).toLocaleString() }}
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>

          <v-card>
            <v-card-title class="d-flex align-center justify-space-between">
              <span>État de candidature</span>
              <v-chip v-if="selectedApplication" :color="statusColor[selectedApplication.status]" variant="tonal">
                {{ statusLabel[selectedApplication.status] }}
              </v-chip>
            </v-card-title>
            <v-card-text>
              <template v-if="selectedApplication">
                <p class="text-body-2 mb-3">
                  <strong>{{ selectedApplication.candidateName }}</strong> · {{ selectedApplication.email }}
                </p>
                <div class="d-flex flex-wrap ga-2 mb-4">
                  <v-btn
                    size="small"
                    color="success"
                    variant="tonal"
                    :disabled="selectedApplication.status === 'submitted'"
                    @click="updateApplicationStatus('submitted', 'Resoumission par le candidat')"
                  >
                    Mark submitted
                  </v-btn>
                  <v-btn
                    size="small"
                    color="warning"
                    variant="tonal"
                    :disabled="selectedApplication.status === 'draft'"
                    @click="updateApplicationStatus('draft', 'Retour en brouillon pour modification')"
                  >
                    Mark draft
                  </v-btn>
                  <v-btn
                    size="small"
                    color="error"
                    variant="tonal"
                    :disabled="selectedApplication.status === 'withdrawn'"
                    @click="updateApplicationStatus('withdrawn', 'Candidature retirée par le candidat')"
                  >
                    Withdraw
                  </v-btn>
                </div>

                <v-timeline density="compact" side="end" align="start">
                  <v-timeline-item
                    v-for="(event, index) in selectedApplication.events"
                    :key="`${selectedApplication.id}-${event.at}-${index}`"
                    dot-color="primary"
                    size="small"
                  >
                    <div class="text-caption text-medium-emphasis">{{ new Date(event.at).toLocaleString() }}</div>
                    <div>{{ statusLabel[event.status] }} — {{ event.note }}</div>
                  </v-timeline-item>
                </v-timeline>
              </template>

              <v-alert v-else type="info" variant="tonal">
                Sélectionnez une candidature pour consulter son suivi.
              </v-alert>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>
