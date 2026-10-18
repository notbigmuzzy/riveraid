import bob from './bob.js'
import { createPilotTexture } from './textures.js'

function nightTexture(scene, key) {
  return createPilotTexture(scene, key, 'rosanna', (pixels, offset, x, y) => {
    const grass = [0x09, 0x15, 0x01]
    const coast = [0x06, 0x07, 0x23]
    const terrain = key === 'terrain'
    const color = terrain && (Math.floor(x / 32) !== 1 || Math.floor(y / 32) !== 1) ? coast : grass
    const shade = terrain ? 1 : 0.5 + pixels[offset + 1] / 510
    pixels[offset] = Math.round(color[0] * shade)
    pixels[offset + 1] = Math.round(color[1] * shade)
    pixels[offset + 2] = Math.round(color[2] * shade)
  })
}

export default {
  ...bob,
  name: 'Rosanna',
  description: 'Night raid',
  flightSpeedMultiplier: 1.2,
  canAccelerate: false,
  canBrake: false,
  weapon: {
    ...bob.weapon,
    maxProjectiles: 4,
  },
  hud: {
    '--game-stats-background': '#000',
    '--game-stats-border': '#09112d',
    '--game-stats-span': '#651818',
    '--game-stats-label': '#427dff',
  },
  apply(scene) {
    scene.cameras.main.setBackgroundColor('#06072d')
    for (const key of ['terrain', 'trees', 'plants', 'fence']) {
      scene.pilotTextures[key] = nightTexture(scene, key)
    }
  },
}