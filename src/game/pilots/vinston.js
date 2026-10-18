import bob from './bob.js'
import { createPilotTexture } from './textures.js'

export default {
  ...bob,
  name: 'Vinston',
  description: 'Shotgun FTW',
  fuelConsumptionMultiplier: 1.2,
  weapon: {
    ...bob.weapon,
    offsets: [-50, 0, 50],
    alternatingWings: false,
    maxProjectiles: 3,
    rangeFraction: 1 / 3,
    fuelCostFraction: 0.02,
  },
  apply(scene) {
    scene.game.canvas.style.filter = 'grayscale(1)'
    scene.pilotTextures.terrain = createPilotTexture(scene, 'terrain', 'vinston', (pixels, offset) => {
      pixels[offset] = Math.round(pixels[offset] * 0.45)
      pixels[offset + 1] = Math.round(pixels[offset + 1] * 0.45)
      pixels[offset + 2] = Math.round(pixels[offset + 2] * 0.45)
    })
  },
}