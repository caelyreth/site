/* oxlint-disable max-depth, typescript/prefer-readonly-parameter-types -- The generator walks nested catalogue geometry and writes a typed payload. */
import { createHash } from 'node:crypto'
import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

type Coordinate = [number, number]
type Direction = [number, number, number]
type PointFeature = {
  geometry: { coordinates: Coordinate }
  properties?: { mag?: number }
}
type LineFeature = {
  geometry: { coordinates: Coordinate[][] }
  properties?: { rank?: number }
}
type FeatureCollection<Feature> = { features: Feature[] }
type Source = { url: string; sha256: string }

const REVISION = '7e720a3de062059d4c5400a379146a601d9010e0'
const SOURCE_ROOT = `https://raw.githubusercontent.com/ofrohn/d3-celestial/${REVISION}/data`
const SOURCES = {
  stars: {
    url: `${SOURCE_ROOT}/stars.6.json`,
    sha256:
      '0297b8fa3adfbce1dc26566f61c4abcc1df4f29c6a28729ca06b56d1c6d25602',
  },
  lines: {
    url: `${SOURCE_ROOT}/constellations.lines.json`,
    sha256:
      '294f66bef5d5cf50b1e17f16d2efa1d97a15131612c68dd935adef6e7373e13c',
  },
} satisfies Record<string, Source>

const OUTPUT = fileURLToPath(
  new URL('../src/lib/data/sky-map-data.generated.ts', import.meta.url),
)
const VIEW_CENTER: Coordinate = [-38, 42]
const CAP_RADIUS = 140
const SOURCE_RADIUS = 70
const NODE_STRIDE = 4
const PRINT_WIDTH = 76

function radians(degrees: number) {
  return (degrees * Math.PI) / 180
}

function direction([longitude, latitude]: Coordinate): Direction {
  const lon = radians(longitude)
  const lat = radians(latitude)
  const latitudeRadius = Math.cos(lat)
  return [
    latitudeRadius * Math.cos(lon),
    Math.sin(lat),
    latitudeRadius * Math.sin(lon),
  ]
}

function dot(a: Direction, b: Direction) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
}

function angularDistance(a: Direction, b: Direction) {
  return Math.acos(Math.max(-1, Math.min(1, dot(a, b))))
}

function coordinateKey(coordinates: Coordinate) {
  return coordinates.map((value) => value.toFixed(4)).join(':')
}

async function fetchPinnedJson<T>({ url, sha256 }: Source): Promise<T> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Unable to fetch ${url}: ${response.status}`)
  }

  const source = await response.text()
  const actual = createHash('sha256').update(source).digest('hex')
  if (actual !== sha256) throw new Error(`Checksum mismatch for ${url}`)
  return JSON.parse(source) as T
}

function formatTypedArray(
  name: string,
  type: string,
  values: readonly number[],
) {
  const rows: string[] = []
  let row = '  '

  for (const value of values) {
    const entry = `${value},`
    const next = row === '  ' ? `${row}${entry}` : `${row} ${entry}`
    if (next.length > PRINT_WIDTH && row.length > 2) {
      rows.push(row)
      row = `  ${entry}`
    } else {
      row = next
    }
  }
  rows.push(row)

  return `export const ${name} = new ${type}([\n${rows.join('\n')}\n])\n`
}

const [starCatalogue, constellationCatalogue] = await Promise.all([
  fetchPinnedJson<FeatureCollection<PointFeature>>(SOURCES.stars),
  fetchPinnedJson<FeatureCollection<LineFeature>>(SOURCES.lines),
])

const center = direction(VIEW_CENTER)
const centerLongitude = radians(VIEW_CENTER[0])
const centerLatitude = radians(VIEW_CENTER[1])
const right: Direction = [
  -Math.sin(centerLongitude),
  0,
  Math.cos(centerLongitude),
]
const up: Direction = [
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
const nodes: { point: Direction; magnitude: number }[] = []
const nodeByCoordinate = new Map<string, number>()

function addNode(coordinates: Coordinate, feature?: PointFeature) {
  const key = coordinateKey(coordinates)
  const existing = nodeByCoordinate.get(key)
  if (existing !== undefined) return existing

  const index = nodes.length
  nodes.push({
    point: direction(coordinates),
    magnitude: Number(feature?.properties?.mag ?? 6),
  })
  nodeByCoordinate.set(key, index)
  return index
}

for (const feature of starCatalogue.features) {
  if (
    angularDistance(direction(feature.geometry.coordinates), center) <=
    capAngle
  ) {
    addNode(feature.geometry.coordinates, feature)
  }
}

const edges: number[] = []
const edgeKeys = new Set<string>()
for (const constellation of constellationCatalogue.features) {
  const rank = Math.max(
    1,
    Math.min(3, Number(constellation.properties?.rank ?? 3)),
  )

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
      const midpointDirection: Direction = [
        midpoint[0] / midpointLength,
        midpoint[1] / midpointLength,
        midpoint[2] / midpointLength,
      ]
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

const packedNodes: number[] = []
const sourceNodes: number[] = []
for (const [index, node] of nodes.entries()) {
  packedNodes.push(
    Math.round(node.point[0] * 32767),
    Math.round(node.point[1] * 32767),
    Math.round(node.point[2] * 32767),
    Math.round(node.magnitude * 100),
  )
  if (
    node.magnitude <= 2.65 &&
    angularDistance(node.point, center) <= sourceAngle
  ) {
    sourceNodes.push(index)
  }
}

if (nodes.length > 65535) {
  throw new Error('Sky node indices exceed Uint16 capacity')
}
if (edges.length === 0 || sourceNodes.length === 0) {
  throw new Error('Sky selection produced no renderable constellation data')
}

const header = [
  '// Generated by scripts/build-sky-map.ts. Do not edit by hand.',
  `// Source: D3-Celestial ${REVISION} (BSD-3-Clause); see sky-map-data.LICENSE.txt.`,
  `// View: J2000 equatorial coordinates centered at RA ${VIEW_CENTER[0]} deg, Dec ${VIEW_CENTER[1]} deg.`,
  `// Payload: ${nodes.length} stars/nodes, ${edges.length / 3} segments, ${sourceNodes.length} bright-star sources.`,
  '',
].join('\n')
const moduleSource = [
  header,
  `export const SKY_NODE_STRIDE = ${NODE_STRIDE}\n`,
  formatTypedArray('SKY_VIEW_BASIS', 'Float32Array', [
    ...right,
    ...up,
    ...center,
  ]),
  formatTypedArray('SKY_NODES', 'Int16Array', packedNodes),
  formatTypedArray('SKY_EDGES', 'Uint16Array', edges),
  formatTypedArray('SKY_SOURCE_NODES', 'Uint16Array', sourceNodes),
].join('\n')

await writeFile(OUTPUT, moduleSource)
console.log(
  `Generated ${nodes.length} catalogue stars/nodes, ${edges.length / 3} constellation segments, and ${sourceNodes.length} signal sources.`,
)
