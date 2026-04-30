import type { GameConcept } from './types'

export const beloteConcept: GameConcept = {
  slug: 'belote',
  title: 'Belote compétitive',
  coreLoop: [
    'Distribuer, annoncer, puis jouer un pli.',
    "Optimiser coupe et maîtrise d'atout.",
    'Calculer score de manche et préparer la suivante.',
  ],
  rulesSummary: [
    'Atout annoncé en début de manche.',
    'Obligation de fournir/couper selon les règles de la table.',
    'La manche se termine au dernier pli puis comptage des points.',
  ],
  uxMockSections: [
    'Table 2D avec positions joueurs et historique des plis.',
    'Bandeau annonces, score et équipe en tête.',
    'Aside stratégique: probabilités cartes restantes.',
  ],
  plannedModes: ['ai', 'pvp', 'online'],
  monetizationNotes: [
    'Pass saisonnier cosmétique (dos de cartes, emotes).',
    'Tickets tournois premium avec récompenses en coins.',
  ],
  milestones: [
    'M1: règles équipe/free-for-all stables.',
    'M2: IA niveaux facile/moyen/difficile.',
    'M3: matchmaking classé et saisons.',
  ],
}
