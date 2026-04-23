export interface GameAsidePanelAction {
  id: string;
  label: string;
  disabled?: boolean;
}

export interface GameAsidePanelChip {
  id: string;
  label: string;
  value: string | number;
  color?: string;
  variant?: "flat" | "tonal" | "outlined" | "text" | "plain" | "elevated";
  icon?: string;
}

export interface GameAsidePanelState {
  gameKey: string;
  title: string;
  phase: string;
  turnLabel: string;
  status: string;
  kpis: GameAsidePanelChip[];
  highlights: string[];
  actions?: GameAsidePanelAction[];
}
