import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const ink = '#222b2c'
const cream = '#fff1c7'
const profiles = [
  { name: 'Bob', skin: '#efb08c', shade: '#c87968', hair: '#814845', coat: '#508c99', trim: '#93c8bf' },
  { name: 'Vinston', skin: '#dda183', shade: '#ad6862', hair: '#583d43', coat: '#394c50', trim: '#86a09a' },
  { name: 'Jack', skin: '#f0cc57', shade: '#c39948', hair: ink, coat: '#558eac', trim: '#94c8d0' },
  { name: 'Rosanna', skin: '#e8ad93', shade: '#b87779', hair: '#b14e58', coat: '#506c85', trim: '#9eb7d0' },
  { name: 'Alexei', skin: '#9cbd72', shade: '#6e935f', hair: '#53674c', coat: '#a94c59', trim: '#efa68b' },
  { name: 'Ada', skin: '#bd8068', shade: '#8f5755', hair: '#3e343e', coat: '#db7956', trim: '#ffbd7c' },
  { name: 'Vera', skin: '#e4b19c', shade: '#b57d7b', hair: '#d6e3d4', coat: '#518576', trim: '#91b69b' },
]

for (const profile of profiles) {
  const pixels = Buffer.alloc(32 * 32 * 4)
  function box(left, top, width, height, color) {
    const value = Number.parseInt(color.slice(1), 16)
    for (let row = Math.max(0, top); row < Math.min(32, top + height); row++) {
      for (let column = Math.max(0, left); column < Math.min(32, left + width); column++) {
        const offset = (row * 32 + column) * 4
        pixels[offset] = (value >> 16) & 255
        pixels[offset + 1] = (value >> 8) & 255
        pixels[offset + 2] = value & 255
        pixels[offset + 3] = 255
      }
    }
  }

  box(7, 25, 18, 7, ink)
  box(3, 28, 26, 4, ink)
  box(5, 29, 22, 3, profile.coat)
  box(8, 26, 16, 6, profile.coat)
  box(12, 22, 8, 6, ink)
  box(13, 22, 6, 5, profile.shade)
  box(9, 26, 4, 3, profile.trim)
  box(19, 26, 4, 3, profile.trim)
  box(14, 27, 4, 5, ink)
  box(15, 28, 2, 4, cream)
  box(8, 6, 16, 16, ink)
  box(10, 4, 12, 20, ink)
  box(6, 12, 20, 6, ink)
  box(7, 13, 18, 4, profile.shade)
  box(9, 8, 14, 13, profile.skin)
  box(11, 20, 10, 3, profile.skin)
  box(20, 9, 3, 11, profile.shade)
  box(11, 7, 10, 3, profile.skin)
  box(11, 11, 4, 1, profile.hair)
  box(18, 11, 3, 1, profile.hair)
  box(11, 13, 3, 2, cream)
  box(18, 13, 3, 2, cream)
  box(12, 13, 2, 2, ink)
  box(18, 13, 2, 2, ink)
  box(15, 15, 2, 3, profile.shade)
  box(13, 20, 6, 1, ink)

  if (profile.name === 'Bob') {
    box(9, 4, 14, 5, profile.hair)
    box(8, 7, 3, 5, profile.hair)
    box(10, 3, 12, 2, ink)
    box(8, 4, 16, 3, profile.coat)
    box(9, 3, 14, 2, profile.trim)
    box(7, 7, 18, 2, ink)
    box(14, 4, 4, 2, cream)
    box(12, 19, 7, 1, cream)
    box(10, 29, 3, 1, cream)
    box(20, 29, 3, 1, cream)
  } else if (profile.name === 'Vinston') {
    box(8, 2, 16, 7, ink)
    box(10, 3, 12, 5, '#617d72')
    box(10, 7, 12, 2, '#d89b69')
    box(4, 9, 24, 2, ink)
    box(6, 9, 20, 1, '#86a09a')
    box(12, 17, 8, 2, profile.hair)
    box(9, 18, 5, 2, profile.hair)
    box(18, 18, 5, 2, profile.hair)
    box(8, 17, 2, 2, profile.hair)
    box(22, 17, 2, 2, profile.hair)
    box(11, 27, 4, 3, '#e85d61')
    box(17, 27, 4, 3, '#e85d61')
    box(15, 28, 2, 2, cream)
  } else if (profile.name === 'Jack') {
    box(9, 9, 14, 13, profile.skin)
    box(12, 21, 8, 2, profile.shade)
    box(7, 12, 18, 3, '#606b70')
    box(11, 10, 10, 8, ink)
    box(12, 10, 8, 8, '#a9b9b2')
    box(13, 11, 6, 6, cream)
    box(15, 12, 3, 4, '#795d45')
    box(16, 13, 2, 2, ink)
    box(13, 19, 5, 1, ink)
    box(18, 20, 2, 1, ink)
    box(13, 2, 1, 4, ink)
    box(16, 1, 1, 5, ink)
    box(19, 2, 1, 4, ink)
    box(10, 28, 3, 4, profile.trim)
    box(19, 28, 3, 4, profile.trim)
  } else if (profile.name === 'Rosanna') {
    box(6, 11, 3, 13, profile.hair)
    box(23, 11, 3, 13, profile.hair)
    box(4, 22, 5, 3, profile.hair)
    box(23, 22, 5, 3, profile.hair)
    box(8, 24, 4, 2, profile.hair)
    box(20, 24, 4, 2, profile.hair)
    box(10, 4, 12, 6, ink)
    box(12, 2, 8, 4, ink)
    box(14, 0, 4, 4, ink)
    box(11, 5, 10, 4, '#4c675b')
    box(13, 3, 6, 3, '#4c675b')
    box(4, 10, 24, 2, ink)
    box(7, 9, 18, 2, '#4c675b')
    box(11, 8, 10, 2, '#a94c59')
    box(15, 8, 3, 2, '#ffcf78')
    box(13, 20, 6, 1, '#a94c59')
    box(12, 27, 8, 2, profile.trim)
  } else if (profile.name === 'Alexei') {
    box(4, 8, 3, 7, ink)
    box(25, 8, 3, 7, ink)
    box(5, 9, 3, 4, profile.skin)
    box(24, 9, 3, 4, profile.skin)
    box(10, 5, 12, 5, profile.skin)
    box(10, 10, 5, 2, profile.hair)
    box(18, 10, 4, 2, profile.hair)
    box(13, 18, 7, 2, cream)
    box(11, 17, 2, 2, ink)
    box(20, 17, 2, 2, ink)
    box(10, 25, 4, 5, profile.trim)
    box(18, 25, 4, 5, profile.trim)
    box(21, 29, 3, 2, '#ffcf78')
  } else if (profile.name === 'Ada') {
    box(7, 5, 18, 5, profile.hair)
    box(9, 3, 14, 5, profile.hair)
    box(11, 2, 3, 3, profile.hair)
    box(18, 2, 3, 3, profile.hair)
    box(8, 10, 2, 5, profile.hair)
    box(22, 10, 2, 7, profile.hair)
    box(9, 7, 14, 3, '#cd9761')
    box(10, 6, 5, 5, ink)
    box(17, 6, 5, 5, ink)
    box(11, 7, 3, 3, '#93c8bf')
    box(18, 7, 3, 3, '#93c8bf')
    box(11, 7, 2, 1, cream)
    box(18, 7, 2, 1, cream)
    box(13, 20, 6, 1, cream)
    box(9, 28, 6, 2, '#fff1a8')
    box(11, 30, 2, 2, '#fff1a8')
    box(21, 27, 2, 5, profile.trim)
  } else if (profile.name === 'Vera') {
    box(8, 4, 16, 6, profile.hair)
    box(10, 3, 12, 2, profile.hair)
    box(8, 9, 3, 5, profile.hair)
    box(19, 8, 4, 3, profile.hair)
    box(20, 10, 3, 3, profile.hair)
    box(9, 7, 14, 2, '#e85d61')
    box(24, 8, 3, 3, '#e85d61')
    box(25, 10, 3, 4, '#a94c59')
    box(24, 17, 2, 3, '#ffcf78')
    box(13, 20, 5, 1, '#a94c59')
    box(10, 27, 12, 2, '#e85d61')
    box(18, 29, 3, 3, '#a94c59')
    box(9, 29, 4, 3, '#e2f692')
    box(10, 29, 2, 3, ink)
    box(9, 30, 4, 1, ink)
  }

  const destination = fileURLToPath(new URL(`../public/characters/${profile.name}.png`, import.meta.url))
  execFileSync('magick', ['-size', '32x32', '-depth', '8', 'rgba:-', '-filter', 'point', '-resize', '96x96', destination], { input: pixels })
  console.log(`Rendered ${profile.name}`)
}