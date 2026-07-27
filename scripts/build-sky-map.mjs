import { createHash } from 'node:crypto'
import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const REVISION = '7e720a3de062059d4c5400a379146a601d9010e0'
const SOURCE_ROOT = `https://raw.githubusercontent.com/ofrohn/d3-celestial/${REVISION}/data`
const SOURCES = {
  stars: {
    url: `${SOURCE_ROOT}/stars.6.json`,
    sha256: '0297b8fa3adfbce1dc26566f61c4abcc1df4f29c6a28729ca06b56d1c6d25602',
  },
  lines: {
    url: `${SOURCE_ROOT}/constellations.lines.json`,
    sha256: '294f66bef5d5cf50b1e17f16d2efa1d97a15131612c68dd935adef6e7373e13c',
  },
}
const OUTPUT = fileURLToPath(new URL('../src/lib/sky-map-data.generated.ts', import.meta.url))
const VIEW_CENTER = [-38, 42]
const CAP_RADIUS = 92
const SOURCE_RADIUS = 70
const NODE_STRIDE = 4

function radians(degrees) {
  return (degrees * Math.PI) / 180
}

function direction([longitude, latitude]) {
  const lon = radians(longitude)
  const lat = radians(latitude)
  const latitudeRadius = Math.cos(lat)
  return [
    latitudeRadius * Math.cos(lon),
    Math.sin(lat),
    latitudeRadius * Math.sin(lon),
  ]
}

function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
}

function angularDistance(a, b) {
  return Math.acos(Math.max(-1, Math.min(1, dot(a, b))))
}

function coordinateKey(coordinates) {
  return coordinates.map((value) => Number(value).toFixed(4)).join(':')
}

async function fetchPinnedJson({ url, sha256 }) {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Unable to fetch ${url}: ${response.status}`)
  const source = await response.text()
  const actual = createHash('sha256').update(source).digest('hex')
  if (actual !== sha256) throw new Error(`Checksum mismatch for ${url}`)
  return JSON.parse(source)
}

function formatTypedArray(name, type, values, rowLength) {
  const rows = []
  for (let index = 0; index < values.length; index += rowLength) {
    rows.push(`  ${values.slice(index, index + rowLength).join(', ')},`)
  }
  return `export const ${name} = new ${type}([\n${rows.join('\n')}\n])\n`
}

const [starCatalogue, constellationCatalogue] = await Promise.all([
  fetchPinnedJson(SOURCES.stars),
  fetchPinnedJson(SOURCES.lines),
])

const center = direction(VIEW_CENTER)
const centerLongitude = radians(VIEW_CENTER[0])
const centerLatitude = radians(VIEW_CENTER[1])
const right = [-Math.sin(centerLongitude), 0, Math.cos(centerLongitude)]
const up = [
  -Math.sin(centerLatitude) * Math.cos(centerLongitude),
  Math.cos(centerLatitude),
  -Math.sin(centerLatitude) * Math.sin(centerLongitude),
]
const capAngle = radians(CAP_RADIUS)
const sourceAngle = radians(SOURCE_RADIUS)
const catalogueByCoordinate = new Map(
  starCatalogue.features.map((feature) => [
    coordinateKey(feature.geometry.coordinates),
    feature,
  ]),
)
const nodes = []
const nodeByCoordinate = new Map()

function addNode(coordinates, feature) {
  const key = coordinateKey(coordinates)
  const existing = nodeByCoordinate.get(key)
  if (existing !== undefined) return existing

  const point = direction(coordinates)
  const index = nodes.length
  const magnitude = Number(feature?.properties.mag ?? 6)
  nodes.push({ point, magnitude })
  nodeByCoordinate.set(key, index)
  return index
}

for (const feature of starCatalogue.features) {
  const point = direction(feature.geometry.coordinates)
  if (angularDistance(point, center) <= capAngle) {
    addNode(feature.geometry.coordinates, feature)
  }
}

const edges = []
const edgeKeys = new Set()
for (const constellation of constellationCatalogue.features) {
  const rank = Math.max(1, Math.min(3, Number(constellation.properties.rank ?? 3)))
  for (const line of constellation.geometry.coordinates) {
    for (let index = 1; index < line.length; index += 1) {
      const startCoordinates = line[index - 1]
      const endCoordinates = line[index]
      const startPoint = direction(startCoordinates)
      const endPoint = direction(endCoordinates)
      const midpoint = [
        startPoint[0] + endPoint[0],
        startPoint[1] + endPoint[1],
        startPoint[2] + endPoint[2],
      ]
      const midpointLength = Math.hypot(...midpoint)
      const midpointDirection = midpoint.map((value) => value / midpointLength)
      const visible = [startPoint, midpointDirection, endPoint].some(
        (point) => angularDistance(point, center) <= capAngle,
      )
      if (!visible) continue

      const start = addNode(
        startCoordinates,
        catalogueByCoordinate.get(coordinateKey(startCoordinates)),
      )
      const end = addNode(
        endCoordinates,
        catalogueByCoordinate.get(coordinateKey(endCoordinates)),
      )
      const edgeKey = start < end ? `${start}:${end}` : `${end}:${start}`
      if (edgeKeys.has(edgeKey)) continue
      edgeKeys.add(edgeKey)
      edges.push(start, end, rank)
    }
  }
}

const packedNodes = []
const sourceNodes = []
for (const [index, node] of nodes.entries()) {
  packedNodes.push(
    Math.round(node.point[0] * 32767),
    Math.round(node.point[1] * 32767),
    Math.round(node.point[2] * 32767),
    Math.round(node.magnitude * 100),
  )
  if (node.magnitude <= 2.65 && angularDistance(node.point, center) <= sourceAngle) {
    sourceNodes.push(index)
  }
}

if (nodes.length > 65535) throw new Error('Sky node indices exceed Uint16 capacity')
if (edges.length === 0 || sourceNodes.length === 0) {
  throw new Error('Sky selection produced no renderable constellation data')
}

const header = `// Generated by scripts/build-sky-map.mjs. Do not edit by hand.\n` +
  `// Source: D3-Celestial ${REVISION} (BSD-3-Clause); see sky-map-data.LICENSE.txt.\n` +
  `// View: J2000 equatorial coordinates centered at RA ${VIEW_CENTER[0]} deg, Dec ${VIEW_CENTER[1]} deg.\n` +
  `// Payload: ${nodes.length} stars/nodes, ${edges.length / 3} segments, ${sourceNodes.length} bright-star sources.\n\n`
const moduleSource = [
  header,
  `export const SKY_NODE_STRIDE = ${NODE_STRIDE}\n`,
  formatTypedArray('SKY_VIEW_BASIS', 'Float32Array', [...right, ...up, ...center], 3),
  formatTypedArray('SKY_NODES', 'Int16Array', packedNodes, 15),
  formatTypedArray('SKY_EDGES', 'Uint16Array', edges, 15),
  formatTypedArray('SKY_SOURCE_NODES', 'Uint16Array', sourceNodes, 15),
].join('\n')

await writeFile(OUTPUT, moduleSource)
console.log(
  `Generated ${nodes.length} catalogue stars/nodes, ${edges.length / 3} constellation segments, and ${sourceNodes.length} signal sources.`,
)
