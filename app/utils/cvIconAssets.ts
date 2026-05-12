import awardRibbon from '~/assets/icons/cv/award-ribbon.svg?url'
import birthday from '~/assets/icons/cv/birthday.svg?url'
import bookOpen from '~/assets/icons/cv/book-open.svg?url'
import briefcase from '~/assets/icons/cv/briefcase.svg?url'
import certificate from '~/assets/icons/cv/certificate.svg?url'
import contactCard from '~/assets/icons/cv/contact-card.svg?url'
import diploma from '~/assets/icons/cv/diploma.svg?url'
import educationCap from '~/assets/icons/cv/education-cap.svg?url'
import email from '~/assets/icons/cv/email.svg?url'
import github from '~/assets/icons/cv/github.svg?url'
import hobbyGame from '~/assets/icons/cv/hobby-game.svg?url'
import hobbyHeart from '~/assets/icons/cv/hobby-heart.svg?url'
import hobbyPalette from '~/assets/icons/cv/hobby-palette.svg?url'
import homepage from '~/assets/icons/cv/homepage.svg?url'
import languagesChat from '~/assets/icons/cv/languages-chat.svg?url'
import languagesGlobe from '~/assets/icons/cv/languages-globe.svg?url'
import linkedin from '~/assets/icons/cv/linkedin.svg?url'
import location from '~/assets/icons/cv/location.svg?url'
import phone from '~/assets/icons/cv/phone.svg?url'
import portfolio from '~/assets/icons/cv/portfolio.svg?url'
import profileBadge from '~/assets/icons/cv/profile-badge.svg?url'
import profileSummary from '~/assets/icons/cv/profile-summary.svg?url'
import profileUser from '~/assets/icons/cv/profile-user.svg?url'
import projectsFolder from '~/assets/icons/cv/projects-folder.svg?url'
import projectsKanban from '~/assets/icons/cv/projects-kanban.svg?url'
import projectsRocket from '~/assets/icons/cv/projects-rocket.svg?url'
import referenceCard from '~/assets/icons/cv/reference-card.svg?url'
import referencesPeople from '~/assets/icons/cv/references-people.svg?url'
import skillsCode from '~/assets/icons/cv/skills-code.svg?url'
import skillsStar from '~/assets/icons/cv/skills-star.svg?url'
import skillsTools from '~/assets/icons/cv/skills-tools.svg?url'
import timeline from '~/assets/icons/cv/timeline.svg?url'
import translate from '~/assets/icons/cv/translate.svg?url'
import university from '~/assets/icons/cv/university.svg?url'
import webLink from '~/assets/icons/cv/web-link.svg?url'
import workHistory from '~/assets/icons/cv/work-history.svg?url'

export const CV_ICON_PREFIX = 'cv-svg:'

export const CV_ICON_ASSETS = {
  'award-ribbon': awardRibbon,
  birthday,
  'book-open': bookOpen,
  briefcase,
  certificate,
  'contact-card': contactCard,
  diploma,
  'education-cap': educationCap,
  email,
  github,
  'hobby-game': hobbyGame,
  'hobby-heart': hobbyHeart,
  'hobby-palette': hobbyPalette,
  homepage,
  'languages-chat': languagesChat,
  'languages-globe': languagesGlobe,
  linkedin,
  location,
  phone,
  portfolio,
  'profile-badge': profileBadge,
  'profile-summary': profileSummary,
  'profile-user': profileUser,
  'projects-folder': projectsFolder,
  'projects-kanban': projectsKanban,
  'projects-rocket': projectsRocket,
  'reference-card': referenceCard,
  'references-people': referencesPeople,
  'skills-code': skillsCode,
  'skills-star': skillsStar,
  'skills-tools': skillsTools,
  timeline,
  translate,
  university,
  'web-link': webLink,
  'work-history': workHistory,
} as const

export type CvIconAssetName = keyof typeof CV_ICON_ASSETS

export const cvIcon = (name: CvIconAssetName) => `${CV_ICON_PREFIX}${name}`

export function isCvIconAsset(
  icon: unknown,
): icon is `${typeof CV_ICON_PREFIX}${CvIconAssetName}` {
  return typeof icon === 'string' && icon.startsWith(CV_ICON_PREFIX)
}

export function resolveCvIconAsset(icon: unknown): string | undefined {
  if (!isCvIconAsset(icon)) return undefined
  const key = icon.slice(CV_ICON_PREFIX.length) as CvIconAssetName
  return CV_ICON_ASSETS[key]
}

export const CV_SECTION_ICON_OPTIONS = {
  contact: [
    cvIcon('contact-card'),
    cvIcon('email'),
    cvIcon('phone'),
    cvIcon('location'),
  ],
  profile: [
    cvIcon('profile-user'),
    cvIcon('profile-badge'),
    cvIcon('profile-summary'),
  ],
  experience: [cvIcon('briefcase'), cvIcon('work-history'), cvIcon('timeline')],
  education: [
    cvIcon('education-cap'),
    cvIcon('university'),
    cvIcon('book-open'),
  ],
  skills: [
    cvIcon('skills-tools'),
    cvIcon('skills-star'),
    cvIcon('skills-code'),
  ],
  languages: [
    cvIcon('languages-globe'),
    cvIcon('languages-chat'),
    cvIcon('translate'),
  ],
  certifications: [
    cvIcon('certificate'),
    cvIcon('award-ribbon'),
    cvIcon('diploma'),
  ],
  references: [
    cvIcon('references-people'),
    cvIcon('reference-card'),
    cvIcon('contact-card'),
  ],
  projects: [
    cvIcon('projects-folder'),
    cvIcon('projects-rocket'),
    cvIcon('projects-kanban'),
  ],
  hobbies: [
    cvIcon('hobby-heart'),
    cvIcon('hobby-palette'),
    cvIcon('hobby-game'),
  ],
  interests: [
    cvIcon('hobby-heart'),
    cvIcon('hobby-palette'),
    cvIcon('hobby-game'),
  ],
}

export const CV_CONTACT_ICON_OPTIONS = {
  email: [cvIcon('email'), cvIcon('contact-card'), cvIcon('web-link')],
  phone: [cvIcon('phone'), cvIcon('contact-card')],
  birthDate: [cvIcon('birthday'), cvIcon('award-ribbon')],
  adresse: [cvIcon('location'), cvIcon('homepage'), cvIcon('web-link')],
  homepage: [cvIcon('homepage'), cvIcon('portfolio'), cvIcon('web-link')],
  repo_profile: [cvIcon('github'), cvIcon('linkedin'), cvIcon('portfolio')],
}

export function cvIconTitle(icon: string): string {
  if (!isCvIconAsset(icon)) return icon
  return icon
    .slice(CV_ICON_PREFIX.length)
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}
