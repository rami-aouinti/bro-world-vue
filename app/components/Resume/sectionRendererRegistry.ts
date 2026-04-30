import type { Component } from "vue";

// Exemples de renderers (à créer selon ton projet)
import ExperienceTimeline from "./sections/ExperienceTimeline.vue";
import ExperienceCards from "./sections/ExperienceCards.vue";
import ExperienceList from "./sections/ExperienceList.vue";
import EducationTimeline from "./sections/EducationTimeline.vue";
import EducationCards from "./sections/EducationCards.vue";
import EducationList from "./sections/EducationList.vue";
import SkillsClassic from "./sections/SkillsClassic.vue";
import SkillsText from "./sections/SkillsText.vue";
import SkillsStars from "./sections/SkillsStars.vue";
import SkillsDots from "./sections/SkillsDots.vue";
import SkillsProgressLine from "./sections/SkillsProgressLine.vue";
import SkillsProgressCircle from "./sections/SkillsProgressCircle.vue";

// fallback ultra important
const FALLBACK = {
  experience: "classic",
  education: "classic",
  skills: "classic",
  languages: "classic",
  certifications: "classic",
  references: "classic",
  projects: "classic",
  interests: "classic"
} as const;

export const sectionRendererRegistry: Record<string, Record<string, Component>> = {
  experience: {
    classic: ExperienceList,
    timeline: ExperienceTimeline,
    cards: ExperienceCards,
    list: ExperienceList,
    "two-columns": ExperienceCards
  },
  education: {
    classic: EducationList,
    timeline: EducationTimeline,
    cards: EducationCards,
    list: EducationList,
    "two-columns": EducationCards
  },
  skills: {
    classic: SkillsClassic,
    text: SkillsText,
    stars: SkillsStars,
    dots: SkillsDots,
    "progress-line": SkillsProgressLine,
    "progress-circle": SkillsProgressCircle
  },
  languages: {
    classic: SkillsClassic,
    text: SkillsText,
    stars: SkillsStars,
    dots: SkillsDots,
    "progress-line": SkillsProgressLine,
    "progress-circle": SkillsProgressCircle
  },
  certifications: {
    classic: ExperienceList,
    timeline: ExperienceTimeline,
    cards: ExperienceCards,
    list: ExperienceList,
    "two-columns": ExperienceCards
  },
  references: {
    classic: ExperienceList,
    timeline: ExperienceTimeline,
    cards: ExperienceCards,
    list: ExperienceList,
    "two-columns": ExperienceCards
  },
  projects: {
    classic: ExperienceList,
    timeline: ExperienceTimeline,
    cards: ExperienceCards,
    list: ExperienceList,
    "two-columns": ExperienceCards
  },
  interests: {
    classic: ExperienceList,
    timeline: ExperienceTimeline,
    cards: ExperienceCards,
    list: ExperienceList,
    "two-columns": ExperienceCards
  }
};

export function resolveSectionRenderer(sectionKey: string, variant: string) {
  const sectionMap = sectionRendererRegistry[sectionKey];
  if (!sectionMap) return null;
  return sectionMap[variant] ?? sectionMap[FALLBACK[sectionKey as keyof typeof FALLBACK]] ?? null;
}
