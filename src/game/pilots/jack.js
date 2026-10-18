import bob from "./bob.js";

export default {
  ...bob,
  name: "Jack",
  description: "One eyed",
  pointsPerTarget: 200,
  weapon: {
    ...bob.weapon,
    maxProjectiles: 2,
    piercing: true,
  },
  apply(scene) {
    scene.blindSide = Math.random() < 0.5 ? "left" : "right";
    scene.blindMask = scene.add
      .rectangle(0, 0, scene.scale.width, scene.scale.height, 0x000000)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(900);
  },
  update(scene) {
    const left = scene.blindSide === "left";
    const width = left ? scene.player.x : scene.scale.width - scene.player.x;
    scene.blindMask
      .setPosition(left ? 0 : scene.player.x, 0)
      .setDisplaySize(width, scene.scale.height);
  },
};
