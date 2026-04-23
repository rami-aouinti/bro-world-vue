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
import {
  getDailyHiddenWord,
  WORDS_FR,
  type HiddenWordLength,
} from "~/data/games/words-fr";
const { t } = useI18n();
const emit = defineEmits<{
  (event: "panel-state", payload: GameAsidePanelState): void;
  (event: "game-finished", payload: { result: "win" | "lose" }): void;
}>();

const MAX_ATTEMPTS = 6;
const lengths: HiddenWordLength[] = [5, 6];
const keyboardRows = ["AZERTYUIOP", "QSDFGHJKLM", "WXCVBN"];

type LetterStatus = "correct" | "present" | "absent" | "unused";

interface LetterResult {
  char: string;
  status: Exclude<LetterStatus, "unused">;
}

const wordLength = ref<HiddenWordLength>(5);
const targetWord = ref("");
const guesses = ref<string[]>([]);
const evaluations = ref<LetterResult[][]>([]);
const currentGuess = ref("");
const gameMessage = ref(t("gameComponents.hiddenWord.messages.guessDaily"));
const shareMessage = ref("");
const gameFinishedEmitted = ref(false);

const targetCharacters = computed(() => targetWord.value.split(""));
const isWon = computed(() => guesses.value.includes(targetWord.value));
const isLost = computed(
  () => !isWon.value && guesses.value.length >= MAX_ATTEMPTS,
);
const isFinished = computed(() => isWon.value || isLost.value);

const keyboardState = computed<Record<string, LetterStatus>>(() => {
  const state: Record<string, LetterStatus> = {};
  const priority: Record<LetterStatus, number> = {
    unused: 0,
    absent: 1,
    present: 2,
    correct: 3,
  };

  for (const row of evaluations.value) {
    for (const item of row) {
      const letter = item.char.toUpperCase();
      const current = state[letter] ?? "unused";
      if (priority[item.status] > priority[current]) {
        state[letter] = item.status;
      }
    }
  }

  return state;
});

const boardRows = computed(() => {
  const rows: Array<Array<{ char: string; status: LetterStatus }>> = [];

  for (let index = 0; index < MAX_ATTEMPTS; index += 1) {
    if (index < evaluations.value.length) {
      rows.push(
        evaluations.value[index].map((item) => ({
          char: item.char.toUpperCase(),
          status: item.status,
        })),
      );
      continue;
    }

    if (index === evaluations.value.length && !isFinished.value) {
      const row = Array.from({ length: wordLength.value }, (_, charIndex) => ({
        char: currentGuess.value[charIndex]?.toUpperCase() ?? "",
        status: "unused" as LetterStatus,
      }));
      rows.push(row);
      continue;
    }

    rows.push(
      Array.from({ length: wordLength.value }, () => ({
        char: "",
        status: "unused" as LetterStatus,
      })),
    );
  }

  return rows;
});

const resetGame = () => {
  targetWord.value = getDailyHiddenWord(wordLength.value);
  guesses.value = [];
  evaluations.value = [];
  currentGuess.value = "";
  gameMessage.value = t("gameComponents.hiddenWord.messages.guessDaily");
  shareMessage.value = "";
  gameFinishedEmitted.value = false;
};

const evaluateGuess = (guess: string): LetterResult[] => {
  const result: LetterResult[] = [];
  const remaining = [...targetCharacters.value];

  for (let index = 0; index < guess.length; index += 1) {
    const char = guess[index];
    if (char === targetCharacters.value[index]) {
      result[index] = { char, status: "correct" };
      remaining[index] = "";
    }
  }

  for (let index = 0; index < guess.length; index += 1) {
    if (result[index]) {
      continue;
    }

    const char = guess[index];
    const foundIndex = remaining.indexOf(char);

    if (foundIndex >= 0) {
      result[index] = { char, status: "present" };
      remaining[foundIndex] = "";
      continue;
    }

    result[index] = { char, status: "absent" };
  }

  return result;
};

