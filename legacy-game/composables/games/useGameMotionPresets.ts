const shallowTransition = (duration: number, delay = 0) => ({
  duration,
  delay,
  easing: 'ease-out',
})

export const useGameMotionPresets = () => {
  const presets = {
    enter: {
      soft: {
        initial: { opacity: 0, y: 20, scale: 0.98 },
        enter: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: shallowTransition(320),
        },
      },
      strong: {
        initial: { opacity: 0, y: 32, scale: 0.95 },
        enter: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: shallowTransition(420),
        },
      },
    },
    hover: {
      card: {
        hovered: {
          y: -8,
          scale: 1.02,
          transition: shallowTransition(170),
        },
      },
      media: {
        hovered: {
          scale: 1.04,
          transition: shallowTransition(190),
        },
      },
      mode: {
        hovered: {
          y: -6,
          scale: 1.015,
          transition: shallowTransition(150),
        },
      },
    },
    press: {
      card: {
        tapped: {
          scale: 0.985,
          transition: shallowTransition(120),
        },
      },
      mode: {
        tapped: {
          scale: 0.98,
          transition: shallowTransition(120),
        },
      },
    },
    feedback: {
      win: {
        initial: { opacity: 0.95, scale: 0.98 },
        enter: {
          opacity: 1,
          scale: [1, 1.03, 1],
          transition: {
            duration: 560,
            easing: 'ease-in-out',
          },
        },
      },
      lose: {
        initial: { opacity: 1, x: 0 },
        enter: {
          opacity: 1,
          x: [0, -4, 4, -3, 3, 0],
          transition: {
            duration: 440,
            easing: 'ease-in-out',
          },
        },
      },
    },
  }

  const context = {
    catalogCard: {
      ...presets.enter.strong,
      ...presets.hover.card,
      ...presets.press.card,
    },
    catalogMedia: {
      initial: { opacity: 0, scale: 0.92 },
      enter: {
        opacity: 1,
        scale: 1,
        transition: shallowTransition(470, 50),
      },
      ...presets.hover.media,
      ...presets.press.card,
    },
    modeCard: {
      ...presets.enter.soft,
      ...presets.hover.mode,
      ...presets.press.mode,
    },
    inGamePanel: {
      ...presets.enter.soft,
      ...presets.feedback.win,
    },
  }

  const flowTransitions = {
    catalog: 'game-flow-catalog',
    modeSelection: 'game-flow-mode-selection',
    launchSession: 'game-flow-launch-session',
    inGame: 'game-flow-in-game',
  } as const

  return {
    presets,
    context,
    flowTransitions,
  }
}
