<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  watchEffect,
} from "vue";
import type { GameAsidePanelState } from "./types";
import GameTableScaffold from "./GameTableScaffold.vue";
import { useGameFeedback } from "~/composables/games/useGameFeedback";

const props = defineProps<{
  selectedPlayMode: "ai" | "pvp";
}>();
const emit = defineEmits<{
  (event: "panel-state", payload: GameAsidePanelState): void;
  (event: "game-finished", payload: { result: "win" | "lose" }): void;
}>();
const { t } = useI18n();
const { playUiSound, triggerVisualFeedback } = useGameFeedback();

type Player = "red" | "black";

interface Piece {
  player: Player;
  king: boolean;
}

type Cell = Piece | null;

type Board = Cell[][];

interface Position {
  row: number;
  col: number;
}

interface Move {
  to: Position;
  capture?: Position;
}

interface AvailableMoves {
  simpleMoves: Move[];
  captureMoves: Move[];
  followUpCaptureMoves: Move[];
}

const createInitialBoard = (): Board => {
  const board: Board = Array.from({ length: 8 }, () =>
    Array.from({ length: 8 }, () => null),
  );

  for (let row = 0; row < 8; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      if ((row + col) % 2 === 0) {
        continue;
      }

      if (row <= 2) {
        board[row][col] = { player: "black", king: false };
      } else if (row >= 5) {
        board[row][col] = { player: "red", king: false };
      }
    }
  }

  return board;
};

const currentPlayerLabel = (player: Player) =>
  player === "red"
    ? t("gameComponents.checkers.players.redTurn")
    : t("gameComponents.checkers.players.blackTurn");

const winnerLabel = (player: Player) =>
  player === "red"
    ? t("gameComponents.checkers.players.redWin")
    : t("gameComponents.checkers.players.blackWin");

const TURN_SECONDS = 60;

const board = ref<Board>(createInitialBoard());
const currentPlayer = ref<Player>("red");
const selected = ref<Position | null>(null);
const message = ref(currentPlayerLabel("red"));
const isThinking = ref(false);
const remainingSeconds = ref(TURN_SECONDS);
const intervalId = ref<ReturnType<typeof setInterval> | null>(null);
const forcedWinner = ref<Player | null>(null);
const mustContinueCapture = ref(false);
const gameFinishedEmitted = ref(false);

const timerProgress = computed(() =>
  Math.max(0, (remainingSeconds.value / TURN_SECONDS) * 100),
);
const hasInside = (row: number, col: number) =>
  row >= 0 && row < 8 && col >= 0 && col < 8;

const pieceAt = (position: Position) => board.value[position.row][position.col];

const movementDirections = (piece: Piece) => {
  if (piece.king) {
    return [1, -1];
  }

  return piece.player === "red" ? [-1] : [1];
};

const cloneBoard = (source: Board): Board =>
  source.map((row) =>
    row.map((cell) => {
      if (!cell) {
        return null;
      }

      return {
        player: cell.player,
        king: cell.king,
      };
    }),
  );

const calculateManMoves = (
  position: Position,
  piece: Piece,
  boardState: Board,
) => {
  const simpleMoves: Move[] = [];
  const captureMoves: Move[] = [];

  for (const rowDir of movementDirections(piece)) {
    for (const colDir of [-1, 1]) {
      const nextRow = position.row + rowDir;
      const nextCol = position.col + colDir;

      if (!hasInside(nextRow, nextCol)) {
        continue;
      }

      const nextCell = boardState[nextRow][nextCol];
      if (!nextCell) {
        simpleMoves.push({ to: { row: nextRow, col: nextCol } });
        continue;
      }

      if (nextCell.player === piece.player) {
        continue;
      }

      const jumpRow = nextRow + rowDir;
      const jumpCol = nextCol + colDir;
      if (!hasInside(jumpRow, jumpCol) || boardState[jumpRow][jumpCol]) {
        continue;
      }

      captureMoves.push({
        to: { row: jumpRow, col: jumpCol },
        capture: { row: nextRow, col: nextCol },
      });
    }
  }

  return { simpleMoves, captureMoves };
};

