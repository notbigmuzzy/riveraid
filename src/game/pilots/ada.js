import bob from './bob.js'

export default {
  ...bob,
  name: 'Ada',
  description: 'Big Gun',
  fuelConsumptionMultiplier: 1.2,
  weapon: {
    ...bob.weapon,
    speed: 600,
    alternatingWings: false,
    maxProjectiles: 1,
    rangeFraction: 0.5,
    fuelCostFraction: 0.02,
    blastShapes: [
      [[0, 0], [-1, 0], [1, 0], [2, 0]],
      [[0, 0], [1, 0], [0, 1], [1, 1]],
      [[0, 0], [-1, 0], [1, 0], [0, 1]],
      [[0, 0], [1, 0], [-1, 1], [0, 1]],
      [[0, 0], [-1, 0], [0, 1], [1, 1]],
      [[0, 0], [-1, 0], [1, 0], [-1, 1]],
      [[0, 0], [-1, 0], [1, 0], [1, 1]],
    ],
  },
}