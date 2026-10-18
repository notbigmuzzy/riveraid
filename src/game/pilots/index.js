import bob from './bob.js'
import vinston from './vinston.js'
import jack from './jack.js'
import rosanna from './rosanna.js'
import alexei from './alexei.js'

export const pilots = [bob, vinston, jack, rosanna, alexei]

export function getPilot(name) {
  return pilots.find((pilot) => pilot.name === name) ?? bob
}