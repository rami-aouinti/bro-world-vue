import type { GameConcept } from "./types";

export const solitaireConcept: GameConcept = {
  slug: "solitaire",
  title: "Solitaire classique",
  coreLoop: [
    "Piocher ou révéler une carte utile.",
    "Déplacer les cartes sur les colonnes en alternant les couleurs.",
    "Envoyer les cartes vers les fondations jusqu'à compléter les 4 familles.",
  ],
  rulesSummary: [
    "Une seule carte visible par colonne est jouable.",
    "Les colonnes se construisent en ordre décroissant avec alternance rouge/noir.",
    "Les fondations se construisent par famille de l'As au Roi.",
  ],
  uxMockSections: [
    "En-tête score/temps/coups.",
    "Zone plateau avec piles de fondation et colonnes.",
    "Panneau aide/context tips avec actions rapides.",
  ],
  plannedModes: ["ai"],
  milestones: [
    "M1: prototype drag & drop + validation de coups.",
    "M2: génération de parties solvables + undo illimité.",
    "M3: objectifs quotidiens et progression profil.",
  ],
};
