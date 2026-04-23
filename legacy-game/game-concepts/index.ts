import { beloteConcept } from "./belote";
import { chessConcept } from "./chess";
import { solitaireConcept } from "./solitaire";
import { sudokuConcept } from "./sudoku";
import type { GameConcept } from "./types";

const fallbackConcept: GameConcept = {
  slug: "default",
  title: "Concept en préparation",
  coreLoop: [
    "Choisir un mode de jeu.",
    "Compléter une boucle courte et satisfaisante.",
    "Progresser via objectifs et feedback immédiat.",
  ],
  rulesSummary: [
    "Règles détaillées en cours de finalisation.",
    "Difficulté progressive selon le profil joueur.",
  ],
  uxMockSections: [
    "Vue principale du plateau.",
    "Sidebar: statut, objectifs, actions rapides.",
    "Bloc d'aide contextuelle en direct.",
  ],
  plannedModes: ["ai", "pvp"],
  milestones: [
    "M1: prototype jouable.",
    "M2: équilibrage et instrumentation analytics.",
    "M3: release publique incrémentale.",
  ],
};

export const gameConceptsBySlug: Record<string, GameConcept> = {
  belote: beloteConcept,
  chess: chessConcept,
  solitaire: solitaireConcept,
  sudoku: sudokuConcept,
};

export { fallbackConcept };
export type { GameConcept } from "./types";