const calculateKingMoves = (
  position: Position,
  piece: Piece,
  boardState: Board,
) => {
  const simpleMoves: Move[] = [];
  const captureMoves: Move[] = [];

  for (const rowDir of [-1, 1]) {
    for (const colDir of [-1, 1]) {
      let nextRow = position.row + rowDir;
      let nextCol = position.col + colDir;
      let encounteredOpponent: Position | null = null;

      while (hasInside(nextRow, nextCol)) {
        const nextCell = boardState[nextRow][nextCol];

        if (!encounteredOpponent) {
          if (!nextCell) {
            simpleMoves.push({ to: { row: nextRow, col: nextCol } });
            nextRow += rowDir;
            nextCol += colDir;
            continue;
          }

          if (nextCell.player === piece.player) {
            break;
          }

          encounteredOpponent = { row: nextRow, col: nextCol };
          nextRow += rowDir;
          nextCol += colDir;
          continue;
        }

        if (nextCell) {
          break;
        }

        captureMoves.push({
          to: { row: nextRow, col: nextCol },
          capture: encounteredOpponent,
        });
        nextRow += rowDir;
        nextCol += colDir;
      }
    }
  }

  return { simpleMoves, captureMoves };
};

const calculateMoves = (
  position: Position,
  boardState: Board,
): Pick<AvailableMoves, "simpleMoves" | "captureMoves"> => {
  const piece = boardState[position.row][position.col];
  if (!piece) {
    return { simpleMoves: [], captureMoves: [] };
  }

  if (piece.king) {
    return calculateKingMoves(position, piece, boardState);
  }

  return calculateManMoves(position, piece, boardState);
};

const availableMoves = (position: Position): AvailableMoves => {
  const piece = pieceAt(position);
  if (!piece) {
    return {
      simpleMoves: [],
      captureMoves: [],
      followUpCaptureMoves: [],
    };
  }

  const { simpleMoves, captureMoves } = calculateMoves(position, board.value);
  const followUpCaptureMoves: Move[] = [];

  for (const captureMove of captureMoves) {
    const simulatedBoard = cloneBoard(board.value);
    const movingPiece = simulatedBoard[position.row][position.col];
    if (!movingPiece) {
      continue;
    }

    simulatedBoard[position.row][position.col] = null;
    simulatedBoard[captureMove.to.row][captureMove.to.col] = movingPiece;
    if (captureMove.capture) {
      simulatedBoard[captureMove.capture.row][captureMove.capture.col] = null;
    }

    if (movingPiece.player === "red" && captureMove.to.row === 0) {
      movingPiece.king = true;
    }
    if (movingPiece.player === "black" && captureMove.to.row === 7) {
      movingPiece.king = true;
    }

    const next = calculateMoves(captureMove.to, simulatedBoard).captureMoves;
    if (next.length) {
      followUpCaptureMoves.push(captureMove);
    }
  }

  return {
    simpleMoves,
    captureMoves,
    followUpCaptureMoves,
  };
};

const highlightedMoves = computed(() => {
  if (!selected.value) {
    return [] as Move[];
  }

  const moves = availableMoves(selected.value);
  if (mustContinueCapture.value || hasCaptureMoveForCurrentPlayer()) {
    return moves.captureMoves;
  }

  return [...moves.captureMoves, ...moves.simpleMoves];
});

const isHighlighted = (row: number, col: number) =>
  highlightedMoves.value.some(
    (move) => move.to.row === row && move.to.col === col,
  );

const startTurnTimer = () => {
  remainingSeconds.value = TURN_SECONDS;

  if (intervalId.value) {
    clearInterval(intervalId.value);
  }

  intervalId.value = setInterval(() => {
    if (remainingSeconds.value <= 1) {
      remainingSeconds.value = 0;
      stopTurnTimer();
      autoMoveFor(currentPlayer.value);
      return;
    }

    remainingSeconds.value -= 1;
  }, 1000);
};

const stopTurnTimer = () => {
  if (!intervalId.value) {
    return;
  }

  clearInterval(intervalId.value);
  intervalId.value = null;
};

const hasCaptureMoveForCurrentPlayer = () =>
  allMovesFor(currentPlayer.value).some(({ move }) => Boolean(move.capture));

