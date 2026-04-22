<script setup lang="ts">
definePageMeta({ layout: 'job', title: 'Jobs Apply' })

const { t } = useI18n()

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

const jobsNavItems = computed(() => [
  {
    title: t('world.jobs.nav.offers'),
    to: '/world/jobs/offers',
    icon: 'mdi-briefcase-outline',
  },
  {
    title: t('world.jobs.nav.myOffers'),
    to: '/world/jobs/my-offers',
    icon: 'mdi-account-tie-outline',
  },
  {
    title: t('world.jobs.nav.applications'),
    to: '/world/jobs/applications',
    icon: 'mdi-file-document-outline',
  },
  {
    title: t('world.jobs.nav.apply'),
    to: '/world/jobs/apply',
    icon: 'mdi-send-outline',
  },
  {
    title: t('world.jobs.nav.admin'),
    to: '/world/jobs/admin',
    icon: 'mdi-shield-crown-outline',
    rootOnly: true,
  },
])

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

const applications = ref<CandidateApplication[]>([])

const statusLabel = computed<Record<ApplicationStatus, string>>(() => ({
  draft: t('world.jobs.apply.status.draft'),
  submitted: t('world.jobs.apply.status.submitted'),
  withdrawn: t('world.jobs.apply.status.withdrawn'),
}))

const statusColor: Record<ApplicationStatus, string> = {
  draft: 'warning',
  submitted: 'success',
  withdrawn: 'error',
}

const tableHeaders = computed(() => [
  { title: t('world.jobs.apply.table.id'), key: 'id' },
  { title: t('world.jobs.apply.table.jobId'), key: 'jobId' },
  { title: t('world.jobs.apply.table.candidate'), key: 'candidateName' },
  { title: t('world.jobs.apply.table.email'), key: 'email' },
  { title: t('world.jobs.apply.table.portfolio'), key: 'portfolioUrl' },
  { title: t('world.jobs.apply.table.status'), key: 'status' },
  { title: t('world.jobs.apply.table.updated'), key: 'updatedAt' },
])

const requiredRule = (value: string | number | boolean | null) =>
  (value !== null && value !== '') || t('world.jobs.apply.validation.required')
const emailRule = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ||
  t('world.jobs.apply.validation.invalidEmail')
const portfolioRule = (value: string) => {
  try {
    const parsed = new URL(value)
    return (
      ['http:', 'https:'].includes(parsed.protocol) ||
      t('world.jobs.apply.validation.invalidPortfolioUrl')
    )
  } catch {
    return t('world.jobs.apply.validation.invalidPortfolioUrl')
  }
}
const coverLetterRule = (value: string) =>
  value.trim().length >= 120 ||
  t('world.jobs.apply.validation.coverLetterMin', { min: 120 })
const phoneRule = (value: string) =>
  /^[+\d\s().-]{8,20}$/.test(value) ||
  t('world.jobs.apply.validation.invalidPhone')

const cvValidationError = computed(() => {
  if (!cvFile.value) return t('world.jobs.apply.validation.cvRequired')

  const fileExtension = cvFile.value.name.split('.').pop()?.toLowerCase() || ''
  if (!allowedCvExtensions.includes(fileExtension))
    return t('world.jobs.apply.validation.invalidFileType', {
      types: allowedCvExtensions.join(', '),
    })

  if (cvFile.value.type && !allowedCvMimeTypes.includes(cvFile.value.type))
    return t('world.jobs.apply.validation.invalidCvMimeType')

  if (cvFile.value.size > maxCvSizeBytes)
    return t('world.jobs.apply.validation.cvTooLarge', { max: '5MB' })

  return ''
})

const selectedApplication = computed(() => {
  if (!selectedApplicationId.value) return null

  return (
    applications.value.find((app) => app.id === selectedApplicationId.value) ||
    null
  )
})

const createDuplicateKey = (jobId: string, email: string) =>
  `${jobId.trim().toLowerCase()}::${email.trim().toLowerCase()}`

const createCvFingerprint = (file: File) =>
  `${file.name}-${file.size}-${file.lastModified}`

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
  if (!isFormValid) return false

  if (cvValidationError.value) {
    errorMessage.value = cvValidationError.value
    return false
  }

  if (
    applicationForm.authorizedToWork === false ||
    applicationForm.yearsExperience === null ||
    applicationForm.yearsExperience < 2
  ) {
    errorMessage.value = t('world.jobs.apply.errors.knockoutCriteria')
    return false
  }

  return true
}

const buildApplication = (status: ApplicationStatus): CandidateApplication => {
  const now = new Date().toISOString()
  const duplicateKey = createDuplicateKey(
    applicationForm.jobId,
    applicationForm.email,
  )
  const baseCvFingerprint = cvFile.value
    ? createCvFingerprint(cvFile.value)
    : ''

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
    events: [
      {
        status,
        at: now,
        note:
          status === 'draft'
            ? t('world.jobs.apply.events.draftSaved')
            : t('world.jobs.apply.events.submitted'),
      },
    ],
  }
}

