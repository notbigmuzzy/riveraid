import Phaser from 'phaser'
import airplaneUrl from '../assets/graphics/airplane.svg?url&no-inline'

export const GAME_WIDTH = 1024
export const GAME_HEIGHT = 640
export const TILE_SIZE = 32

const BUFFER_ROWS = 3
const SCROLL_SPEED = 100
const PLAYER_SPEED = 280
const FUEL_INTERVAL = 0.32
const FUEL_PER_TICK = 1.5
const TERRAIN_COLORS = { grass: 0x68a940, river: 0x7c6fdb, coast: 0xff9800 }

export function createGame(parent, initialState, onStateChange) {
  class RiverScene extends Phaser.Scene {
    constructor() {
      super('river')
    }

    preload() {
      this.load.svg('airplane', airplaneUrl, { width: 64, height: 64 })
    }

    create() {
      this.fuelElapsed = 0
      this.registry.set('state', { ...initialState })
      const publishState = () => onStateChange({ ...this.registry.get('state') })
      this.registry.events.on('changedata', publishState)
      this.events.once('shutdown', () => {
        this.registry.events.off('changedata', publishState)
      })
      publishState()

      this.rows = []
      for (let rowIndex = -BUFFER_ROWS; rowIndex < GAME_HEIGHT / TILE_SIZE + BUFFER_ROWS; rowIndex++) {
        this.rows.push(this.createTerrainRow(rowIndex, rowIndex * TILE_SIZE))
      }

      this.player = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT - TILE_SIZE * 1.5, 'airplane')
        .setDisplaySize(TILE_SIZE, TILE_SIZE)
        .setDepth(1)
      this.controls = this.input.keyboard.addKeys({
        left: Phaser.Input.Keyboard.KeyCodes.LEFT,
        right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
        up: Phaser.Input.Keyboard.KeyCodes.UP,
        down: Phaser.Input.Keyboard.KeyCodes.DOWN,
      })

      this.events.once('shutdown', () => {
        this.rows.forEach((row) => row.graphics.destroy())
        this.rows = []
        this.player.destroy()
      })
    }

    createTerrainRow(index, positionY) {
      const offset = Math.round(Math.sin(index / 4) * 2)
      const tiles = Array.from({ length: GAME_WIDTH / TILE_SIZE }, (_, column) => {
        if (column === 8 + offset || column === 22 + offset) return 'coast'
        return column > 8 + offset && column < 22 + offset ? 'river' : 'grass'
      })
      const graphics = this.add.graphics({ y: positionY })

      tiles.forEach((tile, column) => {
        graphics.fillStyle(TERRAIN_COLORS[tile])
        graphics.fillRect(column * TILE_SIZE, 0, TILE_SIZE, TILE_SIZE)
      })

      return { index, tiles, graphics }
    }

    checkTerrainCollision() {
      const bounds = this.player.getBounds()
      const hitLand = this.rows.some((row) => {
        if (row.graphics.y > bounds.bottom || row.graphics.y + TILE_SIZE < bounds.top) return false

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

      const distance = SCROLL_SPEED * elapsed * speedMultiplier
      this.rows.forEach((row) => { row.graphics.y += distance })

      while (this.rows.length && this.rows[this.rows.length - 1].graphics.y >= GAME_HEIGHT + BUFFER_ROWS * TILE_SIZE) {
        this.rows.pop().graphics.destroy()
      }

      while (this.rows[0].graphics.y > -BUFFER_ROWS * TILE_SIZE) {
        const firstRow = this.rows[0]
        this.rows.unshift(this.createTerrainRow(firstRow.index - 1, firstRow.graphics.y - TILE_SIZE))
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