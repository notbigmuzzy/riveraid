import { getPilot } from './pilots/index.js'

export const SAVE_KEY = 'river-rogue:save'

export function initialState() {
  return { bridge: 0, score: 0, fuel: 125, pilot: 'Bob', run: 1 }
}

export function awardScore(state, targetType) {
  if (targetType === 'bridge') return { ...state, bridge: state.bridge + 1 }
  const points = getPilot(state.pilot).pointsPerTarget
  return { ...state, score: state.score + points }
}

export function loadState(storage = localStorage) {
  const defaults = initialState()

  try {
    const saved = JSON.parse(storage.getItem(SAVE_KEY))
    if (saved?.version !== 1 || !saved.state) return defaults

    const state = saved.state
    for (const field of ['bridge', 'score', 'run']) {
      if (Number.isSafeInteger(state[field]) && state[field] >= (field === 'run' ? 1 : 0)) {
        defaults[field] = state[field]
      }
    }
    if (typeof state.pilot === 'string' && state.pilot.trim() && state.pilot.length <= 32) {
      defaults.pilot = getPilot(state.pilot).name
    }
  } catch {
    return defaults
  }

  return defaults
}

export function saveState(state, storage = localStorage) {
  try {
    storage.setItem(SAVE_KEY, JSON.stringify({ version: 1, state }))
  } catch {
    return false
  }
  return true
}