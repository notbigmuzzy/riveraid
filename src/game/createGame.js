import Phaser from 'phaser'
import grassUrl from '../assets/tileset/tiles/tiles-grass light-32x32.png?url&no-inline'
import earthUrl from '../assets/tileset/tiles/tiles-earth-32x32.png?url&no-inline'
import treesUrl from '../assets/tileset/tiles/tiles - tree - 32x32.png?url&no-inline'
import fenceUrl from '../assets/tileset/tiles/tiles-fence-32x32.png?url&no-inline'
import plantsUrl from '../assets/tileset/tiles/tiles-grass-decoration-transparent-32x32.png?url&no-inline'

export const GAME_WIDTH = 1280
export const GAME_HEIGHT = 800
export const TILE_SIZE = 40

const SOURCE_TILE_SIZE = 32
const BUFFER_ROWS = 3
const SCROLL_SPEED = 125
const PLAYER_SPEED = 350
const FUEL_INTERVAL = 0.32
const FUEL_PER_TICK = 1.5
const EARTH_VARIANT = { column: 9, row: 16 }

export function createGame(parent, initialState, onStateChange) {
  class RiverScene extends Phaser.Scene {
    constructor() {
      super('river')
    }

    preload() {
      this.load.svg('airplane', `${import.meta.env.BASE_URL}aircraft.svg`, { width: 80, height: 80 })
      this.load.spritesheet('grass', grassUrl, { frameWidth: SOURCE_TILE_SIZE, frameHeight: SOURCE_TILE_SIZE })
      this.load.spritesheet('earth', earthUrl, { frameWidth: SOURCE_TILE_SIZE, frameHeight: SOURCE_TILE_SIZE })
      this.load.image('trees', treesUrl)
      this.load.spritesheet('fence', fenceUrl, { frameWidth: SOURCE_TILE_SIZE, frameHeight: SOURCE_TILE_SIZE })
      this.load.spritesheet('plants', plantsUrl, { frameWidth: SOURCE_TILE_SIZE, frameHeight: SOURCE_TILE_SIZE })
    }

    create() {
      this.cameras.main.setRoundPixels(false)
      this.fuelElapsed = 0
      this.scrollRemainder = 0
      this.registry.set('state', { ...initialState })
      const publishState = () => onStateChange({ ...this.registry.get('state') })
      this.registry.events.on('changedata', publishState)
      this.events.once('shutdown', () => {
        this.registry.events.off('changedata', publishState)
      })
      publishState()

      this.grassFramesPerRow = Math.floor(this.textures.get('grass').getSourceImage().width / SOURCE_TILE_SIZE)
      this.earthFramesPerRow = Math.floor(this.textures.get('earth').getSourceImage().width / SOURCE_TILE_SIZE)
      this.textures.get('trees').add('oak', 0, 0, 0, 96, 128)
      this.rows = []
      for (let rowIndex = -BUFFER_ROWS; rowIndex < GAME_HEIGHT / TILE_SIZE + BUFFER_ROWS; rowIndex++) {
        this.rows.push(this.createTerrainRow(rowIndex, rowIndex * TILE_SIZE))
      }

      this.player = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT - TILE_SIZE * 1.5, 'airplane')
        .setDisplaySize(TILE_SIZE * 1.5, TILE_SIZE * 1.5)
        .setDepth(4)
      this.controls = this.input.keyboard.addKeys({
        left: Phaser.Input.Keyboard.KeyCodes.LEFT,
        right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
        up: Phaser.Input.Keyboard.KeyCodes.UP,
        down: Phaser.Input.Keyboard.KeyCodes.DOWN,
      })

      this.events.once('shutdown', () => {
        this.rows.forEach((row) => {
          row.container.destroy()
          Object.values(row.decorations).forEach((layer) => layer.destroy())
        })
        this.rows = []
        this.player.destroy()
      })
    }

    getTerrainTile(index, column) {
      const offset = Math.round(Math.sin(index / 4) * 2)
      if (column === 8 + offset || column === 22 + offset) return 'coast'
      return column > 8 + offset && column < 22 + offset ? 'river' : 'grass'
    }

    createTerrainRow(index, positionY) {
      const tiles = Array.from({ length: GAME_WIDTH / TILE_SIZE }, (_, column) => this.getTerrainTile(index, column))
      const container = this.add.container(0, positionY)

      tiles.forEach((tile, column) => {
        if (tile === 'river') return

        const frameColumn = this.getTerrainTile(index, column - 1) === 'river' ? 0
          : this.getTerrainTile(index, column + 1) === 'river' ? 2 : 1
        const frameRow = this.getTerrainTile(index - 1, column) === 'river' ? 0
          : this.getTerrainTile(index + 1, column) === 'river' ? 2 : 1
        const earthFrame = (EARTH_VARIANT.row + frameRow) * this.earthFramesPerRow
          + EARTH_VARIANT.column + (frameColumn === 2 ? 0 : frameColumn)
        container.add(this.add.image(column * TILE_SIZE, 0, 'earth', earthFrame)
          .setOrigin(0)
          .setDisplaySize(TILE_SIZE, TILE_SIZE)
          .setFlipX(frameColumn === 2))

        if (tile !== 'grass') return

        const grassColumn = this.getTerrainTile(index, column - 1) !== 'grass' ? 0
          : this.getTerrainTile(index, column + 1) !== 'grass' ? 2 : 1
        const grassRow = this.getTerrainTile(index - 1, column) !== 'grass' ? 0
          : this.getTerrainTile(index + 1, column) !== 'grass' ? 2 : 1
        const grassFrame = grassRow * this.grassFramesPerRow + (grassColumn === 2 ? 0 : grassColumn)
        container.add(this.add.image(column * TILE_SIZE, 0, 'grass', grassFrame)
          .setOrigin(0)
          .setDisplaySize(TILE_SIZE, TILE_SIZE)
          .setFlipX(grassColumn === 2))
      })

      const decorations = {
        plants: this.add.container(0, positionY).setDepth(1),
        fences: this.add.container(0, positionY).setDepth(2),
        trees: this.add.container(0, positionY).setDepth(3),
      }
      this.addDecorations(index, decorations)
      return { index, tiles, container, decorations }
    }

    canPlaceDecoration(index, column, width, height) {
      if (column < 1 || column + width >= GAME_WIDTH / TILE_SIZE) return false

      for (let rowIndex = index - height + 1; rowIndex <= index; rowIndex++) {
        for (let tileColumn = column - 1; tileColumn <= column + width; tileColumn++) {
          if (this.getTerrainTile(rowIndex, tileColumn) !== 'grass') return false
        }
      }
      return true
    }

    addDecorations(index, layers) {
      for (let column = 1; column < GAME_WIDTH / TILE_SIZE - 1; column++) {
        const chance = Math.random()
        if (index % 4 === 0 && chance < 0.12 && this.canPlaceDecoration(index, column, 3, 4)) {
          if (chance < 0.07) {
            layers.trees.add(this.add.image(column * TILE_SIZE, TILE_SIZE, 'trees', 'oak')
              .setOrigin(0, 1)
              .setDisplaySize(TILE_SIZE * 1.5, TILE_SIZE * 2)
              .setFlipX(Math.random() < 0.5))
          } else {
            const fenceRow = Phaser.Math.Between(0, 3)
            for (let segment = 0; segment < 3; segment++) {
              layers.fences.add(this.add.image(column * TILE_SIZE + segment * TILE_SIZE / 2, 0, 'fence', fenceRow * 4 + segment)
                .setOrigin(0)
                .setDisplaySize(TILE_SIZE / 2, TILE_SIZE / 2))
            }
          }
          column += 3
        } else if (chance < 0.15 && this.canPlaceDecoration(index, column, 1, 1)) {
          layers.plants.add(this.add.image(column * TILE_SIZE, 0, 'plants', Phaser.Math.Between(0, 21))
            .setOrigin(0)
            .setDisplaySize(TILE_SIZE, TILE_SIZE))
        }
      }
    }

    checkTerrainCollision() {
      const bounds = Phaser.Geom.Rectangle.Inflate(this.player.getBounds(), -5, -5)
      const hitLand = this.rows.some((row) => {
        if (row.container.y > bounds.bottom || row.container.y + TILE_SIZE < bounds.top) return false

        return row.tiles.some((tile, column) => tile !== 'river'
          && column * TILE_SIZE <= bounds.right
          && (column + 1) * TILE_SIZE >= bounds.left)
      })

      if (hitLand) this.die()
    }

    die() {
      this.player.setVisible(false)
      this.scene.pause()
    }

    consumeFuel(elapsed) {
      this.fuelElapsed += elapsed
      const ticks = Math.floor(this.fuelElapsed / FUEL_INTERVAL)
      let state = this.registry.get('state')

      if (ticks > 0) {
        this.fuelElapsed -= ticks * FUEL_INTERVAL
        state = { ...state, fuel: Math.max(0, state.fuel - ticks * FUEL_PER_TICK) }
        this.registry.set('state', state)
      }

      if (state.fuel > 0) return true
      this.die()
      return false
    }

    update(time, delta) {
      const elapsed = Math.min(delta, 100) / 1000
      const speedMultiplier = (this.controls.up.isDown ? 2 : 1)
        * (this.controls.down.isDown ? 0.5 : 1)
      if (!this.consumeFuel(elapsed * speedMultiplier)) return

      const direction = Number(this.controls.right.isDown) - Number(this.controls.left.isDown)
      const halfWidth = this.player.displayWidth / 2
      this.player.x = Phaser.Math.Clamp(
        this.player.x + direction * PLAYER_SPEED * elapsed,
        halfWidth,
        GAME_WIDTH - halfWidth,
      )

      this.scrollRemainder += SCROLL_SPEED * elapsed * speedMultiplier
      const distance = Math.floor(this.scrollRemainder)
      this.scrollRemainder -= distance
      this.rows.forEach((row) => {
        row.container.y += distance
        Object.values(row.decorations).forEach((layer) => { layer.y = row.container.y })
      })

      while (this.rows.length && this.rows[this.rows.length - 1].container.y >= GAME_HEIGHT + BUFFER_ROWS * TILE_SIZE) {
        const row = this.rows.pop()
        row.container.destroy()
        Object.values(row.decorations).forEach((layer) => layer.destroy())
      }

      while (this.rows[0].container.y > -BUFFER_ROWS * TILE_SIZE) {
        const firstRow = this.rows[0]
        this.rows.unshift(this.createTerrainRow(firstRow.index - 1, firstRow.container.y - TILE_SIZE))
      }

      this.checkTerrainCollision()
    }
  }

  return new Phaser.Game({
    type: Phaser.CANVAS,
    parent,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: '#7c6fdb',
    pixelArt: true,
    antialias: false,
    banner: false,
    scene: RiverScene,
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  })
}