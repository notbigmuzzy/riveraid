export default {
  name: 'Bob',
  description: 'New guy',
  pointsPerTarget: 100,
  invertedView: false,
  weapon: {
    speed: 900,
    offsets: [0],
    alternatingWings: true,
    maxProjectiles: 2,
    rangeFraction: Infinity,
  },
  apply() {},
  orientImage(image) {
    return image
  },
  update() {},
}