const submitGuess = () => {
  if (isFinished.value) return;

  if (currentGuess.value.length !== wordLength.value) {
    gameMessage.value = t("gameComponents.hiddenWord.messages.invalidLength", {
      count: wordLength.value,
    });
    return;
  }

  const guess = currentGuess.value.toLowerCase();
  const dictionary = WORDS_FR[wordLength.value];
  if (!dictionary.includes(guess)) {
    gameMessage.value = t("gameComponents.hiddenWord.messages.wordNotFound");
    return;
  }

  guesses.value.push(guess);
  evaluations.value.push(evaluateGuess(guess));
  currentGuess.value = "";

  if (guess === targetWord.value) {
    gameMessage.value = t("gameComponents.hiddenWord.messages.win", {
      score: `${guesses.value.length}/${MAX_ATTEMPTS}`,
    });
    return;
  }

  if (guesses.value.length >= MAX_ATTEMPTS) {
    gameMessage.value = t("gameComponents.hiddenWord.messages.lose", {
      word: targetWord.value.toUpperCase(),
    });
    return;
  }

  gameMessage.value = t("gameComponents.hiddenWord.messages.try", {
    count: guesses.value.length + 1,
    max: MAX_ATTEMPTS,
  });
};

const onKeyInput = (value: string) => {
  if (isFinished.value) return;

  if (/^[a-zA-Z]$/.test(value)) {
    if (currentGuess.value.length < wordLength.value) {
      currentGuess.value += value.toLowerCase();
    }
    return;
  }

  if (value === "BACKSPACE") {
    currentGuess.value = currentGuess.value.slice(0, -1);
    return;
  }

  if (value === "ENTER") {
    submitGuess();
  }
};

const onPhysicalKeydown = (event: KeyboardEvent) => {
  const key = event.key;

  if (key === "Enter") {
    event.preventDefault();
    onKeyInput("ENTER");
    return;
  }

  if (key === "Backspace") {
    event.preventDefault();
    onKeyInput("BACKSPACE");
    return;
  }

  if (/^[a-zA-Z]$/.test(key)) {
    onKeyInput(key);
  }
};

const buildShareText = () => {
  const date = new Date().toISOString().slice(0, 10);
  const score = isWon.value
    ? `${guesses.value.length}/${MAX_ATTEMPTS}`
    : `X/${MAX_ATTEMPTS}`;
  const grid = evaluations.value
    .map((row) =>
      row
        .map((item) => {
          if (item.status === "correct") return "🟩";
          if (item.status === "present") return "🟨";
          return "⬜";
        })
        .join(""),
    )
    .join("\n");

  return [
    t("gameComponents.hiddenWord.share.title", {
      count: wordLength.value,
      date,
    }),
    t("gameComponents.hiddenWord.share.score", { score }),
    grid,
  ]
    .filter(Boolean)
    .join("\n");
};

const copyShareResult = async () => {
  if (!isFinished.value) {
    shareMessage.value = t("gameComponents.hiddenWord.share.finishBeforeShare");
    return;
  }

  const payload = buildShareText();

  try {
    await navigator.clipboard.writeText(payload);
    shareMessage.value = t("gameComponents.hiddenWord.share.copied");
  } catch {
    shareMessage.value = t("gameComponents.hiddenWord.share.copyFailed");
  }
};

const tileClass = (status: LetterStatus) => {
  if (status === "correct") return "tile-correct";
  if (status === "present") return "tile-present";
  if (status === "absent") return "tile-absent";
  return "tile-empty";
};

watch(wordLength, resetGame);

watch(isFinished, (finished) => {
  if (!finished || gameFinishedEmitted.value) {
    return;
  }

  gameFinishedEmitted.value = true;
  emit("game-finished", { result: isWon.value ? "win" : "lose" });
});

onMounted(() => {
  resetGame();
  window.addEventListener("keydown", onPhysicalKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onPhysicalKeydown);
});

const panelState = computed<GameAsidePanelState>(() => ({
  gameKey: "hidden-word",
  title: t("gameComponents.hiddenWord.title"),
  phase: t("gameComponents.hiddenWord.wordLength", { count: wordLength.value }),
  turnLabel: `${guesses.value.length}/${MAX_ATTEMPTS}`,
  status: gameMessage.value,
  highlights: [
    `${t("gameComponents.hiddenWord.actions.submit")} ${guesses.value.length}/${MAX_ATTEMPTS}`,
    isFinished.value
      ? t("gameComponents.hiddenWord.actions.restart")
      : t("gameComponents.hiddenWord.actions.enter"),
  ],
  kpis: [
    {
      id: "attempts",
      label: "Attempts",
      value: `${guesses.value.length}/${MAX_ATTEMPTS}`,
      color: "primary",
      variant: "tonal",
    },
    {
      id: "length",
      label: "Length",
      value: wordLength.value,
      variant: "outlined",
    },
  ],
  actions: [
    {
      id: "submit",
      label: t("gameComponents.hiddenWord.actions.submit"),
      disabled: isFinished.value,
    },
    { id: "restart", label: t("gameComponents.hiddenWord.actions.restart") },
  ],
}));

