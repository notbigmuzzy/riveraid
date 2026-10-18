export function createPilotTexture(scene, key, pilotName, transform) {
  const name = `${pilotName}-${key}`
  if (scene.textures.exists(name)) return name
  const source = scene.textures.get(key)
  const image = source.getSourceImage()
  const texture = scene.textures.createCanvas(name, image.width, image.height)
  const context = texture.getContext()
  context.drawImage(image, 0, 0)
  const pixels = context.getImageData(0, 0, image.width, image.height)
  for (let offset = 0; offset < pixels.data.length; offset += 4) {
    if (pixels.data[offset + 3] === 0) continue
    transform(pixels.data, offset, (offset / 4) % image.width, Math.floor(offset / 4 / image.width))
  }
  context.putImageData(pixels, 0, 0)
  texture.refresh()
  for (const frameName of source.getFrameNames()) {
    const frame = source.get(frameName)
    texture.add(frameName, 0, frame.cutX, frame.cutY, frame.cutWidth, frame.cutHeight)
  }
  return name
}