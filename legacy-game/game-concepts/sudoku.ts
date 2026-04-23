import type { GameConcept } from "./types";

export const sudokuConcept: GameConcept = {
  slug: "sudoku",
  title: "Sudoku quotidien",
  coreLoop: [
    "Observer lignes/colonnes/blocs.",
    "Poser un chiffre certain ou une note.",
    "Résoudre toute la grille sans contradiction.",
  ],
  rulesSummary: [
    "Chaque ligne contient 1 à 9 une seule fois.",
    "Chaque colonne contient 1 à 9 une seule fois.",
    "Chaque bloc 3x3 contient 1 à 9 une seule fois.",
  ],
  uxMockSections: [
    "Grille interactive + notes candidates.",
    "Panel d'assistance (indices, erreurs, chrono).",
    "Hub défis quotidiens et progression de série.",
  ],
  plannedModes: ["ai"],
  milestones: [
    "M1: générateur grilles + validateur.",
    "M2: niveaux expert et mode sans erreurs.",
    "M3: classements journaliers.",
  ],
};
