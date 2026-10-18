import bob from "./bob.js";

export default {
  ...bob,
  name: "Vera",
  description: "Fuel Thief",
  fuelStations: false,
  fuelDropFraction: 0.05,
  brakingFuelMultiplier: 1,
  weapon: {
    ...bob.weapon,
    maxProjectiles: 2,
  },
};
