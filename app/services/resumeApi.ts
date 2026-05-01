import { privateApi } from '~/utils/http/privateApi'

export type ResumeApiPayload = Record<string, unknown>
export type ResumeApiSection = {
  title?: string | null
  description?: string | null
  startDate?: string | null
  endDate?: string | null
  company?: string | null
  school?: string | null
  location?: string | null
  level?: string | null
  attachments?: string[] | null
  home_page?: string | null
}
export type ResumeApiItem = {
  id: string
  documentUrl: string | null
  createdAt?: string | { date?: string | null } | null
  resumeInformation?: {
    fullName?: string | null
    email?: string | null
    phone?: string | null
    address?: string | null
    adresse?: string | null
    title?: string | null
    profileText?: string | null
    homepage?: string | null
    repo_profile?: string | null
    photo?: string | null
  } | null
  experiences?: ResumeApiSection[]
  educations?: ResumeApiSection[]
  skills?: ResumeApiSection[]
  languages?: ResumeApiSection[]
  certifications?: ResumeApiSection[]
  projects?: ResumeApiSection[]
  references?: ResumeApiSection[]
  hobbies?: ResumeApiSection[]
}

export async function listMyResumes() {
  return privateApi.request<ResumeApiItem[]>(
    '/api/v1/recruit/private/me/resumes',
  )
}

export async function createResume(payload: ResumeApiPayload) {
  return privateApi.request<{ id?: string }>('/api/v1/recruit/resumes', {
    method: 'POST',
    body: payload,
  })
}

export async function updateResume(
  resumeId: string,
  payload: ResumeApiPayload,
) {
  return privateApi.request(
    `/api/v1/recruit/private/me/resumes/${encodeURIComponent(resumeId)}`,
    {
      method: 'PATCH',
      body: payload,
    },
  )
}

export async function deleteResume(resumeId: string) {
  return privateApi.request(
    `/api/v1/recruit/private/me/resumes/${encodeURIComponent(resumeId)}`,
    {
      method: 'DELETE',
    },
  )
}