const updateTurnMessage = () => {
  const baseMessage = currentPlayerLabel(currentPlayer.value);

  if (mustContinueCapture.value) {
    message.value = `${baseMessage} — prise obligatoire : continuez la capture`;
    return;
  }

  if (hasCaptureMoveForCurrentPlayer()) {
    message.value = `${baseMessage} — prise obligatoire`;
    return;
  }

  message.value = baseMessage;
};

const switchTurn = () => {
  currentPlayer.value = currentPlayer.value === "red" ? "black" : "red";
  updateTurnMessage();
  if (!winner.value) {
    startTurnTimer();
  }
};

const executeMove = (from: Position, move: Move) => {
  const movingPiece = board.value[from.row][from.col];
  if (!movingPiece) {
    selected.value = null;
    mustContinueCapture.value = false;
    return false;
  }

  board.value[from.row][from.col] = null;
  board.value[move.to.row][move.to.col] = movingPiece;

  if (move.capture) {
    board.value[move.capture.row][move.capture.col] = null;
  }

  if (movingPiece.player === "red" && move.to.row === 0) {
    movingPiece.king = true;
  }
  if (movingPiece.player === "black" && move.to.row === 7) {
    movingPiece.king = true;
  }

  if (winner.value) {
    selected.value = null;
    mustContinueCapture.value = false;
    message.value = winnerLabel(winner.value);
    stopTurnTimer();
    return true;
  }

  if (move.capture) {
    const nextCaptures = availableMoves(move.to).captureMoves;
    if (nextCaptures.length) {
      selected.value = { ...move.to };
      mustContinueCapture.value = true;
      updateTurnMessage();
      return true;
    }
  }

  selected.value = null;
  mustContinueCapture.value = false;
  switchTurn();
  return true;
};

const allMovesFor = (player: Player) => {
  const moves: Array<{ from: Position; move: Move }> = [];

  if (mustContinueCapture.value && selected.value) {
    const piece = pieceAt(selected.value);
    if (piece?.player === player) {
      const captures = availableMoves(selected.value).captureMoves;
      return captures.map((move) => ({ from: { ...selected.value! }, move }));
    }
    return moves;
  }

  for (let row = 0; row < 8; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      const piece = board.value[row][col];
      if (!piece || piece.player !== player) {
        continue;
      }

      const from = { row, col };
      const available = availableMoves(from);
      for (const move of [
        ...available.captureMoves,
        ...available.simpleMoves,
      ]) {
        moves.push({ from, move });
      }
    }
  }

  return moves;
};

const autoMoveFor = (player: Player) => {
  const moves = allMovesFor(player);
  if (!moves.length) {
    const opponent: Player = player === "red" ? "black" : "red";
    forcedWinner.value = opponent;
    message.value = winnerLabel(opponent);
    stopTurnTimer();
    return;
  }

  const captureMoves = moves.filter(({ move }) => move.capture);
  const candidateMoves = captureMoves.length ? captureMoves : moves;
  const randomMove =
    candidateMoves[Math.floor(Math.random() * candidateMoves.length)];
  executeMove(randomMove.from, randomMove.move);
};

const playAiTurn = async () => {
  isThinking.value = true;
  await new Promise((resolve) => setTimeout(resolve, 300));
  autoMoveFor("black");
  while (
    currentPlayer.value === "black" &&
    mustContinueCapture.value &&
    !winner.value
  ) {
    await new Promise((resolve) => setTimeout(resolve, 180));
    autoMoveFor("black");
  }
  isThinking.value = false;
};

const winner = computed(() => {
  if (forcedWinner.value) {
    return forcedWinner.value;
  }

  const pieces = board.value.flat().filter(Boolean) as Piece[];
  const redCount = pieces.filter((piece) => piece.player === "red").length;
  const blackCount = pieces.filter((piece) => piece.player === "black").length;

  if (!redCount) {
    return "black";
  }

  if (!blackCount) {
    return "red";
  }

  return null;
});

const emitGameFinished = (result: "win" | "lose") => {
  if (gameFinishedEmitted.value) {
    return;
  }

  gameFinishedEmitted.value = true;
  emit("game-finished", { result });
};

