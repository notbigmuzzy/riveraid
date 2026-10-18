import Phaser from "phaser";
import { awardScore } from "./state.js";

const FIRE_DURATION = 4;
const FULL_FUEL = 125;
const BRIDGE_SCORE_INTERVAL = 2000;

export class EnemySystem {
  constructor(scene, tileSize, gameWidth, gameHeight) {
    this.scene = scene;
    this.tileSize = tileSize;
    this.enemySize = tileSize * 1.5;
    this.gameWidth = gameWidth;
    this.gameHeight = gameHeight;
    this.enemies = [];
    this.bullets = [];
    this.playerShots = [];
    this.fires = [];
    this.fuelPacks = [];
    this.blasts = [];
    this.weapon = scene.pilot.weapon;
    this.maxPlayerShots = this.weapon.maxProjectiles;
    this.shotCooldown = 0;
    this.nextWing = -1;
    this.emptyRowsRemaining = 0;
    this.generatedRows = 0;
    this.bridgeProgress = 0;
    this.bridgeState = "collecting";
    const graphics = scene.make.graphics({ x: 0, y: 0 }, false);
    if (!scene.textures.exists("enemy-bullet")) {
      graphics.fillStyle(0xfff1a8).fillRect(0, 0, 8, 8);
      graphics.fillStyle(0xd54936).fillRect(2, 2, 4, 4);
      graphics.generateTexture("enemy-bullet", 8, 8);
      graphics.clear();
    }
    if (!scene.textures.exists("player-bullet")) {
      graphics.fillStyle(0xe2f692).fillRect(0, 0, 4, 16);
      graphics.fillStyle(0xffffff).fillRect(1, 0, 2, 10);
      graphics.generateTexture("player-bullet", 4, 16);
    }
    if (!scene.textures.exists("fuel-pack")) {
      graphics.clear();
      graphics.fillStyle(0x263c35).fillRect(2, 6, 28, 26);
      graphics.fillStyle(0xe2f692).fillRect(4, 8, 24, 22);
      graphics.fillStyle(0xfaf4df).fillRect(10, 2, 12, 6);
      graphics.fillStyle(0x263c35).fillRect(12, 4, 8, 4);
      graphics
        .fillStyle(0x263c35)
        .fillRect(14, 12, 4, 14)
        .fillRect(9, 17, 14, 4);
      graphics.generateTexture("fuel-pack", 32, 32);
    }
    if (this.weapon.blastShapes && !scene.textures.exists("big-bullet")) {
      graphics.clear();
      graphics.fillStyle(0x9c354b).fillRect(4, 0, 10, 4).fillRect(0, 4, 18, 22);
      graphics.fillStyle(0xffb52e).fillRect(2, 5, 14, 19);
      graphics.fillStyle(0xfff1a8).fillRect(5, 3, 8, 13);
      graphics.fillStyle(0xffffff).fillRect(6, 4, 4, 7);
      graphics.fillStyle(0x9c354b).fillRect(3, 24, 12, 4);
      graphics.generateTexture("big-bullet", 18, 28);
    }
    graphics.destroy();
  }

  addRow(row) {
    this.generatedRows++;
    if (row.info.segment === "bridge") {
      if (row.info.road) this.addBridge(row);
      return;
    }
    if (this.addFuelStation(row)) return;
    if (this.emptyRowsRemaining > 0) {
      this.emptyRowsRemaining--;
      return;
    }
    const firstWater = row.tiles.indexOf("river");
    const lastWater = row.tiles.lastIndexOf("river");
    if (firstWater < 0) return;
    const riverWidth = lastWater - firstWater + 1;
    const narrow = riverWidth <= 8;
    const wide = riverWidth > 16;
    const emptyRows = narrow ? [4, 6] : wide ? [1, 2] : [2, 4];
    if (Math.random() < 0.55) return;
    const roll = Math.random();
    const type =
      roll < 0.52
        ? "boat"
        : roll < 0.78
          ? "blimp"
          : roll < 0.94
            ? "helicopter"
            : "tank";
    if (type === "tank") {
      if (narrow) return;
      if (firstWater < 1 || lastWater >= row.tiles.length - 1) return;
      const banks = [];
      for (const direction of [1, -1]) {
        const edge =
          (direction === 1 ? firstWater : lastWater + 1) * this.tileSize;
        for (let offset = 2; offset <= 4; offset++) {
          const positionX = edge - direction * offset * this.tileSize;
          if (!this.canPlaceTank(row.index, positionX)) continue;
          banks.push({ positionX, direction });
          break;
        }
      }
      if (!banks.length) return;
      const { positionX, direction } = Phaser.Utils.Array.GetRandom(banks);
      const targets = [];
      for (let column = firstWater + 1; column < lastWater; column++) {
        const targetX = (column + 0.5) * this.tileSize;
        if ((targetX - positionX) * direction <= 0) continue;
        let allWater = true;
        for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
          for (let columnOffset = -1; columnOffset <= 1; columnOffset++) {
            if (
              this.scene.getTerrainTile(
                row.index + rowOffset,
                column + columnOffset,
              ) !== "river"
            ) {
              allWater = false;
            }
          }
        }
        if (allWater) targets.push(targetX);
      }
      if (!targets.length) return;
      const tank = this.spawn(type, row, positionX, null, direction);
      tank.targetX = Phaser.Utils.Array.GetRandom(targets);
      this.emptyRowsRemaining = Phaser.Math.Between(...emptyRows);
      return;
    }

