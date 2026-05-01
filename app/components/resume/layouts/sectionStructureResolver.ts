import type { ResumeApiItem } from '~/services/resumeApi'

export type ResumeStructureMode = 'structure-1' | 'structure-2'
export type ResumeSectionDescriptor = {
  id: string
  blockKey: string
  rendererKey?: string
}

export type ResolvedZones = {
  main: ResumeSectionDescriptor[]
  aside: ResumeSectionDescriptor[]
}

const STRUCTURE_1_ORDER: ResumeSectionDescriptor[] = [
  { id: 'contact', blockKey: 'contact' },
  { id: 'profile', blockKey: 'profile' },
  { id: 'experience', blockKey: 'experience', rendererKey: 'experience' },
  { id: 'education', blockKey: 'education', rendererKey: 'education' },
  { id: 'skills', blockKey: 'skills', rendererKey: 'skill' },
  { id: 'projects', blockKey: 'projects', rendererKey: 'project' },
  { id: 'languages', blockKey: 'languages', rendererKey: 'language' },
  { id: 'references', blockKey: 'references', rendererKey: 'reference' },
  { id: 'certifications', blockKey: 'certifications', rendererKey: 'certification' },
  { id: 'interests', blockKey: 'interests', rendererKey: 'hobby' },
]

const STRUCTURE_2_MAIN: ResumeSectionDescriptor[] = [
  { id: 'profile', blockKey: 'profile' },
  { id: 'experience', blockKey: 'experience', rendererKey: 'experience' },
  { id: 'projects', blockKey: 'projects', rendererKey: 'project' },
  { id: 'education', blockKey: 'education', rendererKey: 'education' },
]
const STRUCTURE_2_ASIDE: ResumeSectionDescriptor[] = [
  { id: 'contact', blockKey: 'contact' },
  { id: 'skills', blockKey: 'skills', rendererKey: 'skill' },
  { id: 'languages', blockKey: 'languages', rendererKey: 'language' },
  { id: 'references', blockKey: 'references', rendererKey: 'reference' },
  { id: 'certifications', blockKey: 'certifications', rendererKey: 'certification' },
  { id: 'interests', blockKey: 'interests', rendererKey: 'hobby' },
]

function hasText(value: unknown) {
  return typeof value === 'string' && value.trim().length > 0
}

export function isSectionEmpty(resume: ResumeApiItem, sectionId: string) {
  if (sectionId === 'contact') {
    const info = resume.resumeInformation
    return ![info?.email, info?.phone, info?.adresse, info?.birthDate, info?.homepage, info?.repo_profile].some(hasText)
  }
  if (sectionId === 'profile') return !hasText(resume.resumeInformation?.profileText)
  if (sectionId === 'experience') return !(resume.experiences?.length)
  if (sectionId === 'education') return !(resume.educations?.length)
  if (sectionId === 'skills') return !(resume.skills?.length)
  if (sectionId === 'projects') return !(resume.projects?.length)
  if (sectionId === 'languages') return !(resume.languages?.length)
  if (sectionId === 'references') return !(resume.references?.length)
  if (sectionId === 'certifications') return !(resume.certifications?.length)
  if (sectionId === 'interests') return !(resume.hobbies?.length)
  return true
}

export function resolveLayoutZones(structure?: string): ResolvedZones {
  if (structure === 'structure-2') {
    return { main: STRUCTURE_2_MAIN, aside: STRUCTURE_2_ASIDE }
  }
  return { main: STRUCTURE_1_ORDER, aside: [] }
}
