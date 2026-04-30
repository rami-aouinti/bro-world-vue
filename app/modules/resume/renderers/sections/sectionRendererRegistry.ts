import ExperienceCards from './ExperienceCards.vue'
import ExperienceList from './ExperienceList.vue'
import ExperienceTimeline from './ExperienceTimeline.vue'
import SkillsClassic from './SkillsClassic.vue'
import SkillsDots from './SkillsDots.vue'
import SkillsProgressCircle from './SkillsProgressCircle.vue'
import SkillsProgressLine from './SkillsProgressLine.vue'
import SkillsStars from './SkillsStars.vue'
import EducationCards from './EducationCards.vue'
import EducationClassic from './EducationClassic.vue'
import EducationList from './EducationList.vue'
import EducationTimeline from './EducationTimeline.vue'
import ProjectsCards from './ProjectsCards.vue'
import ProjectsClassic from './ProjectsClassic.vue'
import ProjectsList from './ProjectsList.vue'
import ProjectsTimeline from './ProjectsTimeline.vue'
import CertificationsCards from './CertificationsCards.vue'
import CertificationsClassic from './CertificationsClassic.vue'
import CertificationsList from './CertificationsList.vue'
import CertificationsTimeline from './CertificationsTimeline.vue'
import ReferencesCards from './ReferencesCards.vue'
import ReferencesClassic from './ReferencesClassic.vue'
import ReferencesList from './ReferencesList.vue'
import ReferencesTimeline from './ReferencesTimeline.vue'
import InterestsCards from './InterestsCards.vue'
import InterestsClassic from './InterestsClassic.vue'
import InterestsList from './InterestsList.vue'
import InterestsTimeline from './InterestsTimeline.vue'
import LanguagesCards from './LanguagesCards.vue'
import LanguagesClassic from './LanguagesClassic.vue'
import LanguagesDots from './LanguagesDots.vue'
import LanguagesList from './LanguagesList.vue'
import LanguagesProgressCircle from './LanguagesProgressCircle.vue'
import LanguagesProgressLine from './LanguagesProgressLine.vue'
import LanguagesStars from './LanguagesStars.vue'
import LanguagesTimeline from './LanguagesTimeline.vue'
import type {
  ResumeSectionRendererKey,
  ResumeSectionRendererVariant,
} from './types'

type RendererComponent = any

type SectionRendererRegistry = Record<
  ResumeSectionRendererKey,
  Partial<Record<ResumeSectionRendererVariant, RendererComponent>>
>

export const sectionRendererRegistry: SectionRendererRegistry = {
  experience: {
    timeline: ExperienceTimeline,
    cards: ExperienceCards,
    list: ExperienceList,
    classic: ExperienceList,
  },
  skills: {
    classic: SkillsClassic,
    stars: SkillsStars,
    dots: SkillsDots,
    'progress-line': SkillsProgressLine,
    'progress-circle': SkillsProgressCircle,
  },
  education: {
    classic: EducationClassic,
    timeline: EducationTimeline,
    cards: EducationCards,
    list: EducationList,
  },
  projects: {
    classic: ProjectsClassic,
    timeline: ProjectsTimeline,
    cards: ProjectsCards,
    list: ProjectsList,
  },
  certifications: {
    classic: CertificationsClassic,
    timeline: CertificationsTimeline,
    cards: CertificationsCards,
    list: CertificationsList,
  },
  references: {
    classic: ReferencesClassic,
    timeline: ReferencesTimeline,
    cards: ReferencesCards,
    list: ReferencesList,
  },
  interests: {
    classic: InterestsClassic,
    timeline: InterestsTimeline,
    cards: InterestsCards,
    list: InterestsList,
  },
  languages: {
    classic: LanguagesClassic,
    timeline: LanguagesTimeline,
    cards: LanguagesCards,
    list: LanguagesList,
    stars: LanguagesStars,
    dots: LanguagesDots,
    'progress-line': LanguagesProgressLine,
    'progress-circle': LanguagesProgressCircle,
  },
}

export function resolveSectionRenderer(
  section: ResumeSectionRendererKey,
  variant: ResumeSectionRendererVariant | string,
) {
  const sectionMap = sectionRendererRegistry[section]
  return (
    sectionMap[variant as ResumeSectionRendererVariant] ?? sectionMap.classic
  )
}
