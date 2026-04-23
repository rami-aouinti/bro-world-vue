import { computed, ref } from "vue";

type UiSound = "hover-select" | "confirm" | "error" | "win" | "lose";
type VisualFeedback = "pulse" | "shake" | "glow";

const AUDIO_PREFERENCE_STORAGE_KEY = "games.feedback.audio.enabled";
const SOUND_LIBRARY: Record<UiSound, string> = {
  "hover-select": "/sounds/new-message.mp3",
  confirm: "/sounds/new-message.mp3",
  error: "/sounds/new-message.mp3",
  win: "/sounds/new-message.mp3",
  lose: "/sounds/new-message.mp3",
};

const SOUND_TUNING: Record<UiSound, { volume: number; playbackRate: number }> = {
  "hover-select": { volume: 0.16, playbackRate: 1.15 },
  confirm: { volume: 0.2, playbackRate: 1 },
  error: { volume: 0.2, playbackRate: 0.88 },
  win: { volume: 0.28, playbackRate: 1.08 },
  lose: { volume: 0.2, playbackRate: 0.8 },
};

export const useGameFeedback = () => {
  const audioEnabled = useStatefulAudioEnabled();
  const visualFeedbackState = useStatefulVisualFeedback();
  const audioCache = useStatefulAudioCache();

  const readStoredAudioPreference = () => {
    if (!import.meta.client) return;
    const stored = window.localStorage.getItem(AUDIO_PREFERENCE_STORAGE_KEY);
    if (stored === "true" || stored === "false") {
      audioEnabled.value = stored === "true";
    }
  };

  const setAudioEnabled = (enabled: boolean) => {
    audioEnabled.value = enabled;
    if (!import.meta.client) return;
    window.localStorage.setItem(AUDIO_PREFERENCE_STORAGE_KEY, String(enabled));
  };

  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled.value);
  };

  const getAudioElement = (sound: UiSound) => {
    const cacheKey = `${sound}:${SOUND_LIBRARY[sound]}`;
    if (audioCache.value[cacheKey]) return audioCache.value[cacheKey];
    const audio = new Audio(SOUND_LIBRARY[sound]);
    audio.preload = "auto";
    audioCache.value[cacheKey] = audio;
    return audio;
  };

  const playUiSound = (sound: UiSound) => {
    if (!import.meta.client || !audioEnabled.value) return;
    const audio = getAudioElement(sound).cloneNode(true) as HTMLAudioElement;
    const tuning = SOUND_TUNING[sound];
    audio.volume = tuning.volume;
    audio.playbackRate = tuning.playbackRate;
    void audio.play().catch(() => {});
  };

  const triggerVisualFeedback = (
    target: string,
    feedback: VisualFeedback,
    durationMs = 360,
  ) => {
    visualFeedbackState.value[target] = feedback;
    setTimeout(() => {
      if (visualFeedbackState.value[target] === feedback) {
        visualFeedbackState.value[target] = null;
      }
    }, durationMs);
  };

  const visualFeedbackClass = (target: string) =>
    computed(() => {
      const value = visualFeedbackState.value[target];
      return value ? `game-feedback--${value}` : "";
    });

  if (import.meta.client) {
    readStoredAudioPreference();
  }

  return {
    audioEnabled,
    toggleAudio,
    setAudioEnabled,
    playUiSound,
    triggerVisualFeedback,
    visualFeedbackClass,
  };
};

const sharedAudioEnabled = ref(true);
const sharedVisualFeedbackState = ref<Record<string, VisualFeedback | null>>({});
const sharedAudioCache = ref<Record<string, HTMLAudioElement>>({});

const useStatefulAudioEnabled = () => sharedAudioEnabled;
const useStatefulVisualFeedback = () => sharedVisualFeedbackState;
const useStatefulAudioCache = () => sharedAudioCache;
