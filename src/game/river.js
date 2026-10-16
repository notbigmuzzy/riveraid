const MODES = [
  { name: 'very-narrow', width: 6, lengths: [20, 40] },
  { name: 'narrow', width: 10 },
  { name: 'medium', width: 16, lengths: [20, 40] },
  { name: 'wide', width: 26 },
]
const BLOCK_LENGTHS = [20, 40, 60]
const BRIDGE_WIDTH = 8
const ISLAND_LAYOUTS = ['small', 'large', 'double']
const SMALL_ISLAND_COUNTS = {
  20: [2, 3],
  40: [4, 5, 6],
  60: [7, 8, 9],
}
const MEDIUM_ISLAND_COUNTS = {
  20: [2],
  40: [3, 4],
  60: [5, 6],
}

export function createRiverGenerator(columns, startIndex, random = Math.random) {
  const rows = new Map()
  const rowInfo = new Map()
  const pick = (options) => options[Math.floor(random() * options.length)]
  const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value))
  const approach = (value, target, step) => value + clamp(target - value, -step, step)
  let nextIndex = startIndex
  let left = Math.floor((columns - 16) / 2)
  let right = left + 15
  let center = (left + right) / 2
  let generatedRows = 0
  let bendDirection = 1
  let pendingBridges = 0
  let block

  function startBlock() {
    const firstBlock = !block
    if (pendingBridges > 0 && !firstBlock && block.kind !== 'bridge') {
      pendingBridges--
      const bridgeCenter = clamp((left + right) / 2, (BRIDGE_WIDTH + 1) / 2, columns - (BRIDGE_WIDTH + 3) / 2)
      const targetLeft = Math.round(bridgeCenter - (BRIDGE_WIDTH - 1) / 2)
      const entryLength = Math.max(Math.abs(left - targetLeft), Math.abs(right - targetLeft - BRIDGE_WIDTH + 1)) + 3
      const bridgeAge = entryLength + 2
      block = {
        kind: 'bridge',
        mode: { name: 'bridge', width: BRIDGE_WIDTH },
        age: 0,
        length: bridgeAge + 12,
        bridgeCenter,
        bridgeAge,
      }
      return
    }
    const mode = firstBlock ? MODES.find((candidate) => candidate.name === 'medium')
      : pick(MODES.filter((candidate) => candidate.name !== block.mode.name))
    const strongMeander = mode.name === 'very-narrow' || (!firstBlock && random() < 0.5)
    block = {
      kind: 'regular',
      mode,
      length: strongMeander ? pick(mode.lengths ?? BLOCK_LENGTHS) : 20,
      age: 0,
      targetCenter: center,
      meanderCenter: center,
      strongMeander,
      bendSpeed: 0.2,
      nextBendRow: 0,
      islandLayout: mode.name === 'wide' ? pick(ISLAND_LAYOUTS) : null,
      islands: null,
    }
  }

  function planIslands(firstRow) {
    const availableRows = block.length - 2 - firstRow
    const requestedCount = block.islandLayout === 'small' ? pick(SMALL_ISLAND_COUNTS[block.length])
      : block.islandLayout === 'double' ? pick(MEDIUM_ISLAND_COUNTS[block.length]) : 1
    const minimumLength = block.islandLayout === 'double' ? 3 : 2
    const count = Math.min(requestedCount, Math.floor((availableRows + 2) / (minimumLength + 2)))
    const slotLength = Math.floor((availableRows - (count - 1) * 2) / count)
    const lengths = block.islandLayout === 'small' ? [2, 3, 4, 5]
      : block.islandLayout === 'double' ? [3, 4, 5, 6] : [5, 7, 9, 11]
    const widths = block.islandLayout === 'small' ? [2, 3, 4, 5]
      : block.islandLayout === 'double' ? [4, 5, 6, 7, 8] : [9, 10, 12, 14]

    block.islands = Array.from({ length: count }, (_, islandIndex) => {
      const length = Math.min(pick(lengths), slotLength)
      const padding = Math.floor(random() * (slotLength - length + 1))
      return {
        start: firstRow + islandIndex * (slotLength + 2) + padding,
        length,
        width: pick(widths),
        position: random(),
      }
    })
  }

  function saveRow(land) {
    rows.set(nextIndex, land)
    rowInfo.set(nextIndex, { segment: block.kind, road: block.kind === 'bridge' && block.age === block.bridgeAge })
    nextIndex--
    generatedRows++
    block.age++
  }

  function generateBridgeRow() {
    const width = block.age > block.bridgeAge + 3 ? 16 : BRIDGE_WIDTH
    const targetLeft = clamp(Math.round(block.bridgeCenter - (width - 1) / 2), 1, columns - width - 1)
    left = approach(left, targetLeft, 1)
    right = approach(right, targetLeft + width - 1, 1)
    center = (left + right) / 2
    saveRow(Array.from({ length: columns }, (_, column) => column <= left || column >= right))
  }

  function generateRow() {
    if (!block || block.age === block.length) startBlock()
    if (block.kind === 'bridge') {
      generateBridgeRow()
      return
    }

    if (generatedRows >= 8 && block.age >= block.nextBendRow
      && Math.abs(center - block.targetCenter) < 0.75) {
      const minimumCenter = 1 + (block.mode.width - 1) / 2
      const maximumCenter = columns - 2 - (block.mode.width - 1) / 2
      if (block.strongMeander) {
        const edgeVariation = random() * (maximumCenter - minimumCenter) * 0.2
        bendDirection *= -1
        block.targetCenter = bendDirection < 0 ? minimumCenter + edgeVariation : maximumCenter - edgeVariation
        block.bendSpeed = random() < 0.3 ? 1 : pick([0.45, 0.55, 0.65])
        block.nextBendRow = block.age + pick([6, 8, 10])
      } else {
        block.targetCenter = clamp(block.meanderCenter + (random() - 0.5) * 4, minimumCenter, maximumCenter)
        block.bendSpeed = 0.2
        block.nextBendRow = block.age + pick([8, 10, 12])
      }
    }
    center = approach(center, block.targetCenter, block.bendSpeed)
    const targetLeft = clamp(Math.round(center - (block.mode.width - 1) / 2), 1, columns - block.mode.width - 1)
    left = approach(left, targetLeft, 1)
    right = approach(right, targetLeft + block.mode.width - 1, 1)

    const land = Array.from({ length: columns }, (_, column) => column <= left || column >= right)
    const waterWidth = right - left - 1

    if (block.islandLayout && !block.islands && waterWidth >= 14 && block.age >= 4) {
      planIslands(block.age)
    }

    for (const island of block.islands ?? []) {
      const localRow = block.age - island.start
      if (localRow >= 0 && localRow < island.length) {
        const maximumWidth = Math.min(island.width, waterWidth - 8)
        const progress = (localRow + 0.5) / island.length
        const width = Math.max(1, Math.round(maximumWidth * Math.sin(Math.PI * progress)))
        const footprintStart = left + 5 + Math.round((waterWidth - 8 - maximumWidth) * island.position)
        const start = footprintStart + Math.floor((maximumWidth - width) / 2)
        for (let column = start; column < start + width; column++) land[column] = true
      }
    }

    saveRow(land)
  }

  function isLand(index, column) {
    if (column < 0 || column >= columns || index > startIndex) return true
    while (nextIndex >= index) generateRow()
    return rows.get(index)[column]
  }

  return {
    requestBridge() {
      pendingBridges++
    },
    getRowInfo(index) {
      while (nextIndex >= index) generateRow()
      return rowInfo.get(index)
    },
    getTile(index, column) {
      if (!isLand(index, column)) return 'river'
      if (!isLand(index, column - 1) || !isLand(index, column + 1)
        || !isLand(index - 1, column) || !isLand(index + 1, column)) return 'coast'
      return 'grass'
    },
    prune(lastIndex) {
      for (const index of rows.keys()) {
        if (index > lastIndex) {
          rows.delete(index)
          rowInfo.delete(index)
        }
      }
    },
  }
}