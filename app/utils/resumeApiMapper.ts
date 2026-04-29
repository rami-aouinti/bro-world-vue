export type ApiResumeSection = {
  id?: string
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

export type ApiResume = {
  id?: string
  documentUrl?: string | null
  resumeInformation?: {
    fullName?: string | null
    email?: string | null
    phone?: string | null
    address?: string | null
    adresse?: string | null
    homepage?: string | null
    repo_profile?: string | null
    birthDate?: string | null
    birthPlace?: string | null
    profileText?: string | null
    title?: string | null
  } | null
  experiences?: ApiResumeSection[]
  educations?: ApiResumeSection[]
  skills?: ApiResumeSection[]
  languages?: ApiResumeSection[]
  certifications?: ApiResumeSection[]
  projects?: ApiResumeSection[]
  references?: ApiResumeSection[]
  hobbies?: ApiResumeSection[]
}

export type BuilderResumeModel = {
  firstName: string
  lastName: string
  role: string
  email: string
  phone: string
  city: string
  country: string
  profile: string
  birthDate: string
  birthPlace: string
  homepage: string
  repoProfile: string
  experiences: Array<{ role: string; company: string; city: string; start: string; end: string; bullets: string[] }>
  education: Array<{ degree: string; school: string; city: string; start: string; end: string; note: string }>
  skills: Array<{ name: string; level: number }>
  languages: Array<{ name: string; level: number; countryCode?: string; flag?: string }>
  courses: Array<{ title: string; school: string; start: string; end: string; attachments?: string[] }>
  projects: Array<{ name: string; summary: string; repositoryUrl?: string; attachments?: string[] }>
  references: Array<{ name: string; company: string; email: string; phone: string }>
  hobbies: string[]
  documentUrl: string | null
  resumeInformation: {
    fullName: string
    email: string
    phone: string
    address: string
    // Keep API naming in this nested object (snake_case) to preserve round-trip values as-is.
    adresse: string
    homepage: string
    repo_profile: string
    birthDate: string
    birthPlace: string
    profileText: string
    title: string
  }
}

const CEFR_TO_PERCENT: Record<string, number> = {
  native: 100,
  bilingual: 100,
  c2: 100,
  c1: 90,
  b2: 75,
  b1: 60,
  a2: 40,
  a1: 20,
  advanced: 85,
  intermediate: 65,
  beginner: 30,
}

function normalizeText(value: unknown) {
  return String(value || '').trim()
}

function parseLevelToPercent(level: unknown) {
  const normalized = normalizeText(level).toLowerCase()
  if (!normalized) return 75

  const asNumber = Number(normalized)
  if (!Number.isNaN(asNumber)) {
    if (asNumber <= 5) return Math.max(20, Math.min(100, Math.round(asNumber * 20)))
    return Math.max(0, Math.min(100, Math.round(asNumber)))
  }

  return CEFR_TO_PERCENT[normalized] ?? 75
}

function percentToApiLanguageLevel(level: number) {
  if (level >= 98) return 'native'
  if (level >= 90) return 'c2'
  if (level >= 80) return 'c1'
  if (level >= 70) return 'b2'
  if (level >= 55) return 'b1'
  if (level >= 35) return 'a2'
  return 'a1'
}

function splitName(fullName: string) {
  const parts = fullName.split(/\s+/).filter(Boolean)
  const firstName = parts.shift() || ''
  const lastName = parts.join(' ')
  return { firstName, lastName }
}

function splitAddress(address: string) {
  const parts = address.split(',').map(part => part.trim()).filter(Boolean)
  return {
    city: parts[0] || '',
    country: parts.length > 1 ? parts[parts.length - 1] : '',
  }
}

function asArray<T>(value: T[] | null | undefined) {
  return Array.isArray(value) ? value : []
}

function splitBullets(description: string) {
  return description
    .split(/\n|•|-/g)
    .map(entry => entry.trim())
    .filter(Boolean)
}

export function fromApiResumeToBuilderModel(apiResume: ApiResume): BuilderResumeModel {
  const info = apiResume.resumeInformation || {}
  const fullName = normalizeText(info.fullName)
  const address = normalizeText(info.address || info.adresse)
  const { firstName, lastName } = splitName(fullName)
  const { city, country } = splitAddress(address)

  return {
    firstName,
    lastName,
    role: normalizeText(info.title),
    email: normalizeText(info.email),
    phone: normalizeText(info.phone),
    city,
    country,
    profile: normalizeText(info.profileText),
    birthDate: normalizeText(info.birthDate),
    birthPlace: normalizeText(info.birthPlace),
    homepage: normalizeText(info.homepage),
    repoProfile: normalizeText(info.repo_profile),
    experiences: asArray(apiResume.experiences).map(section => ({
      role: normalizeText(section.title),
      company: normalizeText(section.company),
      city: normalizeText(section.location),
      start: normalizeText(section.startDate),
      end: normalizeText(section.endDate),
      bullets: splitBullets(normalizeText(section.description)),
    })),
    education: asArray(apiResume.educations).map(section => ({
      degree: normalizeText(section.title),
      school: normalizeText(section.school),
      city: normalizeText(section.location),
      start: normalizeText(section.startDate),
      end: normalizeText(section.endDate),
      note: normalizeText(section.description),
    })),
    skills: asArray(apiResume.skills)
      .map(section => normalizeText(section.title))
      .filter(Boolean)
      .map(name => ({ name, level: 80 })),
    languages: asArray(apiResume.languages)
      .map(section => ({
        name: normalizeText(section.title),
        level: parseLevelToPercent(section.level),
      }))
      .filter(language => language.name),
    courses: asArray(apiResume.certifications).map(section => ({
      title: normalizeText(section.title),
      school: normalizeText(section.school || section.company),
      start: normalizeText(section.startDate),
      end: normalizeText(section.endDate),
      attachments: asArray(section.attachments).filter(Boolean),
    })),
    projects: asArray(apiResume.projects).map(section => ({
      name: normalizeText(section.title),
      summary: normalizeText(section.description),
      repositoryUrl: normalizeText(section.home_page) || undefined,
      attachments: asArray(section.attachments).filter(Boolean),
    })),
    references: asArray(apiResume.references).map(section => ({
      name: normalizeText(section.title),
      company: normalizeText(section.company || section.school),
      email: '',
      phone: normalizeText(section.description),
    })),
    hobbies: asArray(apiResume.hobbies)
      .map(section => normalizeText(section.title))
      .filter(Boolean),
    documentUrl: apiResume.documentUrl ?? null,
    resumeInformation: {
      fullName,
      email: normalizeText(info.email),
      phone: normalizeText(info.phone),
      address,
      adresse: normalizeText(info.adresse),
      homepage: normalizeText(info.homepage),
      repo_profile: normalizeText(info.repo_profile),
      birthDate: normalizeText(info.birthDate),
      birthPlace: normalizeText(info.birthPlace),
      profileText: normalizeText(info.profileText),
      title: normalizeText(info.title),
    },
  }
}

export function fromBuilderModelToApiPayload(builderResume: BuilderResumeModel): ApiResume {
  const fullName = normalizeText(`${builderResume.firstName} ${builderResume.lastName}`)
  const address = [builderResume.city, builderResume.country].map(normalizeText).filter(Boolean).join(', ')

  return {
    documentUrl: builderResume.documentUrl ?? null,
    resumeInformation: {
      fullName,
      email: normalizeText(builderResume.email),
      phone: normalizeText(builderResume.phone),
      adresse: address || null,
      homepage: normalizeText(builderResume.homepage) || null,
      repo_profile: normalizeText(builderResume.repoProfile) || null,
      birthDate: normalizeText(builderResume.birthDate) || null,
      birthPlace: normalizeText(builderResume.birthPlace) || null,
      profileText: normalizeText(builderResume.profile) || null,
      title: normalizeText(builderResume.role) || null,
    },
    experiences: builderResume.experiences.map((experience) => ({
      title: normalizeText(experience.role),
      description: experience.bullets.filter(Boolean).join('\n') || null,
      startDate: normalizeText(experience.start) || null,
      endDate: normalizeText(experience.end) || null,
      company: normalizeText(experience.company) || null,
      location: normalizeText(experience.city) || null,
    })),
    educations: builderResume.education.map((education) => ({
      title: normalizeText(education.degree),
      description: normalizeText(education.note) || null,
      startDate: normalizeText(education.start) || null,
      endDate: normalizeText(education.end) || null,
      school: normalizeText(education.school) || null,
      location: normalizeText(education.city) || null,
    })),
    skills: builderResume.skills
      .map(skill => normalizeText(skill.name))
      .filter(Boolean)
      .map(name => ({ title: name })),
    languages: builderResume.languages
      .map(language => ({
        title: normalizeText(language.name),
        level: percentToApiLanguageLevel(Number(language.level) || 0),
      }))
      .filter(language => language.title),
    certifications: builderResume.courses.map((course) => ({
      title: normalizeText(course.title),
      school: normalizeText(course.school) || null,
      startDate: normalizeText(course.start) || null,
      endDate: normalizeText(course.end) || null,
      attachments: asArray(course.attachments).filter(Boolean),
    })),
    projects: builderResume.projects.map((project) => ({
      title: normalizeText(project.name),
      description: normalizeText(project.summary) || null,
      home_page: normalizeText(project.repositoryUrl) || null,
      attachments: asArray(project.attachments).filter(Boolean),
    })),
    references: builderResume.references.map((reference) => ({
      title: normalizeText(reference.name),
      description: [normalizeText(reference.phone), normalizeText(reference.email)].filter(Boolean).join(' · ') || null,
      company: normalizeText(reference.company) || null,
    })),
    hobbies: builderResume.hobbies
      .map(hobby => normalizeText(hobby))
      .filter(Boolean)
      .map(title => ({ title })),
  }
}