const clickCell = (row: number, col: number) => {
  if (
    winner.value ||
    isThinking.value ||
    (props.selectedPlayMode === "ai" && currentPlayer.value === "black")
  ) {
    return;
  }

  const clickedPiece = board.value[row][col];
  const hasMandatoryCapture = hasCaptureMoveForCurrentPlayer();
  if (clickedPiece && clickedPiece.player !== currentPlayer.value) {
    return;
  }

  if (clickedPiece && clickedPiece.player === currentPlayer.value) {
    if (
      mustContinueCapture.value &&
      (!selected.value ||
        selected.value.row !== row ||
        selected.value.col !== col)
    ) {
      return;
    }

    if (
      hasMandatoryCapture &&
      !availableMoves({ row, col }).captureMoves.length
    ) {
      message.value = `${currentPlayerLabel(currentPlayer.value)} — prise obligatoire`;
      return;
    }

    selected.value = { row, col };
    if (hasMandatoryCapture) {
      message.value = `${currentPlayerLabel(currentPlayer.value)} — prise obligatoire`;
    }
    return;
  }

  if (!selected.value) {
    return;
  }

  const move = highlightedMoves.value.find(
    (item) => item.to.row === row && item.to.col === col,
  );
  if (!move) {
    return;
  }

  if (hasMandatoryCapture && !move.capture) {
    message.value = `${currentPlayerLabel(currentPlayer.value)} — prise obligatoire`;
    return;
  }

  executeMove(selected.value, move);
};

watch(currentPlayer, async (player) => {
  if (props.selectedPlayMode === "ai" && player === "black" && !winner.value) {
    await playAiTurn();
  }
});

watch(winner, (nextWinner) => {
  if (!nextWinner) {
    return;
  }

  playUiSound(nextWinner === "red" ? "win" : "lose");
  triggerVisualFeedback(
    "game-surface",
    nextWinner === "red" ? "glow" : "shake",
    620,
  );
  emitGameFinished(nextWinner === "red" ? "win" : "lose");
});

const reset = () => {
  board.value = createInitialBoard();
  currentPlayer.value = "red";
  selected.value = null;
  mustContinueCapture.value = false;
  updateTurnMessage();
  isThinking.value = false;
  forcedWinner.value = null;
  gameFinishedEmitted.value = false;
  startTurnTimer();
};

onMounted(() => {
  updateTurnMessage();
  startTurnTimer();
});

onBeforeUnmount(() => {
  stopTurnTimer();
});

const panelState = computed<GameAsidePanelState>(() => ({
  gameKey: "checkers",
  title: t("gameComponents.checkers.title"),
  phase: winner.value
    ? winnerLabel(winner.value)
    : t("gameComponents.checkers.activePlayer"),
  turnLabel:
    currentPlayer.value === "red"
      ? t("gameComponents.checkers.players.white")
      : t("gameComponents.checkers.players.black"),
  status: message.value,
  highlights: [
    `${t("gameComponents.checkers.remainingTime")}: ${t("gameComponents.checkers.seconds", { count: remainingSeconds.value })}`,
    isThinking.value
      ? t("gameComponents.checkers.aiThinking")
      : t("gameComponents.checkers.actions.restart"),
  ],
  kpis: [
    {
      id: "timer",
      label: t("gameComponents.checkers.remainingTime"),
      value: `${remainingSeconds.value}s`,
      color: "primary",
      variant: "tonal",
    },
    {
      id: "red-pieces",
      label: t("gameComponents.checkers.players.white"),
      value: board.value.flat().filter((piece) => piece?.player === "red")
        .length,
      variant: "outlined",
    },
    {
      id: "black-pieces",
      label: t("gameComponents.checkers.players.black"),
      value: board.value.flat().filter((piece) => piece?.player === "black")
        .length,
      variant: "outlined",
    },
  ],
  actions: [
    { id: "restart", label: t("gameComponents.checkers.actions.restart") },
  ],
}));

watchEffect(() => {
  emit("panel-state", panelState.value);
});

const handleAsideAction = (actionId: string) => {
  if (actionId === "restart") {
    playUiSound("confirm");
    triggerVisualFeedback("game-surface", "pulse");
    reset();
  }
};

defineExpose({
  handleAsideAction,
});
</script>

