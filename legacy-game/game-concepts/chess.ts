import type { GameConcept } from "./types";

export const chessConcept: GameConcept = {
  slug: "chess",
  title: "Échecs tactiques",
  coreLoop: [
    "Analyser la position.",
    "Jouer un coup pour gagner matériel/espace.",
    "Convertir l'avantage jusqu'au mat.",
  ],
  rulesSummary: [
    "Déplacements standards FIDE (roque, prise en passant, promotion).",
    "Échec au roi obligatoire à traiter immédiatement.",
    "Victoire par mat, abandon ou temps écoulé.",
  ],
  uxMockSections: [
    "Échiquier central avec surbrillance coups légaux.",
    "Colonne historique + évaluation de position.",
    "Panneau de variantes pédagogiques pour débutants.",
  ],
  plannedModes: ["ai", "pvp", "online"],
  milestones: [
    "M1: moteur de règles complet.",
    "M2: puzzles tactiques et entraînement.",
    "M3: ligues hebdomadaires et replay partagé.",
  ],
};