    const slots = [];
    let column = 0;
    while (column < row.tiles.length) {
      if (row.tiles[column] !== "river") {
        column++;
        continue;
      }
      const start = column;
      while (column < row.tiles.length && row.tiles[column] === "river")
        column++;
      const minX = start * this.tileSize + 36;
      const maxX = column * this.tileSize - 36;
      for (
        let positionX = minX;
        positionX <= maxX;
        positionX += this.tileSize * 2
      ) {
        slots.push({ x: positionX, minX, maxX });
      }
    }
    Phaser.Utils.Array.Shuffle(slots);
    if (!slots.length) return;

    const requestedCount = narrow
      ? 1
      : wide
        ? Phaser.Math.Between(2, 4)
        : Phaser.Math.Between(1, 3);
    const totalCount = Math.min(requestedCount, slots.length);
    let boatCount = totalCount;
    let mobileSlot = null;
    if (type !== "boat" && totalCount > 1) {
      mobileSlot = slots.pop();
      boatCount--;
    }
    for (let index = 0; index < boatCount; index++) {
      const slot = slots.pop();
      this.spawn("boat", row, slot.x, slot);
    }
    if (mobileSlot) {
      this.spawn(type, row, mobileSlot.x, {
        minX: mobileSlot.minX,
        maxX: mobileSlot.maxX,
      });
    }
    this.emptyRowsRemaining = Phaser.Math.Between(...emptyRows);
  }

  addScore(targetType) {
    const previousState = this.scene.registry.get("state");
    const state = awardScore(previousState, targetType);
    if (targetType === "bridge") {
      this.bridgeProgress = 0;
      this.bridgeState = "collecting";
    } else if (
      targetType !== "bridge-spawn" &&
      this.bridgeState === "collecting"
    ) {
      this.bridgeProgress = Math.min(
        BRIDGE_SCORE_INTERVAL,
        this.bridgeProgress + state.score - previousState.score,
      );
      if (this.bridgeProgress >= BRIDGE_SCORE_INTERVAL) {
        this.bridgeState = "ready";
        this.scene.river.requestBridge();
      }
    }
    this.scene.registry.set("state", state);
  }

  addBridge(row) {
    const firstWater = row.tiles.indexOf("river");
    const lastWater = row.tiles.lastIndexOf("river");
    if (firstWater < 0) return false;
    const positionX = ((firstWater + lastWater + 1) * this.tileSize) / 2;
    const bridge = this.spawn("bridge", row, positionX, null, 1);
    bridge.image.setDisplaySize(
      (lastWater - firstWater + 1) * this.tileSize,
      this.tileSize * 2,
    );
    this.bridgeState = "active";
    this.emptyRowsRemaining = Math.max(this.emptyRowsRemaining, 4);
    this.addScore("bridge-spawn");
    return true;
  }

  addFuelStation(row) {
    if (this.scene.pilot.fuelStations === false) return false;
    if (
      this.generatedRows <= 5 ||
      this.enemies.some((entity) => entity.type === "fuel")
    )
      return false;
    const columns = [];
    for (let column = 1; column < row.tiles.length - 1; column++) {
      let allWater = true;
      for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
        for (let columnOffset = -1; columnOffset <= 1; columnOffset++) {
          if (
            this.scene.getTerrainTile(
              row.index + rowOffset,
              column + columnOffset,
            ) !== "river"
          ) {
            allWater = false;
          }
        }
      }
      if (allWater) columns.push(column);
    }
    if (!columns.length) return false;
    const column = Phaser.Utils.Array.GetRandom(columns);
    this.spawn("fuel", row, (column + 0.5) * this.tileSize, null, 1);
    this.emptyRowsRemaining = Math.max(this.emptyRowsRemaining, 2);
    return true;
  }

  canPlaceTank(index, positionX) {
    if (
      positionX - this.enemySize / 2 < 0 ||
      positionX + this.enemySize / 2 > this.gameWidth
    )
      return false;
    const firstColumn = Math.floor(
      (positionX - this.enemySize / 2) / this.tileSize,
    );
    const lastColumn =
      Math.ceil((positionX + this.enemySize / 2) / this.tileSize) - 1;
    for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
      for (let column = firstColumn; column <= lastColumn; column++) {
        if (this.scene.getTerrainTile(index + rowOffset, column) !== "grass")
          return false;
      }
    }
    return true;
  }

  spawn(
    type,
    row,
    positionX,
    patrol,
    direction = Math.random() < 0.5 ? -1 : 1,
  ) {
    const image = this.scene.add
      .image(positionX, row.container.y + this.tileSize / 2, `enemy-${type}`)
      .setDisplaySize(this.enemySize, this.enemySize)
      .setDepth(3.5)
      .setFlipX(direction < 0);
    this.scene.pilot.orientImage(image);
    if (
      this.scene.pilot.invertedView &&
      (type === "blimp" || type === "helicopter" || type === "tank")
    ) {
      image.setFlipX(direction < 0);
    }
    const enemy = {
      type,
      row,
      image,
      patrol,
      direction,
      speed: type === "blimp" ? 28 : type === "helicopter" ? 95 : 0,
      cooldown: type === "tank" ? 0 : Phaser.Math.FloatBetween(1, 2.5),
    };
    this.enemies.push(enemy);
    return enemy;
  }

  fire(enemy) {
    const velocityX = enemy.direction * 300;
    const velocityY = 0;
    const positionX =
      enemy.image.x + enemy.direction * (enemy.image.displayWidth / 2 + 5);
    const positionY = enemy.image.y;
    const image = this.scene.add
      .image(positionX, positionY, "enemy-bullet")
      .setDepth(4.5);
    this.scene.pilot.orientImage(image);
    this.bullets.push({
      image,
      velocityX,
      velocityY,
      age: 0,
      targetX: enemy.targetX,
    });
  }

  addFire(positionX, positionY) {
    const images = [];
    for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
      for (let columnOffset = -1; columnOffset <= 1; columnOffset++) {
        images.push(
          this.scene.pilot.orientImage(
            this.scene.add
              .image(
                positionX + columnOffset * this.tileSize,
                positionY + rowOffset * this.tileSize,
                "fire-tile",
              )
              .setDisplaySize(this.tileSize, this.tileSize)
              .setDepth(3.75),
          ),
        );
      }
    }
    this.fires.push({ images, age: 0 });
    if (images.some((image) => this.overlapsPlayer(image))) this.scene.die();
  }

  updateFires(elapsed, distance) {
    for (let index = this.fires.length - 1; index >= 0; index--) {
      const fire = this.fires[index];
      fire.age += elapsed;
      if (
        fire.age >= FIRE_DURATION ||
        fire.images[0].y + distance > this.gameHeight + this.tileSize
      ) {
        fire.images.forEach((image) => image.destroy());
        this.fires.splice(index, 1);
        continue;
      }
      for (const image of fire.images) {
        image.y += distance;
        image.setAlpha(0.85 + Math.sin(fire.age * 18) * 0.15);
        if (this.overlapsPlayer(image)) {
          this.scene.die();
          return false;
        }
      }
    }
    return true;
  }

  overlapsPlayer(image) {
    return this.overlapsImages(this.scene.player, image);
  }

  overlapsImages(player, image) {
    const playerBounds = player.getBounds();
    const bounds = image.getBounds();
    if (!Phaser.Geom.Intersects.RectangleToRectangle(playerBounds, bounds))
      return false;
    const playerMask = this.scene.getCollisionMask(player);
    const mask = this.scene.getCollisionMask(image);
    const playerLeft = Math.round(playerBounds.left);
    const playerTop = Math.round(playerBounds.top);
    const left = Math.round(bounds.left);
    const top = Math.round(bounds.top);
    const overlapLeft = Math.max(playerLeft, left);
    const overlapTop = Math.max(playerTop, top);
    const overlapRight = Math.min(
      playerLeft + playerMask.width,
      left + mask.width,
    );
    const overlapBottom = Math.min(
      playerTop + playerMask.height,
      top + mask.height,
    );
    for (let positionY = overlapTop; positionY < overlapBottom; positionY++) {
      for (let positionX = overlapLeft; positionX < overlapRight; positionX++) {
        if (
          playerMask.alpha[
            (positionY - playerTop) * playerMask.width + positionX - playerLeft
          ] &&
          mask.alpha[(positionY - top) * mask.width + positionX - left]
        )
          return true;
      }
    }
    return false;
  }

  overlapsTerrain(image) {
    const bounds = image.getBounds();
    for (const row of this.scene.rows) {
      if (
        row.container.y >= bounds.bottom ||
        row.container.y + this.tileSize <= bounds.top
      )
        continue;
      for (const tile of row.container.list) {
        const left = row.container.x + tile.x;
        if (left >= bounds.right || left + this.tileSize <= bounds.left)
          continue;
        if (this.overlapsImages(image, tile)) return true;
      }
    }
    return false;
  }

  destroyEnemy(enemy) {
    if (enemy.destroyed) return;
    enemy.destroyed = true;
    this.addScore(enemy.type);
    if (this.scene.pilot.fuelDropFraction && enemy.type !== "bridge") {
      const image = this.scene.add
        .image(enemy.image.x, enemy.image.y, "fuel-pack")
        .setDepth(3.6);
      this.fuelPacks.push({ image, row: enemy.row });
    }
    const puddleWidth =
      enemy.type === "bridge" ? enemy.image.displayWidth : this.enemySize;
    const puddleHeight =
      enemy.type === "bridge" ? this.tileSize * 2 : this.enemySize;
    enemy.image
      .setTexture("enemy-puddle")
      .setDisplaySize(puddleWidth, puddleHeight)
      .setFlip(false, false)
      .setAlpha(0.7)
      .setDepth(0.5);
    this.scene.pilot.orientImage(enemy.image);
  }

  updateFuelPacks() {
    for (let index = this.fuelPacks.length - 1; index >= 0; index--) {
      const pack = this.fuelPacks[index];
      pack.image.y = pack.row.container.y + this.tileSize / 2;
      if (!this.overlapsPlayer(pack.image)) continue;
      const state = this.scene.registry.get("state");
      const fuel = Math.min(
        FULL_FUEL,
        state.fuel + FULL_FUEL * this.scene.pilot.fuelDropFraction,
      );
      this.scene.registry.set("state", { ...state, fuel });
      pack.image.destroy();
      this.fuelPacks.splice(index, 1);
    }
  }

  explodeShot(shot, target) {
    const positionX = target ? target.image.x : shot.x;
    const positionY = target ? target.image.y : shot.y;
    const images = shot.blastCells.map(([column, row]) =>
      this.scene.add
        .image(
          positionX + column * this.tileSize,
          positionY + row * this.tileSize,
          "fire-tile",
        )
        .setDisplaySize(this.tileSize, this.tileSize)
        .setDepth(4.7),
    );
    this.blasts.push({ images, age: 0 });
    this.applyBlastDamage(images);
  }

  applyBlastDamage(images) {
    for (const enemy of this.enemies) {
      if (
        !enemy.destroyed &&
        images.some((image) =>
          Phaser.Geom.Intersects.RectangleToRectangle(
            image.getBounds(),
            enemy.image.getBounds(),
          ),
        )
      )
        this.destroyEnemy(enemy);
    }
  }

  updateBlasts(elapsed, distance) {
    for (let index = this.blasts.length - 1; index >= 0; index--) {
      const blast = this.blasts[index];
      blast.age += elapsed;
      if (blast.age >= 0.35) {
        blast.images.forEach((image) => image.destroy());
        this.blasts.splice(index, 1);
        continue;
      }
      for (const image of blast.images) {
        image.y += distance;
        image.setAlpha(1 - blast.age / 0.35);
      }
      if (!this.scene.isDead) this.applyBlastDamage(blast.images);
    }
  }

  updatePlayerShots(elapsed, distance) {
    this.shotCooldown = Math.max(0, this.shotCooldown - elapsed);
    for (let index = this.playerShots.length - 1; index >= 0; index--) {
      const shot = this.playerShots[index];
      const remaining =
        this.gameHeight * this.weapon.rangeFraction - shot.travelled;
      const travel = Math.min(
        Math.max(0, this.weapon.speed * elapsed - distance),
        remaining,
      );
      const deltaY = -travel;
      const steps = Math.max(1, Math.ceil(Math.abs(deltaY) / 4));
      let hit = this.overlapsTerrain(shot);
      let impactTarget = null;
      for (let step = 0; step < steps && !hit; step++) {
        shot.y += deltaY / steps;
        if (this.overlapsTerrain(shot)) {
          hit = true;
          break;
        }
        for (const enemy of this.enemies) {
          if (enemy.destroyed || !this.overlapsImages(shot, enemy.image))
            continue;
          this.destroyEnemy(enemy);
          if (this.weapon.piercing) continue;
          impactTarget = enemy;
          hit = true;
          break;
        }
      }
      shot.travelled += travel;
      const reachedRange =
        shot.travelled >= this.gameHeight * this.weapon.rangeFraction;
      if (hit || shot.y < -160 || reachedRange) {
        if ((hit || reachedRange) && shot.blastCells)
          this.explodeShot(shot, impactTarget);
        shot.destroy();
        this.playerShots.splice(index, 1);
      }
    }

    if (
      Phaser.Input.Keyboard.JustDown(this.scene.controls.fire) &&
      this.shotCooldown === 0 &&
      this.playerShots.length + this.weapon.offsets.length <=
        this.maxPlayerShots
    ) {
      const player = this.scene.player;
      const wingOffset = this.weapon.alternatingWings
        ? this.nextWing * player.displayWidth * 0.36
        : 0;
      for (const offset of this.weapon.offsets) {
        const shapeIndex = this.weapon.blastShapes
          ? Phaser.Math.Between(0, this.weapon.blastShapes.length - 1)
          : null;
        const shot = this.scene.add
          .image(
            player.x + wingOffset + offset,
            player.y - player.displayHeight * 0.06,
            shapeIndex === null ? "player-bullet" : "big-bullet",
          )
          .setDepth(4.5);
        this.scene.pilot.orientImage(shot);
        if (shapeIndex !== null)
          shot.blastCells = this.weapon.blastShapes[shapeIndex];
        shot.travelled = 0;
        this.playerShots.push(shot);
      }
      this.shotCooldown = this.weapon.cooldown ?? 0;
      if (this.weapon.alternatingWings) this.nextWing *= -1;
      if (this.weapon.fuelCostFraction) {
        const state = this.scene.registry.get("state");
        const fuel = Math.max(
          0,
          state.fuel - FULL_FUEL * this.weapon.fuelCostFraction,
        );
        this.scene.registry.set("state", { ...state, fuel });
        if (fuel === 0) this.scene.die();
      }
    }
    const activeShots = this.playerShots.length;
    if (
      this.lastWeaponStatus?.activeShots !== activeShots ||
      this.lastWeaponStatus?.cooldown !== this.shotCooldown
    ) {
      this.lastWeaponStatus = { activeShots, cooldown: this.shotCooldown };
      this.scene.game.events.emit("weapon-status", this.lastWeaponStatus);
    }
  }

  update(elapsed, distance) {
    if (!this.updateFires(elapsed, distance)) return;
    this.updateFuelPacks();
    const activeBulletCount = this.bullets.length;
    for (const enemy of this.enemies) {
      enemy.image.y = enemy.row.container.y + this.tileSize / 2;
      if (enemy.destroyed) continue;
      if (enemy.speed) {
        let { minX, maxX } = enemy.patrol;
        for (const boat of this.enemies) {
          if (boat.type !== "boat" || boat.destroyed || boat.row !== enemy.row)
            continue;
          if (
            boat.image.x < enemy.patrol.minX ||
            boat.image.x > enemy.patrol.maxX
          )
            continue;
          if (boat.image.x < enemy.image.x)
            minX = Math.max(minX, boat.image.x + this.enemySize + 4);
          else maxX = Math.min(maxX, boat.image.x - this.enemySize - 4);
        }
        enemy.image.x += enemy.direction * enemy.speed * elapsed;
        if (enemy.image.x <= minX || enemy.image.x >= maxX) {
          enemy.image.x = Phaser.Math.Clamp(enemy.image.x, minX, maxX);
          enemy.direction *= -1;
          enemy.image.setFlipX(enemy.direction < 0);
        }
      }
    }

    this.updateBlasts(elapsed, distance);
    this.updatePlayerShots(elapsed, distance);
    if (this.scene.isDead) return;

    for (const enemy of this.enemies) {
      if (enemy.destroyed) continue;
      const visibleBottom =
        enemy.image.y +
        (enemy.type === "tank" ? enemy.image.displayHeight / 2 : 0);
      if (visibleBottom < 0 || enemy.image.y > this.gameHeight) continue;
      if (this.overlapsPlayer(enemy.image)) {
        if (enemy.type === "fuel") {
          const state = this.scene.registry.get("state");
          if (state.fuel < FULL_FUEL)
            this.scene.registry.set("state", { ...state, fuel: FULL_FUEL });
          continue;
        }
        this.scene.die();
        return;
      }
      if (enemy.type === "helicopter" || enemy.type === "tank") {
        enemy.cooldown -= elapsed;
        if (enemy.cooldown <= 0) {
          this.fire(enemy);
          enemy.cooldown = Phaser.Math.FloatBetween(1.4, 3);
        }
      }
    }

    for (let index = activeBulletCount - 1; index >= 0; index--) {
      const bullet = this.bullets[index];
      const deltaX = bullet.velocityX * elapsed;
      const deltaY = distance + bullet.velocityY * elapsed;
      const steps = Math.max(
        1,
        Math.ceil(Math.max(Math.abs(deltaX), Math.abs(deltaY)) / 4),
      );
      bullet.age += elapsed;
      let impacted = false;
      for (let step = 0; step < steps; step++) {
        bullet.image.x += deltaX / steps;
        bullet.image.y += deltaY / steps;
        if (
          bullet.targetX !== undefined &&
          (bullet.image.x - bullet.targetX) * bullet.velocityX >= 0
        ) {
          bullet.image.x = bullet.targetX;
          bullet.image.y += (deltaY / steps) * (steps - step - 1);
          this.addFire(bullet.targetX, bullet.image.y);
          impacted = true;
          break;
        }
        if (this.overlapsPlayer(bullet.image)) {
          this.scene.die();
          return;
        }
      }
      if (
        impacted ||
        bullet.age > 8 ||
        bullet.image.x < -20 ||
        bullet.image.x > this.gameWidth + 20 ||
        bullet.image.y < -160 ||
        bullet.image.y > this.gameHeight + 40
      ) {
        bullet.image.destroy();
        this.bullets.splice(index, 1);
      }
      if (!this.scene.scene.isActive()) return;
    }
  }

  scrollAfterDeath(distance, elapsed) {
    this.updateBlasts(elapsed, distance);
    for (const enemy of this.enemies) {
      enemy.image.y = enemy.row.container.y + this.tileSize / 2;
    }
    for (const bullet of this.bullets) bullet.image.y += distance;
    for (const shot of this.playerShots) shot.y += distance;
    for (const pack of this.fuelPacks) pack.image.y += distance;
    for (const fire of this.fires) {
      for (const image of fire.images) image.y += distance;
    }
  }

  removeRow(row) {
    this.fuelPacks = this.fuelPacks.filter((pack) => {
      if (pack.row !== row) return true;
      pack.image.destroy();
      return false;
    });
    this.enemies = this.enemies.filter((enemy) => {
      if (enemy.row !== row) return true;
      enemy.image.destroy();
      return false;
    });
  }

  destroy() {
    this.enemies.forEach((enemy) => enemy.image.destroy());
    this.bullets.forEach((bullet) => bullet.image.destroy());
    this.playerShots.forEach((shot) => shot.destroy());
    this.fuelPacks.forEach((pack) => pack.image.destroy());
    this.blasts.forEach((blast) =>
      blast.images.forEach((image) => image.destroy()),
    );
    this.fires.forEach((fire) =>
      fire.images.forEach((image) => image.destroy()),
    );
    this.enemies = [];
    this.bullets = [];
    this.playerShots = [];
    this.fires = [];
    this.fuelPacks = [];
    this.blasts = [];
  }
}