<template>
  <GameTableScaffold class="game-shell-unified" surface-variant="flat">
    <template #surface>
      <div class="board-column">
        <div class="checkers-board" :class="{ 'checkers-board--thinking': isThinking }">
          <button
            v-for="(cell, index) in board.flat()"
            :key="index"
            type="button"
            class="checkers-cell"
            :class="{
              'checkers-cell--dark': (Math.floor(index / 8) + (index % 8)) % 2 === 1,
              'checkers-cell--selected': selected && selected.row === Math.floor(index / 8) && selected.col === index % 8,
              'checkers-cell--highlight': isHighlighted(Math.floor(index / 8), index % 8),
            }"
            @click="clickCell(Math.floor(index / 8), index % 8)"
          >
            <span v-if="cell" class="piece" :class="{ 'piece--red': cell.player === 'red', 'piece--black': cell.player === 'black', 'piece--king': cell.king }">
              <v-icon v-if="cell.king" icon="mdi-crown" size="16" />
            </span>
          </button>
        </div>
      </div>
    </template>

    <div class="d-flex align-center justify-space-between flex-wrap ga-2 mb-1">
      <h3 class="game-shell-title mb-0">{{ t("gameComponents.checkers.title") }}</h3>
    </div>
    <p class="game-shell-subtitle mb-0">{{ message }}</p>

    <aside class="info-aside">
      <p class="game-meta mb-1">Joueur actif: <strong>{{ currentPlayer }}</strong></p>
      <p class="game-meta mb-2">Temps restant: <strong>{{ remainingSeconds }}s</strong></p>
      <v-progress-linear class="timer-progress" :model-value="timerProgress" height="10" rounded color="primary" bg-color="grey-lighten-1" />
      <p v-if="isThinking" class="game-thinking mt-4 mb-0">{{ t("gameComponents.checkers.aiThinking") }}</p>
    </aside>
  </GameTableScaffold>
</template>

<style scoped>
.game-shell-title { font-size: 1.1rem; font-weight: 800; }
.game-shell-subtitle { color: rgba(var(--v-theme-on-surface), 0.78); }
.game-meta { margin: 0; color: rgba(var(--v-theme-on-surface), 0.75); font-size: 0.95rem; }
.game-thinking { margin: 0; color: rgb(var(--v-theme-primary)); font-weight: 600; }
.board-column { display: grid; justify-items: center; }
.info-aside { border: 1px solid rgba(var(--v-theme-on-surface), 0.14); border-radius: 12px; padding: 1rem; background: rgba(var(--v-theme-surface), 0.8); }
.timer-progress { max-width: 100%; }
.checkers-board { width: min(500px, 100%); min-width: 480px; display: grid; grid-template-columns: repeat(8, 1fr); border: 1px solid rgba(0, 0, 0, 0.22); border-radius: 10px; overflow: hidden; }
.checkers-board--thinking { pointer-events: none; opacity: 0.85; }
.checkers-cell { aspect-ratio: 1; border: none; background: var(--v-theme-surface); display: grid; place-items: center; transition: box-shadow 180ms ease, transform 180ms ease; }
.checkers-cell--dark { background: #1c1c1c; }
.checkers-cell:hover { box-shadow: inset 0 0 0 2px color-mix(in srgb, rgb(var(--v-theme-primary)) 24%, transparent); }
.checkers-cell:focus-visible { outline: 3px solid color-mix(in srgb, rgb(var(--v-theme-primary)) 40%, transparent); outline-offset: -3px; }
.checkers-cell--selected { outline: 3px solid rgb(var(--v-theme-primary)); outline-offset: -3px; }
.checkers-cell--highlight { box-shadow: inset 0 0 0 3px rgb(var(--v-theme-secondary)); }
.piece { width: 72%; height: 72%; border-radius: 999px; display: grid; place-items: center; color: white; box-shadow: inset 0 -4px 8px rgba(0, 0, 0, 0.22); }
.piece--red { background: linear-gradient(145deg, #ffffff, #d7d7d7); color: #1a1a1a; border: 1px solid rgba(0, 0, 0, 0.2); }
.piece--black { background: linear-gradient(145deg, #4f4f4f, #0b0b0b); }
.piece--king { border: 2px solid #9e9e9e; }
</style>