watchEffect(() => {
  emit("panel-state", panelState.value);
});

const handleAsideAction = (actionId: string) => {
  if (actionId === "submit") {
    submitGuess();
    return;
  }

  if (actionId === "restart") {
    resetGame();
  }
};

defineExpose({
  handleAsideAction,
});
</script>

<template>
  <v-card class="pa-4 hidden-word-card" variant="outlined">
    <div class="d-flex align-center justify-space-between flex-wrap ga-2 mb-3">
      <h2 class="text-h6 font-weight-bold mb-0">
        {{ t("gameComponents.hiddenWord.title") }}
      </h2>
      <div class="d-flex ga-2">
        <v-btn
          v-for="size in lengths"
          :key="size"
          size="small"
          :variant="wordLength === size ? 'flat' : 'outlined'"
          color="primary"
          @click="wordLength = size"
        >
          {{ t("gameComponents.hiddenWord.wordLength", { count: size }) }}
        </v-btn>
      </div>
    </div>

    <p class="text-body-2 mb-3">{{ gameMessage }}</p>

    <div class="board mb-4">
      <div
        v-for="(row, rowIndex) in boardRows"
        :key="`row-${rowIndex}`"
        class="board-row"
        :style="{
          gridTemplateColumns: `repeat(${wordLength}, minmax(0, 48px))`,
        }"
      >
        <div
          v-for="(tile, tileIndex) in row"
          :key="`tile-${rowIndex}-${tileIndex}`"
          class="tile"
          :class="tileClass(tile.status)"
        >
          {{ tile.char }}
        </div>
      </div>
    </div>

    <div class="d-flex ga-2 mb-4">
      <v-btn
        color="primary"
        variant="flat"
        :disabled="isFinished"
        @click="submitGuess"
        >{{ t("gameComponents.hiddenWord.actions.submit") }}</v-btn
      >
      <v-btn
        color="success"
        variant="outlined"
        :disabled="!isFinished"
        @click="copyShareResult"
        >{{ t("gameComponents.hiddenWord.actions.share") }}</v-btn
      >
    </div>
    <p v-if="shareMessage" class="text-caption mb-4">{{ shareMessage }}</p>

    <div class="keyboard">
      <div v-for="row in keyboardRows" :key="row" class="keyboard-row">
        <v-btn
          v-for="char in row.split('')"
          :key="char"
          size="small"
          class="keyboard-key"
          :color="
            keyboardState[char] === 'correct'
              ? 'success'
              : keyboardState[char] === 'present'
                ? 'warning'
                : keyboardState[char] === 'absent'
                  ? 'grey'
                  : undefined
          "
          :variant="keyboardState[char] ? 'flat' : 'outlined'"
          @click="onKeyInput(char)"
        >
          {{ char }}
        </v-btn>
      </div>
      <div class="keyboard-row">
        <v-btn size="small" variant="outlined" @click="onKeyInput('ENTER')">{{
          t("gameComponents.hiddenWord.actions.enter")
        }}</v-btn>
        <v-btn size="small" variant="outlined" @click="onKeyInput('BACKSPACE')"
          >⌫</v-btn
        >
      </div>
    </div>
  </v-card>
</template>

<style scoped>
.hidden-word-card {
  max-width: 560px;
}

.board {
  display: grid;
  gap: 8px;
}

.board-row {
  display: grid;
  gap: 8px;
}

.tile {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.18);
  text-transform: uppercase;
}

.tile-empty {
  background: rgba(var(--v-theme-surface), 0.5);
}

.tile-correct {
  background: rgb(var(--v-theme-success));
  color: rgb(var(--v-theme-on-success));
}

.tile-present {
  background: rgb(var(--v-theme-warning));
  color: rgb(var(--v-theme-on-warning));
}

.tile-absent {
  background: rgba(var(--v-theme-on-surface), 0.16);
}

.keyboard {
  display: grid;
  gap: 8px;
}

.keyboard-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.keyboard-key {
  min-width: 34px;
}
</style>
