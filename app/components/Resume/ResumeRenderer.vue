<script setup lang="ts">
import { computed } from "vue";
import { buildThemeVars } from "./buildThemeVars";
import { resolveSectionRenderer } from "./sectionRendererRegistry";
import ResumeTemplateDecor from "./ResumeTemplateDecor.vue";

type ResumeData = Record<string, any>;

type TemplateConfig = {
  id: string;
  name: string;
  version: number;
  layout: "aside-left" | "aside-right" | "no-aside";
  structure: string;
  sections: Record<string, string>;
  theme: {
    palette: {
      primary: string;
      secondary: string;
      text: string;
      muted: string;
      pageBackground: string;
    };
    line: "soft" | "none" | "block";
    density: "compact" | "comfortable";
    textStyle: "roman" | "italic";
    showIcon: boolean;
  };
  aside?: { width?: string; height?: string };
  photo?: {
    position?: "left" | "right";
    size?: string;
    shape?: "circle" | "square" | "rounded";
    border?: string;
  };
  decor?: {
    enabled?: boolean;
    zIndex?: number;
    elements?: Array<{
      type: "circle" | "square" | "line" | "blob" | "ring" | "diamond" | "star" | "triangle" | "bar" | "pill" | "diamand";
      size: string | number;
      color: string;
      x: string | number;
      y: string | number;
      zIndex?: number;
    }>;
  };
};

const props = defineProps<{
  resumeData: ResumeData;
  templateConfig: TemplateConfig;
}>();

const themeVars = computed(() => buildThemeVars(props.templateConfig));

const layoutClass = computed(() => {
  switch (props.templateConfig.layout) {
    case "aside-right":
      return "layout-aside-right";
    case "no-aside":
      return "layout-no-aside";
    default:
      return "layout-aside-left";
  }
});

const orderedSections = computed(() => {
  // ordre global adaptable par structure
  const base = [
    "experience",
    "education",
    "skills",
    "languages",
    "certifications",
    "projects",
    "references",
    "interests"
  ];

  // exemple simple de structure
  if (props.templateConfig.structure === "structure-2") {
    return ["experience", "projects", "education", "skills", "languages", "certifications", "references", "interests"];
  }

  return base;
});

function getSectionItems(sectionKey: string) {
  return props.resumeData?.[sectionKey] ?? [];
}
</script>

<template>
  <div class="resume-root" :class="layoutClass" :style="themeVars">
    <!-- Aside -->
    <aside v-if="templateConfig.layout !== 'no-aside'" class="resume-aside">
      <slot name="aside-top" />
      <slot name="aside-content" />
    </aside>

    <!-- Main -->
    <main class="resume-main">
      <slot name="header" />

      <section
        v-for="sectionKey in orderedSections"
        :key="sectionKey"
        class="resume-section"
      >
        <component
          :is="resolveSectionRenderer(sectionKey, templateConfig.sections[sectionKey] || 'classic')"
          :items="getSectionItems(sectionKey)"
          :theme="templateConfig.theme"
          :show-icon="templateConfig.theme.showIcon"
          :section-key="sectionKey"
        />
      </section>
    </main>

    <ResumeTemplateDecor :decor="templateConfig.decor" />
  </div>
</template>

<style scoped>
.resume-root {
  position: relative;
  display: grid;
  min-height: 100%;
  color: var(--cv-text);
  background: var(--cv-page-bg);
  font-style: var(--cv-font-style);
  gap: var(--cv-density-gap);
}

.layout-aside-left {
  grid-template-columns: var(--cv-aside-width) 1fr;
}

.layout-aside-right {
  grid-template-columns: 1fr var(--cv-aside-width);
}

.layout-no-aside {
  grid-template-columns: 1fr;
}

.resume-aside {
  min-height: var(--cv-aside-height);
  border-inline-end: var(--cv-line-style);
  padding: 16px;
}

.layout-aside-right .resume-aside {
  order: 2;
  border-inline-end: none;
  border-inline-start: var(--cv-line-style);
}

.resume-main {
  padding: 20px;
}

.resume-section + .resume-section {
  margin-top: 14px;
}

</style>
