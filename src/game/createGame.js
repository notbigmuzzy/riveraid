import Phaser from "phaser";
import { createRiverGenerator } from "./river.js";
import { EnemySystem } from "./enemies.js";
import { getPilot } from "./pilots/index.js";

export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 800;
export const TILE_SIZE = 40;

const SOURCE_TILE_SIZE = 32;
const BUFFER_ROWS = 3;
const SCROLL_SPEED = 240;
const PLAYER_SPEED = 320;
const FUEL_INTERVAL = 0.32;
const FUEL_PER_TICK = 1.5;
const INFINITE_FUEL = false;

export function createGame(parent, initialState, onStateChange) {
  class RiverScene extends Phaser.Scene {
    constructor() {
      super("river");
    }

    preload() {
      this.load.image(
        "airplane",
        `${import.meta.env.BASE_URL}graphics/aircraft.png`,
      );
      this.load.image(
        "enemy-boat",
        `${import.meta.env.BASE_URL}graphics/enemy-boat.png`,
      );
      this.load.image(
        "enemy-blimp",
        `${import.meta.env.BASE_URL}graphics/enemy-blimp.png`,
      );
      this.load.image(
        "enemy-helicopter",
        `${import.meta.env.BASE_URL}graphics/enemy-helicopter.png`,
      );
      this.load.image(
        "enemy-tank",
        `${import.meta.env.BASE_URL}graphics/enemy-tank.png`,
      );
      this.load.image(
        "enemy-puddle",
        `${import.meta.env.BASE_URL}graphics/enemy-puddle.png`,
      );
      this.load.image(
        "fire-tile",
        `${import.meta.env.BASE_URL}graphics/fire-tile.png`,
      );
      this.load.image(
        "enemy-fuel",
        `${import.meta.env.BASE_URL}graphics/fuel-station.png`,
      );
      this.load.image(
        "enemy-bridge",
        `${import.meta.env.BASE_URL}graphics/bridge.png`,
      );
      this.load.image("road", `${import.meta.env.BASE_URL}graphics/road.png`);
      this.load.image(
        "terrain",
        `${import.meta.env.BASE_URL}graphics/shoreline.png`,
      );
      this.load.image(
        "trees",
        `${import.meta.env.BASE_URL}graphics/shore-tree.png`,
      );
      this.load.image(
        "fence",
        `${import.meta.env.BASE_URL}graphics/shore-fence.png`,
      );
      this.load.image(
        "plants",
        `${import.meta.env.BASE_URL}graphics/shore-plants.png`,
      );
    }

    create(data = {}) {
      this.cameras.main.setRoundPixels(false);
      this.cameras.main.setRotation(0).setBackgroundColor("#7c6fdb");
      this.game.canvas.style.filter = "";
      this.isDead = false;
      this.fuelElapsed = 0;
      this.scrollRemainder = 0;
      this.collisionMasks = new Map();
      const state = { ...(data.state ?? initialState) };
      this.pilot = getPilot(state.pilot);
      this.scrollSpeed = SCROLL_SPEED * (this.pilot.flightSpeedMultiplier ?? 1);
      this.deathExplosion = null;
      this.pilotTextures = {
        player: "airplane",
        terrain: "terrain",
        trees: "trees",
        fence: "fence",
        plants: "plants",
      };
      this.registry.set("state", { ...state, pilot: this.pilot.name });
      const publishState = () =>
        onStateChange({ ...this.registry.get("state") });
      this.registry.events.on("changedata", publishState);
      this.events.once("shutdown", () => {
        this.registry.events.off("changedata", publishState);
      });
      publishState();

      for (const [key, columns, rows] of [
        ["terrain", 3, 3],
        ["fence", 4, 4],
        ["plants", 11, 2],
      ]) {
        const texture = this.textures.get(key);
        for (let row = 0; row < rows; row++) {
          for (let column = 0; column < columns; column++) {
            const frame = row * columns + column;
            if (!texture.has(frame)) {
              texture.add(
                frame,
                0,
                column * SOURCE_TILE_SIZE,
                row * SOURCE_TILE_SIZE,
                SOURCE_TILE_SIZE,
                SOURCE_TILE_SIZE,
              );
            }
          }
        }
      }
      if (!this.textures.get("trees").has("oak"))
        this.textures.get("trees").add("oak", 0, 0, 0, 96, 128);
      this.pilot.apply(this);
      this.river = createRiverGenerator(
        GAME_WIDTH / TILE_SIZE,
        GAME_HEIGHT / TILE_SIZE + BUFFER_ROWS,
        Math.random,
        this.pilot.river,
      );
      this.rows = [];
      this.enemies = new EnemySystem(this, TILE_SIZE, GAME_WIDTH, GAME_HEIGHT);
      for (
        let rowIndex = -BUFFER_ROWS;
        rowIndex < GAME_HEIGHT / TILE_SIZE + BUFFER_ROWS;
        rowIndex++
      ) {
        this.rows.push(this.createTerrainRow(rowIndex, rowIndex * TILE_SIZE));
      }

      this.playerBaseY = GAME_HEIGHT - TILE_SIZE * 1.5;
      this.player = this.add
        .image(GAME_WIDTH / 2, this.playerBaseY, this.pilotTextures.player)
        .setDisplaySize(TILE_SIZE * 1.5, TILE_SIZE * 1.5)
        .setDepth(4);
      if (new URLSearchParams(window.location.search).has("fps")) {
        const fpsText = this.add
          .text(GAME_WIDTH - 12, 12, "", {
            fontFamily: "Courier New",
            fontSize: "20px",
            fontStyle: "bold",
            color: "#ffffff",
            backgroundColor: "#222b2c",
            padding: { x: 8, y: 4 },
            fixedWidth: 112,
            align: "right",
          })
          .setOrigin(1, 0)
          .setScrollFactor(0)
          .setDepth(1000);
        if (this.pilot.invertedView) {
          fpsText
            .setPosition(12, GAME_HEIGHT - 12)
            .setOrigin(0, 1)
            .setRotation(Math.PI);
        }
        const updateFps = () =>
          fpsText.setText(`${Math.round(this.game.loop.actualFps)} FPS`);
        updateFps();
        this.time.addEvent({ delay: 250, loop: true, callback: updateFps });
      }
      this.controls = this.input.keyboard.addKeys({
        left: Phaser.Input.Keyboard.KeyCodes.LEFT,
        right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
        up: Phaser.Input.Keyboard.KeyCodes.UP,
        down: Phaser.Input.Keyboard.KeyCodes.DOWN,
        leftAlt: Phaser.Input.Keyboard.KeyCodes.A,
        rightAlt: Phaser.Input.Keyboard.KeyCodes.D,
        upAlt: Phaser.Input.Keyboard.KeyCodes.W,
        downAlt: Phaser.Input.Keyboard.KeyCodes.S,
        leftIjkl: Phaser.Input.Keyboard.KeyCodes.J,
        rightIjkl: Phaser.Input.Keyboard.KeyCodes.L,
        upIjkl: Phaser.Input.Keyboard.KeyCodes.I,
        downIjkl: Phaser.Input.Keyboard.KeyCodes.K,
        fire: Phaser.Input.Keyboard.KeyCodes.SPACE,
      });
      this.pilot.update(this);

      this.events.once("shutdown", () => {
        this.game.canvas.style.filter = "";
        this.enemies.destroy();
        this.rows.forEach((row) => {
          row.container.destroy();
          Object.values(row.decorations).forEach((layer) => layer.destroy());
        });
        this.rows = [];
        this.collisionMasks.clear();
        this.player.destroy();
      });
    }

    getTerrainTile(index, column) {
      return this.river.getTile(index, column);
    }

    createTerrainRow(index, positionY) {
      const info = this.river.getRowInfo(index);
      const tiles = Array.from(
        { length: GAME_WIDTH / TILE_SIZE },
        (_, column) => this.getTerrainTile(index, column),
      );
      const container = this.add.container(0, positionY);

      tiles.forEach((tile, column) => {
        if (tile === "river") return;

        const frameColumn =
          this.getTerrainTile(index, column - 1) === "river"
            ? 0
            : this.getTerrainTile(index, column + 1) === "river"
              ? 2
              : 1;
        const frameRow =
          this.getTerrainTile(index - 1, column) === "river"
            ? 0
            : this.getTerrainTile(index + 1, column) === "river"
              ? 2
              : 1;
        const terrainFrame =
          frameRow * 3 + (frameColumn === 2 ? 0 : frameColumn);
        container.add(
          this.add
            .image(
              column * TILE_SIZE,
              0,
              this.pilotTextures.terrain,
              terrainFrame,
            )
            .setOrigin(0)
            .setDisplaySize(TILE_SIZE, TILE_SIZE)
            .setFlipX(frameColumn === 2),
        );
      });

      const decorations = {
        plants: this.add.container(0, positionY).setDepth(1),
        fences: this.add.container(0, positionY).setDepth(2),
        trees: this.add.container(0, positionY).setDepth(3),
      };
      if (info.road) {
        const firstWater = tiles.indexOf("river") * TILE_SIZE;
        const afterWater = (tiles.lastIndexOf("river") + 1) * TILE_SIZE;
        decorations.road = this.add.container(0, positionY).setDepth(3.25);
        decorations.road.add(
          this.add
            .image(0, -TILE_SIZE / 2, "road")
            .setOrigin(0)
            .setDisplaySize(firstWater, TILE_SIZE * 2),
        );
        decorations.road.add(
          this.add
            .image(afterWater, -TILE_SIZE / 2, "road")
            .setOrigin(0)
            .setDisplaySize(GAME_WIDTH - afterWater, TILE_SIZE * 2),
        );
      }
      if (info.segment !== "bridge")
        this.addDecorations(index, decorations, tiles);
      const row = { index, tiles, container, decorations, info };
      if (positionY < 0 && !this.isDead) this.enemies.addRow(row);
      return row;
    }

    canPlaceDecoration(index, column, width, height, margin = 1) {
      if (column < margin || column + width + margin > GAME_WIDTH / TILE_SIZE)
        return false;

      for (let rowIndex = index - height + 1; rowIndex <= index; rowIndex++) {
        for (
          let tileColumn = column - margin;
          tileColumn < column + width + margin;
          tileColumn++
        ) {
          if (this.getTerrainTile(rowIndex, tileColumn) !== "grass")
            return false;
        }
      }
      return true;
    }

    addDecorations(index, layers, tiles) {
      const firstWater = tiles.indexOf("river");
      const lastWater = tiles.lastIndexOf("river");
      for (let column = 1; column < GAME_WIDTH / TILE_SIZE - 1; column++) {
        const onIsland =
          column > firstWater &&
          column < lastWater &&
          tiles[column] === "grass";
        const chance = Math.random();
        const footprintWidth = onIsland ? 2 : 3;
        const footprintHeight = onIsland ? (chance < 0.07 ? 2 : 1) : 4;
        const margin = onIsland ? 0 : 1;
        if (
          (onIsland || index % 4 === 0) &&
          chance < 0.12 &&
          this.canPlaceDecoration(
            index,
            column,
            footprintWidth,
            footprintHeight,
            margin,
          )
        ) {
          if (chance < 0.07) {
            layers.trees.add(
              this.pilot.orientImage(
                this.add
                  .image(
                    column * TILE_SIZE,
                    TILE_SIZE,
                    this.pilotTextures.trees,
                    "oak",
                  )
                  .setOrigin(0, 1)
                  .setDisplaySize(TILE_SIZE * 1.5, TILE_SIZE * 2)
                  .setFlipX(Math.random() < 0.5),
              ),
            );
          } else {
            const fenceRow = Phaser.Math.Between(0, 3);
            for (let segment = 0; segment < 3; segment++) {
              layers.fences.add(
                this.pilot.orientImage(
                  this.add
                    .image(
                      column * TILE_SIZE + (segment * TILE_SIZE) / 2,
                      0,
                      this.pilotTextures.fence,
                      fenceRow * 4 + segment,
                    )
                    .setOrigin(0)
                    .setDisplaySize(TILE_SIZE / 2, TILE_SIZE / 2),
                ),
              );
            }
          }
          column += onIsland ? 1 : 3;
        } else if (
          chance < (onIsland ? 0.65 : 0.15) &&
          this.canPlaceDecoration(index, column, 1, 1, margin)
        ) {
          layers.plants.add(
            this.pilot.orientImage(
              this.add
                .image(
                  column * TILE_SIZE,
                  0,
                  this.pilotTextures.plants,
                  Phaser.Math.Between(0, 21),
                )
                .setOrigin(0)
                .setDisplaySize(TILE_SIZE, TILE_SIZE),
            ),
          );
        }
      }
    }

    getCollisionMask(image) {
      const width = Math.round(image.displayWidth);
      const height = Math.round(image.displayHeight);
      const key = `${image.texture.key}:${image.frame.name}:${width}:${height}:${image.flipX}:${image.flipY}`;
      if (this.collisionMasks.has(key)) return this.collisionMasks.get(key);

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      context.imageSmoothingEnabled = false;
      if (image.flipX || image.flipY) {
        context.translate(image.flipX ? width : 0, image.flipY ? height : 0);
        context.scale(image.flipX ? -1 : 1, image.flipY ? -1 : 1);
      }
      const frame = image.frame;
      context.drawImage(
        frame.source.image,
        frame.cutX,
        frame.cutY,
        frame.cutWidth,
        frame.cutHeight,
        0,
        0,
        width,
        height,
      );
      const pixels = context.getImageData(0, 0, width, height).data;
      const alpha = new Uint8Array(width * height);
      for (let index = 0; index < alpha.length; index++) {
        alpha[index] = pixels[index * 4 + 3] >= 128 ? 1 : 0;
      }
      const mask = { width, height, alpha };
      this.collisionMasks.set(key, mask);
      return mask;
    }

    checkTerrainCollision() {
      const playerMask = this.getCollisionMask(this.player);
      const bounds = this.player.getBounds();
      const playerLeft = Math.round(bounds.left);
      const playerTop = Math.round(bounds.top);
      const playerRight = playerLeft + playerMask.width;
      const playerBottom = playerTop + playerMask.height;

      for (const row of this.rows) {
        const tileTop = Math.round(row.container.y);
        if (tileTop >= playerBottom || tileTop + TILE_SIZE <= playerTop)
          continue;

        for (const image of row.container.list) {
          const tileLeft = Math.round(row.container.x + image.x);
          if (tileLeft >= playerRight || tileLeft + TILE_SIZE <= playerLeft)
            continue;
          const tileMask = this.getCollisionMask(image);
          const overlapLeft = Math.max(playerLeft, tileLeft);
          const overlapRight = Math.min(playerRight, tileLeft + tileMask.width);
          const overlapTop = Math.max(playerTop, tileTop);
          const overlapBottom = Math.min(
            playerBottom,
            tileTop + tileMask.height,
          );

          for (
            let positionY = overlapTop;
            positionY < overlapBottom;
            positionY++
          ) {
            for (
              let positionX = overlapLeft;
              positionX < overlapRight;
              positionX++
            ) {
              const playerIndex =
                (positionY - playerTop) * playerMask.width +
                positionX -
                playerLeft;
              const tileIndex =
                (positionY - tileTop) * tileMask.width + positionX - tileLeft;
              if (playerMask.alpha[playerIndex] && tileMask.alpha[tileIndex]) {
                this.die();
                return;
              }
            }
          }
        }
      }
    }

    die() {
      if (this.isDead) return;
      this.isDead = true;
      const deadTexture = `${this.player.texture.key}-dead`;
      if (!this.textures.exists(deadTexture)) {
        const frame = this.player.frame;
        const texture = this.textures.createCanvas(
          deadTexture,
          frame.cutWidth,
          frame.cutHeight,
        );
        const context = texture.getContext();
        context.filter = "grayscale(1)";
        context.drawImage(
          frame.source.image,
          frame.cutX,
          frame.cutY,
          frame.cutWidth,
          frame.cutHeight,
          0,
          0,
          frame.cutWidth,
          frame.cutHeight,
        );
        texture.refresh();
      }
      this.player.setTexture(deadTexture);
      this.tweens.add({ targets: this.player, alpha: 0, duration: 200 });
      this.deathExplosion = this.add
        .container(this.player.x, this.player.y)
        .setDepth(5);
      const colors = [0xfff1a8, 0xffb52e, 0xf05a36, 0xeeeeee];
      for (let index = 0; index < 16; index++) {
        const angle = (index * Math.PI * 2) / 16;
        const radius = Phaser.Math.Between(35, 85);
        const size = Phaser.Math.Between(6, 12);
        const fragment = this.add.rectangle(
          0,
          0,
          size,
          size,
          colors[index % colors.length],
        );
        this.deathExplosion.add(fragment);
        this.tweens.add({
          targets: fragment,
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius,
          alpha: 0,
          scale: 0.3,
          duration: Phaser.Math.Between(400, 700),
          ease: "Cubic.Out",
        });
      }
      this.tweens.add({
        targets: this,
        scrollSpeed: 0,
        duration: 850,
        ease: "Cubic.Out",
        onComplete: () => {
          this.deathExplosion.destroy();
          this.deathExplosion = null;
          this.scene.pause();
          this.game.events.emit("round-ended", {
            ...this.registry.get("state"),
          });
        },
      });
    }

    consumeFuel(elapsed) {
      this.fuelElapsed += elapsed * (this.pilot.fuelConsumptionMultiplier ?? 1);
      const ticks = Math.floor(this.fuelElapsed / FUEL_INTERVAL);
      let state = this.registry.get("state");

      if (ticks > 0) {
        this.fuelElapsed -= ticks * FUEL_INTERVAL;
        state = {
          ...state,
          fuel: Math.max(0, state.fuel - ticks * FUEL_PER_TICK),
        };
        this.registry.set("state", state);
      }

      if (state.fuel > 0) return true;
      this.die();
      return false;
    }

    update(time, delta) {
      const elapsed = Math.min(delta, 100) / 1000;
      if (this.isDead) {
        const distance = this.scrollWorld(this.scrollSpeed * elapsed);
        this.enemies.scrollAfterDeath(distance, elapsed);
        this.player.y += distance;
        if (this.deathExplosion) this.deathExplosion.y += distance;
        return;
      }
      const up =
        this.pilot.canAccelerate !== false &&
        (this.controls.up.isDown ||
          this.controls.upAlt.isDown ||
          this.controls.upIjkl.isDown);
      const down =
        this.pilot.canBrake !== false &&
        (this.controls.down.isDown ||
          this.controls.downAlt.isDown ||
          this.controls.downIjkl.isDown);
      const left =
        this.controls.left.isDown ||
        this.controls.leftAlt.isDown ||
        this.controls.leftIjkl.isDown;
      const right =
        this.controls.right.isDown ||
        this.controls.rightAlt.isDown ||
        this.controls.rightIjkl.isDown;
      const speedMultiplier = (up ? 2.1 : 1) * (down ? 0.5 : 1);
      this.scrollSpeed =
        SCROLL_SPEED *
        speedMultiplier *
        (this.pilot.flightSpeedMultiplier ?? 1);
      if (!INFINITE_FUEL && !this.consumeFuel(elapsed * speedMultiplier))
        return;

      const accelerating = up && !down;
      const braking = down && !up;
      const verticalOffset = accelerating
        ? -this.player.displayHeight / 2
        : braking
          ? this.player.displayHeight / 4
          : 0;
      const targetY = this.playerBaseY + verticalOffset;
      this.player.y = Phaser.Math.Linear(
        this.player.y,
        targetY,
        1 - Math.exp(-10 * elapsed),
      );

      const direction = Number(right) - Number(left);
      const halfWidth = this.player.displayWidth / 2;
      this.player.x = Phaser.Math.Clamp(
        this.player.x + direction * PLAYER_SPEED * elapsed,
        halfWidth,
        GAME_WIDTH - halfWidth,
      );
      this.pilot.update(this);

      const distance = this.scrollWorld(this.scrollSpeed * elapsed);
      this.checkTerrainCollision();
      if (!this.isDead) this.enemies.update(elapsed, distance);
    }

    scrollWorld(travel) {
      this.scrollRemainder += travel;
      const distance = Math.floor(this.scrollRemainder);
      this.scrollRemainder -= distance;
      this.rows.forEach((row) => {
        row.container.y += distance;
        Object.values(row.decorations).forEach((layer) => {
          layer.y = row.container.y;
        });
      });

      while (
        this.rows.length &&
        this.rows[this.rows.length - 1].container.y >=
          GAME_HEIGHT + BUFFER_ROWS * TILE_SIZE
      ) {
        const row = this.rows.pop();
        this.enemies.removeRow(row);
        row.container.destroy();
        Object.values(row.decorations).forEach((layer) => layer.destroy());
      }

      while (this.rows[0].container.y > -BUFFER_ROWS * TILE_SIZE) {
        const firstRow = this.rows[0];
        this.rows.unshift(
          this.createTerrainRow(
            firstRow.index - 1,
            firstRow.container.y - TILE_SIZE,
          ),
        );
      }

      this.river.prune(this.rows[this.rows.length - 1].index + 1);
      return distance;
    }
  }

  return new Phaser.Game({
    type: Phaser.CANVAS,
    parent,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: "#7c6fdb",
    pixelArt: true,
    antialias: false,
    banner: false,
    scene: RiverScene,
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  });
}
