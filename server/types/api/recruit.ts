import type { ApiObject } from './common'

export const RECRUIT_APPLICATION_STATUSES = [
  'WAITING',
  'SCREENING',
  'INTERVIEW_PLANNED',
  'INTERVIEW_DONE',
  'OFFER_SENT',
  'HIRED',
  'REJECTED',
] as const

export type RecruitApplicationStatus =
  (typeof RECRUIT_APPLICATION_STATUSES)[number]

export type RecruitJobSummary = {
  id: string
  slug: string
  title: string
  company: string
  location: string
  contractType: string
  workMode: string
  schedule: string
  createdAt?: string
  owner: boolean
  apply: boolean
}

export type RecruitMyAppliedJobEntry = {
  applicationId: string
  status: RecruitApplicationStatus
  appliedAt: string
  job: RecruitJobSummary
}

export type RecruitMyJobsResponse = {
  createdJobs: RecruitJobSummary[]
  appliedJobs: RecruitMyAppliedJobEntry[]
}

export type RecruitResumeSection = {
  id: string
  title: string
  description: string
}

export type RecruitResume = {
  id: string
  documentUrl: string | null
  experiences: RecruitResumeSection[]
  educations: RecruitResumeSection[]
  skills: RecruitResumeSection[]
  languages: RecruitResumeSection[]
  certifications: RecruitResumeSection[]
  projects: RecruitResumeSection[]
  references: RecruitResumeSection[]
  hobbies: RecruitResumeSection[]
}

export type RecruitResumeCreatePayload = Partial<{
  document: File
  experiences: Array<{ title: string; description?: string }>
  educations: Array<{ title: string; description?: string }>
  skills: Array<{ title: string; description?: string }>
  languages: Array<{ title: string; description?: string }>
  certifications: Array<{ title: string; description?: string }>
  projects: Array<{ title: string; description?: string }>
  references: Array<{ title: string; description?: string }>
  hobbies: Array<{ title: string; description?: string }>
}>

export type RecruitResumeCreateResponse = {
  id: string
  documentUrl: string | null
}

export type RecruitApplicantCreatePayload = {
  resumeId: string
  coverLetter: string
}

export type RecruitDateMeta = {
  date: string
  timezone_type: number
  timezone: string
}

export type RecruitApplicant = {
  id: string
  coverLetter: string
  createdAt?: RecruitDateMeta
  updatedAt?: RecruitDateMeta
}

export type RecruitApplicationCreatePayload = {
  applicantId: string
  jobId: string
}

export type RecruitApplicationSummary = {
  id: string
  status: RecruitApplicationStatus
}

export type RecruitOwnerJobApplication = {
  id: string
  status: RecruitApplicationStatus | string
  createdAt: string
  applicant: {
    id: string
    coverLetter: string
    user: {
      id: string
      username: string
      firstName: string
      lastName: string
      email: string
    }
    resume: {
      id: string
    }
  }
}

export type RecruitApplicationStatusPatchPayload = {
  status: RecruitApplicationStatus
  comment?: string
}

export type RecruitInterview = ApiObject & {
  id: string
  applicationId?: string
  type?: string
  scheduledAt?: string
  status?: string
  durationMinutes?: number
  meetingUrl?: string | null
  location?: string | null
  notes?: string | null
  [key: string]: unknown
}

export type RecruitInterviewCreatePayload = ApiObject

export type RecruitInterviewPatchPayload = ApiObject

export type RecruitDecisionSummary = ApiObject

export type RecruitInterviewFeedbackPayload = ApiObject

export type RecruitInterviewWithFeedback = ApiObject