const hasDuplicateApplication = (candidate: CandidateApplication) => {
  return applications.value.some(
    (existing) =>
      existing.status !== 'withdrawn' &&
      existing.duplicateKey === candidate.duplicateKey,
  )
}

const saveDraft = async () => {
  clearMessages()
  const isValid = await validateForm()
  if (!isValid) return

  const candidate = buildApplication('draft')
  if (hasDuplicateApplication(candidate)) {
    errorMessage.value = t('world.jobs.apply.errors.duplicateDraft')
    return
  }

  applications.value.unshift(candidate)
  selectedApplicationId.value = candidate.id
  successMessage.value = t('world.jobs.apply.success.draftSaved')
  resetForm()
}

const submitApplication = async () => {
  clearMessages()
  const isValid = await validateForm()
  if (!isValid) return

  const candidate = buildApplication('submitted')
  if (hasDuplicateApplication(candidate)) {
    errorMessage.value = t('world.jobs.apply.errors.duplicateApplication')
    return
  }

  applications.value.unshift(candidate)
  selectedApplicationId.value = candidate.id
  successMessage.value = t('world.jobs.apply.success.applicationSubmitted')
  resetForm()
}

const handleRowClick = (_event: Event, ctx: { item: CandidateApplication }) => {
  selectedApplicationId.value = ctx.item.id
}

const updateApplicationStatus = (status: ApplicationStatus, note: string) => {
  clearMessages()
  if (!selectedApplication.value) {
    errorMessage.value = t('world.jobs.apply.errors.selectApplication')
    return
  }

  selectedApplication.value.status = status
  selectedApplication.value.updatedAt = new Date().toISOString()
  selectedApplication.value.events.unshift({
    status,
    at: new Date().toISOString(),
    note,
  })

  successMessage.value = t('world.jobs.apply.success.statusUpdated', {
    status: statusLabel.value[status],
  })
}
</script>

