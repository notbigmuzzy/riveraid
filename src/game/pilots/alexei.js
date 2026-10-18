import bob from './bob.js'

export default {
  ...bob,
  name: 'Alexei',
  description: 'Contrarian',
  fuelConsumptionMultiplier: 0.75,
  invertedView: true,
  weapon: {
    ...bob.weapon,
    maxProjectiles: 2,
  },
  apply(scene) {
    scene.cameras.main.setRotation(Math.PI)
  },
  orientImage(image) {
    return image.setFlip(!image.flipX, !image.flipY)
  },
}