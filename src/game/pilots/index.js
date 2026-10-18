import bob from './bob.js'
import vinston from './vinston.js'
import jack from './jack.js'
import rosanna from './rosanna.js'
import alexei from './alexei.js'
import ada from './ada.js'
import vera from './vera.js'

export const pilots = [bob, vinston, jack, rosanna, alexei, ada, vera]

export function getPilot(name) {
  return pilots.find((pilot) => pilot.name === name) ?? bob
}