<template>
  <div>
    <WorldModuleDrawers
      :module-title="t('world.jobs.label')"
      module-icon="mdi-briefcase-search-outline"
      :module-description="t('world.jobs.moduleDescription')"
      :nav-items="jobsNavItems"
      :action-label="t('world.jobs.apply.actions.apply')"
    />

    <v-container fluid>
      <v-row>
        <v-col cols="12" lg="7">
          <v-card>
            <v-card-title class="d-flex align-center justify-space-between">
              <span>{{ t('world.jobs.apply.form.title') }}</span>
              <v-chip color="primary" variant="tonal">{{
                t('world.jobs.apply.form.atsReady')
              }}</v-chip>
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
                    <v-text-field
                      v-model="applicationForm.jobId"
                      :label="t('world.jobs.apply.form.jobId')"
                      :rules="[requiredRule]"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="applicationForm.email"
                      :label="t('world.jobs.apply.form.email')"
                      :rules="[requiredRule, emailRule]"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="applicationForm.firstName"
                      :label="t('world.jobs.apply.form.firstName')"
                      :rules="[requiredRule]"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="applicationForm.lastName"
                      :label="t('world.jobs.apply.form.lastName')"
                      :rules="[requiredRule]"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="applicationForm.phone"
                      :label="t('world.jobs.apply.form.phone')"
                      :rules="[requiredRule, phoneRule]"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="applicationForm.portfolioUrl"
                      :label="t('world.jobs.apply.form.portfolioUrl')"
                      :rules="[requiredRule, portfolioRule]"
                    />
                  </v-col>
                  <v-col cols="12">
                    <v-file-input
                      v-model="cvFile"
                      :label="t('world.jobs.apply.form.cvLabel')"
                      accept=".pdf,.doc,.docx"
                      prepend-icon="mdi-file-account-outline"
                      show-size
                      :error-messages="
                        cvValidationError ? [cvValidationError] : []
                      "
                      :rules="[
                        () =>
                          !cvValidationError ||
                          cvValidationError === '' ||
                          cvValidationError,
                      ]"
                    />
                  </v-col>
                  <v-col cols="12">
                    <v-textarea
                      v-model="applicationForm.coverLetter"
                      :label="t('world.jobs.apply.form.coverLetter')"
                      rows="6"
                      counter="1200"
                      :rules="[requiredRule, coverLetterRule]"
                    />
                  </v-col>
                </v-row>

                <v-divider class="my-6" />

                <h4 class="text-subtitle-1 mb-3">
                  {{ t('world.jobs.apply.form.knockoutQuestions') }}
                </h4>

                <v-row>
                  <v-col cols="12" md="6">
                    <AppSelect
                      v-model="applicationForm.authorizedToWork"
                      :label="t('world.jobs.apply.form.authorizedToWork')"
                      :items="[
                        { title: t('world.common.yes'), value: true },
                        { title: t('world.common.no'), value: false },
                      ]"
                      :rules="[requiredRule]"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model.number="applicationForm.yearsExperience"
                      type="number"
                      :label="t('world.jobs.apply.form.yearsExperience')"
                      :min="0"
                      :max="40"
                      :rules="[requiredRule]"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model.number="applicationForm.expectedSalary"
                      type="number"
                      :label="t('world.jobs.apply.form.expectedSalary')"
                      :min="30000"
                      :max="500000"
                      :rules="[requiredRule]"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="applicationForm.availableDate"
                      type="date"
                      :label="t('world.jobs.apply.form.availableDate')"
                      :rules="[requiredRule]"
                    />
                  </v-col>
                  <v-col cols="12">
                    <AppSelect
                      v-model="applicationForm.openToRelocate"
                      :label="t('world.jobs.apply.form.openToRelocation')"
                      :items="[
                        { title: t('world.common.yes'), value: true },
                        { title: t('world.common.no'), value: false },
                      ]"
                      :rules="[requiredRule]"
                    />
                  </v-col>
                </v-row>

                <div class="d-flex flex-wrap ga-3 mt-6">
                  <v-btn
                    color="warning"
                    variant="flat"
                    prepend-icon="mdi-content-save-outline"
                    @click="saveDraft"
                  >
                    {{ t('world.jobs.apply.actions.saveDraft') }}
                  </v-btn>
                  <v-btn
                    color="primary"
                    prepend-icon="mdi-send-outline"
                    @click="submitApplication"
                  >
                    {{ t('world.jobs.apply.actions.submitApplication') }}
                  </v-btn>
                  <v-btn
                    variant="text"
                    prepend-icon="mdi-refresh"
                    @click="resetForm"
                    >{{ t('world.jobs.apply.actions.reset') }}</v-btn
                  >
                </div>
              </v-form>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" lg="5">
          <v-card class="mb-4">
            <v-card-title>{{
              t('world.jobs.apply.tracking.candidateTracking')
            }}</v-card-title>
            <v-card-text>
              <v-data-table
                :headers="tableHeaders"
                :items="applications"
                item-value="id"
                density="comfortable"
                @click:row="handleRowClick"
              >
                <template #item.portfolioUrl="{ item }">
                  <a
                    :href="item.portfolioUrl"
                    target="_blank"
                    rel="noreferrer"
                    >{{ t('world.jobs.apply.table.portfolioLink') }}</a
                  >
                </template>
                <template #item.status="{ item }">
                  <v-chip
                    :color="statusColor[item.status]"
                    size="small"
                    variant="tonal"
                  >
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
              <span>{{ t('world.jobs.apply.tracking.applicationState') }}</span>
              <v-chip
                v-if="selectedApplication"
                :color="statusColor[selectedApplication.status]"
                variant="tonal"
              >
                {{ statusLabel[selectedApplication.status] }}
              </v-chip>
            </v-card-title>
            <v-card-text>
              <template v-if="selectedApplication">
                <p class="text-body-2 mb-3">
                  <strong>{{ selectedApplication.candidateName }}</strong> ·
                  {{ selectedApplication.email }}
                </p>
                <div class="d-flex flex-wrap ga-2 mb-4">
                  <v-btn
                    size="small"
                    color="success"
                    variant="tonal"
                    :disabled="selectedApplication.status === 'submitted'"
                    @click="
                      updateApplicationStatus(
                        'submitted',
                        t('world.jobs.apply.events.resubmittedByCandidate'),
                      )
                    "
                  >
                    {{ t('world.jobs.apply.actions.markSubmitted') }}
                  </v-btn>
                  <v-btn
                    size="small"
                    color="warning"
                    variant="tonal"
                    :disabled="selectedApplication.status === 'draft'"
                    @click="
                      updateApplicationStatus(
                        'draft',
                        t('world.jobs.apply.events.backToDraft'),
                      )
                    "
                  >
                    {{ t('world.jobs.apply.actions.markDraft') }}
                  </v-btn>
                  <v-btn
                    size="small"
                    color="error"
                    variant="tonal"
                    :disabled="selectedApplication.status === 'withdrawn'"
                    @click="
                      updateApplicationStatus(
                        'withdrawn',
                        t('world.jobs.apply.events.withdrawnByCandidate'),
                      )
                    "
                  >
                    {{ t('world.jobs.apply.actions.withdraw') }}
                  </v-btn>
                </div>

                <v-timeline density="compact" side="end" align="start">
                  <v-timeline-item
                    v-for="(event, index) in selectedApplication.events"
                    :key="`${selectedApplication.id}-${event.at}-${index}`"
                    dot-color="primary"
                    size="small"
                  >
                    <div class="text-caption text-medium-emphasis">
                      {{ new Date(event.at).toLocaleString() }}
                    </div>
                    <div>
                      {{ statusLabel[event.status] }} — {{ event.note }}
                    </div>
                  </v-timeline-item>
                </v-timeline>
              </template>

              <v-alert v-else type="info" variant="tonal">
                {{ t('world.jobs.apply.tracking.selectApplication') }}
              </v-alert>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>
