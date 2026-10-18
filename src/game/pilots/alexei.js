import bob from './bob.js'

export default {
  ...bob,
  name: 'Alexei',
  description: 'Contrarian',
  invertedView: true,
  apply(scene) {
    scene.cameras.main.setRotation(Math.PI)
  },
  orientImage(image) {
    return image.setFlip(!image.flipX, !image.flipY)
  },
}