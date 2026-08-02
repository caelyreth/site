/* oxlint-disable complexity, typescript/prefer-readonly-parameter-types -- WebGL setup and pulse state share one lifecycle. */
import type * as SkyDataModule from '$lib/data/sky-map-data.generated'
import {
  BufferAttribute,
  BufferGeometry,
  Camera,
  Color,
  DataTexture,
  Float32BufferAttribute,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  LinearFilter,
  LinearMipmapLinearFilter,
  Mesh,
  NearestFilter,
  Points,
  Quaternion,
  RepeatWrapping,
  Scene,
  ShaderMaterial,
  SRGBColorSpace,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three'

import {
  backgroundFragmentShader,
  backgroundVertexShader,
  edgeFragmentShader,
  edgeVertexShader,
  routeFragmentShader,
  routeVertexShader,
  starFragmentShader,
  starVertexShader,
  trailFragmentShader,
  trailVertexShader,
} from './shaders'
import { SIGNAL_PALETTES } from './signal-colors'

type SkyData = typeof SkyDataModule
type FieldController = {
  destroy: () => void
  setActive: (active: boolean) => void
  setTheme: (dark: boolean) => void
}
export type SkyMapViewStatus = {
  declination: number
  rightAscension: number
  scale: number
}
export type SkyMapPulseStatus = {
  colorIndex: number
}
export type SkyMapLayerMotionStatus = {
  duration: number
}
type FieldCallbacks = {
  onForegroundContractStart?: (status: SkyMapLayerMotionStatus) => void
  onForegroundReturnStart?: (status: SkyMapLayerMotionStatus) => void
  onSpreadEnd?: () => void
  onSpreadStart?: (status: SkyMapPulseStatus) => void
  onViewChange?: (status: SkyMapViewStatus) => void
}
type SkyMap = {
  directions: Float32Array
  magnitudes: Float32Array
  edgeNodes: Uint16Array
  edgeGroups: Uint16Array
  edgeWeights: Float32Array
  nodeGroups: Int16Array
}
type RouteCandidate = {
  index: number
  radius: number
  sector: number
  viewDistance: number
}

const EDGE_WEIGHT_BY_CLASS = [1, 0.76, 0.56] as const
const PULSE_HEAD_WIDTH = 0.28
const LOCATOR_DURATION = 1040
const LOCATOR_COLLAPSE_DURATION = 480
const LOCATOR_INITIAL_SCALE = 2
const LOCATOR_DOT_SCALE = 0.08
const SIGNAL_SPEED = 0.7 / 1000
const SOURCE_RELEASE_DURATION = LOCATOR_COLLAPSE_DURATION
const CONSTELLATION_RETIRE_DURATION = 900
const DAMPING_STIFFNESS = 5.5
const DAMPING_SETTLED_RESPONSE =
  1 - (1 + DAMPING_STIFFNESS) * Math.exp(-DAMPING_STIFFNESS)
const BASE_VIEW_RADIUS = (55 * Math.PI) / 180
const ROUTE_CANDIDATE_MAGNITUDE = 3.6
const ROUTE_CENTER_RADIUS = 0.22
const ROUTE_SOURCE_MAX_RADIUS = 0.44
const ROUTE_OUTBOUND_RADIUS = 0.54
const ROUTE_TARGET_VISIBLE_OFFSET = (33 * Math.PI) / 180
const ROUTE_MIN_SECTOR_GAP = 3
const ROUTE_MIN_DISTANCE = (96 * Math.PI) / 180
const ROUTE_MAX_DISTANCE = (132 * Math.PI) / 180
const ROUTE_MIN_CAMERA_ROTATION = (24 * Math.PI) / 180
const ROUTE_PREFERRED_CAMERA_ROTATION = (42 * Math.PI) / 180
const ROUTE_MAX_CAMERA_ROTATION = (58 * Math.PI) / 180
const ROUTE_FINAL_SOURCE_MIN_DISTANCE = (60 * Math.PI) / 180
const ROUTE_SCORE_POOL_SIZE = 4
const ROUTE_HISTORY_LENGTH = 4
const ROUTE_MAX_BACKTRACK_DOT = 0.35
const ROUTE_RIBBON_SEGMENTS = 48
const SIGNAL_CONTINUATION_DISTANCE = 0.16
const SIGNAL_FADE_DISTANCE = 0.26
const DESTINATION_CONSTELLATION_LEAD = 0.54
const TAU = Math.PI * 2
const BACKDROP_SIZE = 256
const BACKDROP_CELL_SIZE = 1
const BACKDROP_CELL_COUNT = BACKDROP_SIZE / BACKDROP_CELL_SIZE
const VIEW_STATUS_INTERVAL = 100
const CAMERA_ANGULAR_SPEED = (20 * Math.PI) / 180 / 1000
const CAMERA_MIN_ROUTE_LEAD = 240
const CAMERA_MAX_ROUTE_LEAD = 620
const CAMERA_CAPTURE_LAG = 60
const CAMERA_MIN_WIDENING = (8 * Math.PI) / 180
const CAMERA_MAX_WIDENING = (12 * Math.PI) / 180
const SIGNAL_VELOCITY_APEX = 0.38
const SIGNAL_TERMINAL_VELOCITY = 0.22
const ROUTE_VELOCITY_APEX = 0.34
const ROUTE_TERMINAL_VELOCITY = 0.28
const CAMERA_VELOCITY_APEX = 0.44
const FOREGROUND_CONTRACT_DELAY = 85
const FOREGROUND_CONTRACT_MIN_DURATION = 620
const FOREGROUND_CONTRACT_MAX_DURATION = 860
const FOREGROUND_CONTRACT_APEX_LEAD = 70
const FOREGROUND_RETURN_LAG = 130
const FOREGROUND_SETTLE_LAG = 75
const TRAIL_RESPONSE = 1.18
const TRAIL_MAX_LENGTH = 168
const TRAIL_FIELD_SAMPLE_RATE = 0.24
const TRAIL_RELEASE_PROGRESS = 0.78
const TRAIL_CAPTURE_LEAD = 35
const three = {
  BufferAttribute,
  BufferGeometry,
  Camera,
  Color,
  DataTexture,
  Float32BufferAttribute,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  LinearFilter,
  LinearMipmapLinearFilter,
  Mesh,
  NearestFilter,
  Points,
  Quaternion,
  RepeatWrapping,
  Scene,
  ShaderMaterial,
  SRGBColorSpace,
  Vector2,
  Vector3,
  WebGLRenderer,
}

function decodeSkyMap(skyData: SkyData): SkyMap {
  const { SKY_EDGES, SKY_NODES, SKY_NODE_STRIDE } = skyData
  const nodeCount = SKY_NODES.length / SKY_NODE_STRIDE
  const edgeCount = SKY_EDGES.length / 3
  const directions = new Float32Array(nodeCount * 3)
  const magnitudes = new Float32Array(nodeCount)
  const edgeNodes = new Uint16Array(edgeCount * 2)
  const edgeGroups = new Uint16Array(edgeCount)
  const edgeWeights = new Float32Array(edgeCount)
  const parents = new Uint16Array(nodeCount)
  const nodeGroups = new Int16Array(nodeCount)
  nodeGroups.fill(-1)

  for (let index = 0; index < nodeCount; index += 1) {
    parents[index] = index
  }

  const findGroup = (node: number) => {
    let parent = node
    while (parents[parent] !== parent) {
      parents[parent] = parents[parents[parent]]
      parent = parents[parent]
    }
    return parent
  }

  for (let index = 0; index < nodeCount; index += 1) {
    const packed = index * SKY_NODE_STRIDE
    const point = index * 3
    directions[point] = SKY_NODES[packed] / 32767
    directions[point + 1] = SKY_NODES[packed + 1] / 32767
    directions[point + 2] = SKY_NODES[packed + 2] / 32767
    magnitudes[index] = SKY_NODES[packed + 3] / 100
  }

  for (let index = 0; index < edgeCount; index += 1) {
    const packed = index * 3
    const edge = index * 2
    edgeNodes[edge] = SKY_EDGES[packed]
    edgeNodes[edge + 1] = SKY_EDGES[packed + 1]
    edgeWeights[index] = EDGE_WEIGHT_BY_CLASS[SKY_EDGES[packed + 2] - 1]
    const startGroup = findGroup(edgeNodes[edge])
    const endGroup = findGroup(edgeNodes[edge + 1])
    if (startGroup !== endGroup) parents[endGroup] = startGroup
  }

  const groupByRoot = new Map<number, number>()
  for (let index = 0; index < edgeCount; index += 1) {
    const edge = index * 2
    const start = edgeNodes[edge]
    const end = edgeNodes[edge + 1]
    const root = findGroup(start)
    let group = groupByRoot.get(root)
    if (group === undefined) {
      group = groupByRoot.size
      groupByRoot.set(root, group)
    }
    edgeGroups[index] = group
    nodeGroups[start] = group
    nodeGroups[end] = group
  }

  return {
    directions,
    magnitudes,
    edgeNodes,
    edgeGroups,
    edgeWeights,
    nodeGroups,
  }
}

function choosePixelRatio(width: number, height: number) {
  const nativeRatio = Math.min(window.devicePixelRatio || 1, 1.75)
  const pixelBudget = 2_600_000
  const budgetRatio = Math.sqrt(pixelBudget / Math.max(1, width * height))
  return Math.max(1, Math.min(nativeRatio, budgetRatio))
}

function brightnessForMagnitude(magnitude: number) {
  const brightnessBase = Math.min(
    1,
    Math.max(0.015, (6.25 - magnitude) / 7.75),
  )
  return Math.pow(brightnessBase, 1.28)
}

function criticallyDampedProgress(value: number) {
  const progress = Math.min(1, Math.max(0, value))
  const response =
    1 -
    (1 + DAMPING_STIFFNESS * progress) *
      Math.exp(-DAMPING_STIFFNESS * progress)
  return Math.min(1, response / DAMPING_SETTLED_RESPONSE)
}

function smootherstepProgress(value: number) {
  const progress = Math.min(1, Math.max(0, value))
  return (
    progress * progress * progress * (progress * (6 * progress - 15) + 10)
  )
}

function impulseProgress(
  value: number,
  apex: number,
  terminalVelocity = 0,
) {
  const progress = Math.min(1, Math.max(0, value))
  const peakVelocity = 2 - terminalVelocity * (1 - apex)
  if (progress < apex) {
    return (0.5 * peakVelocity * progress * progress) / apex
  }
  const elapsed = progress - apex
  const deceleration = (terminalVelocity - peakVelocity) / (1 - apex)
  return (
    0.5 * peakVelocity * apex +
    peakVelocity * elapsed +
    0.5 * deceleration * elapsed * elapsed
  )
}

function inverseImpulseProgress(
  value: number,
  apex: number,
  terminalVelocity = 0,
) {
  const target = Math.min(1, Math.max(0, value))
  let lower = 0
  let upper = 1
  for (let iteration = 0; iteration < 18; iteration += 1) {
    const middle = (lower + upper) * 0.5
    if (impulseProgress(middle, apex, terminalVelocity) < target) {
      lower = middle
    } else {
      upper = middle
    }
  }
  return (lower + upper) * 0.5
}

function signalProgress(value: number) {
  return impulseProgress(
    value,
    SIGNAL_VELOCITY_APEX,
    SIGNAL_TERMINAL_VELOCITY,
  )
}

function routeProgress(value: number) {
  return impulseProgress(
    value,
    ROUTE_VELOCITY_APEX,
    ROUTE_TERMINAL_VELOCITY,
  )
}

function cameraMotionProgress(value: number) {
  return impulseProgress(value, CAMERA_VELOCITY_APEX)
}

function cameraVelocityEnvelope(value: number) {
  const progress = Math.min(1, Math.max(0, value))
  if (progress < CAMERA_VELOCITY_APEX) {
    return progress / CAMERA_VELOCITY_APEX
  }
  return (1 - progress) / (1 - CAMERA_VELOCITY_APEX)
}

function zoomEnvelope(cameraProgress: number) {
  return smootherstepProgress(cameraVelocityEnvelope(cameraProgress))
}

function trailReleaseOpacity(value: number) {
  const progress = Math.min(1, Math.max(0, value))
  const remaining = 1 - progress
  return remaining * remaining * remaining
}

function mapScaleForViewRadius(viewRadius: number) {
  return 0.25 / Math.tan(viewRadius * 0.5)
}

export function createSkyMapField(
  target: HTMLCanvasElement,
  skyData: SkyData,
  initialDark = false,
  callbacks: FieldCallbacks = {},
): FieldController {
  let renderer: WebGLRenderer
  try {
    renderer = new three.WebGLRenderer({
      alpha: true,
      antialias: false,
      canvas: target,
      powerPreference: 'low-power',
    })
  } catch {
    return { destroy: () => {}, setActive: () => {}, setTheme: () => {} }
  }

  renderer.setClearColor(0x000000, 0)
  renderer.outputColorSpace = three.SRGBColorSpace
  renderer.sortObjects = false

  function createBackdropTexture() {
    const pixels = new Uint8Array(BACKDROP_SIZE * BACKDROP_SIZE * 4)
    let seed = 0x8f3d91a7
    const random = () => {
      seed = (seed * 1_664_525 + 1_013_904_223) >>> 0
      return seed / 4_294_967_296
    }
    const cellBrightness = new Uint8Array(
      BACKDROP_CELL_COUNT * BACKDROP_CELL_COUNT,
    )
    for (let cell = 0; cell < cellBrightness.length; cell += 1) {
      if (random() >= 0.06) continue
      cellBrightness[cell] =
        random() < 0.86
          ? Math.round(4 + Math.pow(random(), 3.5) * 40)
          : Math.round(132 + Math.pow(random(), 0.8) * 123)
    }
    for (let pixel = 0; pixel < BACKDROP_SIZE * BACKDROP_SIZE; pixel += 1) {
      const x = pixel % BACKDROP_SIZE
      const y = Math.floor(pixel / BACKDROP_SIZE)
      const cell =
        Math.floor(y / BACKDROP_CELL_SIZE) * BACKDROP_CELL_COUNT +
        Math.floor(x / BACKDROP_CELL_SIZE)
      const brightness = cellBrightness[cell]
      const offset = pixel * 4
      pixels[offset] = brightness
      pixels[offset + 1] = brightness
      pixels[offset + 2] = brightness
      pixels[offset + 3] = 255
    }

    const texture = new three.DataTexture(
      pixels,
      BACKDROP_SIZE,
      BACKDROP_SIZE,
    )
    texture.generateMipmaps = true
    texture.magFilter = three.NearestFilter
    texture.minFilter = three.LinearMipmapLinearFilter
    texture.unpackAlignment = 1
    texture.wrapS = three.RepeatWrapping
    texture.needsUpdate = true
    return texture
  }

  const { SKY_SOURCE_NODES, SKY_VIEW_BASIS } = skyData
  const skyMap = decodeSkyMap(skyData)
  const starBrightnesses = new Float32Array(skyMap.magnitudes.length)
  const trailDirections: number[] = []
  const trailStrengths: number[] = []
  const trailWidthFactors: number[] = []
  let trailSeed = 0x71e2a9d5
  for (let index = 0; index < skyMap.magnitudes.length; index += 1) {
    const brightness = brightnessForMagnitude(skyMap.magnitudes[index])
    starBrightnesses[index] = brightness
    trailSeed = (trailSeed * 1_664_525 + 1_013_904_223) >>> 0
    const selected = trailSeed / 4_294_967_296 < TRAIL_FIELD_SAMPLE_RATE
    if (skyMap.nodeGroups[index] < 0 && !selected) continue
    const direction = index * 3
    trailDirections.push(
      skyMap.directions[direction],
      skyMap.directions[direction + 1],
      skyMap.directions[direction + 2],
    )
    trailStrengths.push(0.16 + Math.pow(brightness, 0.72) * 0.38)
    trailWidthFactors.push(Math.pow(brightness, 0.68))
  }
  const backdropTexture = createBackdropTexture()
  const nodeDistances = new Float32Array(skyMap.magnitudes.length)
  const scene = new three.Scene()
  const camera = new three.Camera()
  const uniforms = {
    uResolution: { value: new three.Vector2(1, 1) },
    uPixelRatio: { value: 1 },
    uAspect: { value: 1 },
    uMapScale: { value: mapScaleForViewRadius(BASE_VIEW_RADIUS) },
    uRight: {
      value: new three.Vector3(
        SKY_VIEW_BASIS[0],
        SKY_VIEW_BASIS[1],
        SKY_VIEW_BASIS[2],
      ),
    },
    uUp: {
      value: new three.Vector3(
        SKY_VIEW_BASIS[3],
        SKY_VIEW_BASIS[4],
        SKY_VIEW_BASIS[5],
      ),
    },
    uForward: {
      value: new three.Vector3(
        SKY_VIEW_BASIS[6],
        SKY_VIEW_BASIS[7],
        SKY_VIEW_BASIS[8],
      ),
    },
    uHalfWidth: { value: 1.32 },
    uPulseDistance: { value: 0 },
    uRoutePulseDistance: { value: 0 },
    uPulseActive: { value: 0 },
    uTargetDistance: { value: 0 },
    uDestinationConstellationLead: {
      value: DESTINATION_CONSTELLATION_LEAD,
    },
    uSourceActivation: { value: 0 },
    uHeadWidth: { value: PULSE_HEAD_WIDTH },
    uTailWidth: { value: 0.46 },
    uSourceRadius: { value: 0.04 },
    uLocatorProgress: { value: 0 },
    uLocatorScale: { value: 1 },
    uRouteStart: { value: new three.Vector3() },
    uRouteEnd: { value: new three.Vector3() },
    uRouteBend: { value: new three.Vector3() },
    uRouteLength: { value: 0 },
    uSourceConstellation: { value: -1 },
    uTargetConstellation: { value: -1 },
    uHeldSourceConstellation: { value: -1 },
    uHeldTargetConstellation: { value: -1 },
    uRetiringConstellation: { value: -1 },
    uRetireProgress: { value: 1 },
    uBackdrop: { value: backdropTexture },
    uBackgroundAlpha: { value: 1 },
    uBackgroundInk: { value: new three.Color(0x000000) },
    uInk: { value: new three.Color(0xffffff) },
    uSignalInk: { value: new three.Color(0xffffff) },
    uBaseAlpha: { value: 0.2 },
    uSurveyMode: { value: initialDark ? 0 : 1 },
    uTrailMapScale: { value: mapScaleForViewRadius(BASE_VIEW_RADIUS) },
    uTrailMaxLength: { value: TRAIL_MAX_LENGTH },
    uTrailOpacity: { value: 0 },
    uTrailRight: {
      value: new three.Vector3(
        SKY_VIEW_BASIS[0],
        SKY_VIEW_BASIS[1],
        SKY_VIEW_BASIS[2],
      ),
    },
    uTrailUp: {
      value: new three.Vector3(
        SKY_VIEW_BASIS[3],
        SKY_VIEW_BASIS[4],
        SKY_VIEW_BASIS[5],
      ),
    },
    uTrailForward: {
      value: new three.Vector3(
        SKY_VIEW_BASIS[6],
        SKY_VIEW_BASIS[7],
        SKY_VIEW_BASIS[8],
      ),
    },
  }
  const backgroundMaterial = new three.ShaderMaterial({
    transparent: true,
    depthTest: false,
    depthWrite: false,
    toneMapped: false,
    uniforms,
    vertexShader: backgroundVertexShader,
    fragmentShader: backgroundFragmentShader,
  })
  const edgeMaterial = new three.ShaderMaterial({
    transparent: true,
    depthTest: false,
    depthWrite: false,
    toneMapped: false,
    uniforms,
    vertexShader: edgeVertexShader,
    fragmentShader: edgeFragmentShader,
  })
  const routeMaterial = new three.ShaderMaterial({
    transparent: true,
    depthTest: false,
    depthWrite: false,
    toneMapped: false,
    uniforms,
    vertexShader: routeVertexShader,
    fragmentShader: routeFragmentShader,
  })
  const starMaterial = new three.ShaderMaterial({
    transparent: true,
    depthTest: false,
    depthWrite: false,
    toneMapped: false,
    uniforms,
    vertexShader: starVertexShader,
    fragmentShader: starFragmentShader,
  })
  const trailMaterial = new three.ShaderMaterial({
    transparent: true,
    depthTest: false,
    depthWrite: false,
    toneMapped: false,
    uniforms,
    vertexShader: trailVertexShader,
    fragmentShader: trailFragmentShader,
  })

  const ribbon: number[] = []
  const ribbonIndices: number[] = []
  const ribbonSegments = 4
  for (let point = 0; point <= ribbonSegments; point += 1) {
    const along = point / ribbonSegments
    ribbon.push(along, -1, 0, along, 1, 0)
  }
  for (let segment = 0; segment < ribbonSegments; segment += 1) {
    const start = segment * 2
    const end = start + 2
    ribbonIndices.push(start, start + 1, end, end, start + 1, end + 1)
  }
  const routeRibbon: number[] = []
  const routeIndices: number[] = []
  for (let point = 0; point <= ROUTE_RIBBON_SEGMENTS; point += 1) {
    const along = point / ROUTE_RIBBON_SEGMENTS
    routeRibbon.push(along, -1, 0, along, 1, 0)
  }
  for (let segment = 0; segment < ROUTE_RIBBON_SEGMENTS; segment += 1) {
    const start = segment * 2
    const end = start + 2
    routeIndices.push(start, start + 1, end, end, start + 1, end + 1)
  }

  const edgeCount = skyMap.edgeNodes.length / 2
  const starts = new Float32Array(edgeCount * 3)
  const ends = new Float32Array(edgeCount * 3)
  for (let index = 0; index < edgeCount; index += 1) {
    const startNode = skyMap.edgeNodes[index * 2] * 3
    const endNode = skyMap.edgeNodes[index * 2 + 1] * 3
    starts.set(
      skyMap.directions.subarray(startNode, startNode + 3),
      index * 3,
    )
    ends.set(skyMap.directions.subarray(endNode, endNode + 3), index * 3)
  }

  const edgeGeometry = new three.InstancedBufferGeometry()
  edgeGeometry.setAttribute(
    'position',
    new three.Float32BufferAttribute(ribbon, 3),
  )
  edgeGeometry.setIndex(ribbonIndices)
  edgeGeometry.setAttribute(
    'aStart',
    new three.InstancedBufferAttribute(starts, 3),
  )
  edgeGeometry.setAttribute(
    'aEnd',
    new three.InstancedBufferAttribute(ends, 3),
  )
  edgeGeometry.setAttribute(
    'aDistanceStart',
    new three.InstancedBufferAttribute(new Float32Array(edgeCount), 1),
  )
  edgeGeometry.setAttribute(
    'aDistanceEnd',
    new three.InstancedBufferAttribute(new Float32Array(edgeCount), 1),
  )
  edgeGeometry.setAttribute(
    'aTargetDistanceStart',
    new three.InstancedBufferAttribute(new Float32Array(edgeCount), 1),
  )
  edgeGeometry.setAttribute(
    'aTargetDistanceEnd',
    new three.InstancedBufferAttribute(new Float32Array(edgeCount), 1),
  )
  edgeGeometry.setAttribute(
    'aWeight',
    new three.InstancedBufferAttribute(skyMap.edgeWeights, 1),
  )
  edgeGeometry.setAttribute(
    'aConstellation',
    new three.InstancedBufferAttribute(skyMap.edgeGroups, 1),
  )
  edgeGeometry.instanceCount = edgeCount

  const routeGeometry = new three.BufferGeometry()
  routeGeometry.setAttribute(
    'position',
    new three.Float32BufferAttribute(routeRibbon, 3),
  )
  routeGeometry.setIndex(routeIndices)

  const trailGeometry = new three.InstancedBufferGeometry()
  trailGeometry.setAttribute(
    'position',
    new three.Float32BufferAttribute(
      [0, -1, 0, 0, 1, 0, 1, -1, 0, 1, 1, 0],
      3,
    ),
  )
  trailGeometry.setIndex([0, 1, 2, 2, 1, 3])
  trailGeometry.setAttribute(
    'aDirection',
    new three.InstancedBufferAttribute(
      new Float32Array(trailDirections),
      3,
    ),
  )
  trailGeometry.setAttribute(
    'aStrength',
    new three.InstancedBufferAttribute(new Float32Array(trailStrengths), 1),
  )
  trailGeometry.setAttribute(
    'aWidthFactor',
    new three.InstancedBufferAttribute(
      new Float32Array(trailWidthFactors),
      1,
    ),
  )
  trailGeometry.instanceCount = trailStrengths.length

  const backgroundGeometry = new three.BufferGeometry()
  backgroundGeometry.setAttribute(
    'position',
    new three.Float32BufferAttribute(
      [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1],
      2,
    ),
  )

  const starGeometry = new three.BufferGeometry()
  starGeometry.setAttribute(
    'position',
    new three.BufferAttribute(skyMap.directions, 3),
  )
  starGeometry.setAttribute(
    'aBrightness',
    new three.BufferAttribute(starBrightnesses, 1),
  )
  starGeometry.setAttribute(
    'aDistance',
    new three.BufferAttribute(
      new Float32Array(skyMap.magnitudes.length),
      1,
    ),
  )
  starGeometry.setAttribute(
    'aTargetDistance',
    new three.BufferAttribute(
      new Float32Array(skyMap.magnitudes.length),
      1,
    ),
  )
  starGeometry.setAttribute(
    'aLocator',
    new three.BufferAttribute(
      new Float32Array(skyMap.magnitudes.length),
      1,
    ),
  )
  starGeometry.setAttribute(
    'aConstellation',
    new three.BufferAttribute(skyMap.nodeGroups, 1),
  )

  const backgroundMesh = new three.Mesh(
    backgroundGeometry,
    backgroundMaterial,
  )
  backgroundMesh.frustumCulled = false
  backgroundMesh.renderOrder = -1
  const edgeMesh = new three.Mesh(edgeGeometry, edgeMaterial)
  edgeMesh.frustumCulled = false
  const routeMesh = new three.Mesh(routeGeometry, routeMaterial)
  routeMesh.frustumCulled = false
  routeMesh.renderOrder = 0.75
  const trailMesh = new three.Mesh(trailGeometry, trailMaterial)
  trailMesh.frustumCulled = false
  trailMesh.renderOrder = 0.25
  const starPoints = new three.Points(starGeometry, starMaterial)
  starPoints.frustumCulled = false
  starPoints.renderOrder = 1
  scene.add(backgroundMesh, edgeMesh, routeMesh, trailMesh, starPoints)

  let requestedActive = false
  let active = false
  let disposed = false
  let frame = 0
  let idleTimer = 0
  let pulseRunning = false
  let previousRenderTime = 0
  let signalPhase: 'locating' | 'collapsing' | 'spreading' = 'locating'
  let phaseStartedAt = 0
  let sourceActivationAtSpread = 0
  let sourceIndex = -1
  let targetIndex = -1
  let previousRouteSourceIndex = -1
  let signalColorIndex = -1
  let darkMode = initialDark
  let signalStartedAt = performance.now()
  let currentConstellationsHeld = false
  let targetDistance = Math.PI / 2
  let signalTravelDistance = Math.PI / 2
  let signalFadeStartDistance = Math.PI / 2
  let signalDuration = signalTravelDistance / SIGNAL_SPEED
  let cameraDuration = 5000
  let cameraStartDelay = CAMERA_MIN_ROUTE_LEAD
  let routeWideViewRadius = BASE_VIEW_RADIUS + CAMERA_MIN_WIDENING
  let foregroundContractStart = FOREGROUND_CONTRACT_DELAY
  let foregroundContractEnd = FOREGROUND_CONTRACT_DELAY
  let foregroundReturnStart = 0
  let foregroundReturnEnd = 0
  let foregroundContractStarted = false
  let foregroundReturnStarted = false
  let trailReleaseStart = 0
  let trailReleaseDuration = 1
  let lastCameraProgress = -1
  let spreading = false
  let lastViewStatusAt = -Infinity
  let lastViewStatusKey = ''
  const minimumFrameDuration = 1000 / 60
  const reducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  )
  const baseRight = uniforms.uRight.value.clone().normalize()
  const baseUp = uniforms.uUp.value.clone().normalize()
  const baseForward = uniforms.uForward.value.clone().normalize()
  const viewOrientation = new three.Quaternion()
  const trailOrientation = new three.Quaternion()
  const routeStartOrientation = new three.Quaternion()
  const routeEndOrientation = new three.Quaternion()
  const routeOrientationDelta = new three.Quaternion()
  const routeViewStartForward = new three.Vector3()
  const routeViewEndForward = new three.Vector3()
  const routeTargetDirection = new three.Vector3()
  const scoredSourceDirection = new three.Vector3()
  const scoredTargetDirection = new three.Vector3()
  const scoredFinalForward = new three.Vector3()
  const scoredPreviousSourceDirection = new three.Vector3()
  const scoredBacktrackTangent = new three.Vector3()
  const scoredOutgoingTangent = new three.Vector3()
  const recentConstellationGroups: number[] = []
  let viewRadius = BASE_VIEW_RADIUS
  let trailViewRadius = BASE_VIEW_RADIUS

  function angularDistanceFromNode(
    sourceOffset: number,
    nodeIndex: number,
  ) {
    const nodeOffset = nodeIndex * 3
    const cosine =
      skyMap.directions[sourceOffset] * skyMap.directions[nodeOffset] +
      skyMap.directions[sourceOffset + 1] *
        skyMap.directions[nodeOffset + 1] +
      skyMap.directions[sourceOffset + 2] *
        skyMap.directions[nodeOffset + 2]
    return Math.acos(Math.max(-1, Math.min(1, cosine)))
  }

  function angularDistanceBetweenNodes(
    firstIndex: number,
    secondIndex: number,
  ) {
    const firstOffset = firstIndex * 3
    const secondOffset = secondIndex * 3
    const cosine =
      skyMap.directions[firstOffset] * skyMap.directions[secondOffset] +
      skyMap.directions[firstOffset + 1] *
        skyMap.directions[secondOffset + 1] +
      skyMap.directions[firstOffset + 2] *
        skyMap.directions[secondOffset + 2]
    return Math.acos(Math.max(-1, Math.min(1, cosine)))
  }

  function angularDistanceBetweenDirections(
    first: Vector3,
    second: Vector3,
  ) {
    return Math.acos(Math.max(-1, Math.min(1, first.dot(second))))
  }

  function setNodeDirection(nodeIndex: number, target: Vector3) {
    const nodeOffset = nodeIndex * 3
    target.set(
      skyMap.directions[nodeOffset],
      skyMap.directions[nodeOffset + 1],
      skyMap.directions[nodeOffset + 2],
    )
    return target.normalize()
  }

  function projectNode(nodeIndex: number) {
    const nodeOffset = nodeIndex * 3
    const right =
      skyMap.directions[nodeOffset] * uniforms.uRight.value.x +
      skyMap.directions[nodeOffset + 1] * uniforms.uRight.value.y +
      skyMap.directions[nodeOffset + 2] * uniforms.uRight.value.z
    const up =
      skyMap.directions[nodeOffset] * uniforms.uUp.value.x +
      skyMap.directions[nodeOffset + 1] * uniforms.uUp.value.y +
      skyMap.directions[nodeOffset + 2] * uniforms.uUp.value.z
    const forward =
      skyMap.directions[nodeOffset] * uniforms.uForward.value.x +
      skyMap.directions[nodeOffset + 1] * uniforms.uForward.value.y +
      skyMap.directions[nodeOffset + 2] * uniforms.uForward.value.z
    const denominator = Math.max(0.08, 1 + forward)
    const horizontal =
      (((2 * right) / denominator) * uniforms.uMapScale.value) /
      uniforms.uAspect.value
    const vertical = ((2 * up) / denominator) * uniforms.uMapScale.value
    return {
      depth: (forward + 1) * 0.5,
      radius: Math.hypot(horizontal * uniforms.uAspect.value, vertical),
      viewDistance: Math.acos(Math.max(-1, Math.min(1, forward))),
      x: 0.5 - horizontal,
      y: 0.5 - vertical,
    }
  }

  function sectorGap(first: number, second: number) {
    const difference = Math.abs(first - second)
    return Math.min(difference, 8 - difference)
  }

  function routeCandidateFor(
    nodeIndex: number,
  ): RouteCandidate | undefined {
    if (skyMap.magnitudes[nodeIndex] > ROUTE_CANDIDATE_MAGNITUDE) return
    if (skyMap.nodeGroups[nodeIndex] < 0) return
    const projected = projectNode(nodeIndex)
    if (projected.depth < 0.12 || projected.radius < ROUTE_CENTER_RADIUS) {
      return
    }
    const angle = Math.atan2(
      projected.y - 0.5,
      (projected.x - 0.5) * uniforms.uAspect.value,
    )
    const sector = Math.floor((((angle + TAU) % TAU) / TAU) * 8)
    return {
      index: nodeIndex,
      radius: projected.radius,
      sector,
      viewDistance: projected.viewDistance,
    }
  }

  function collectRouteCandidates() {
    const candidates: RouteCandidate[] = []
    for (let index = 0; index < skyMap.magnitudes.length; index += 1) {
      const candidate = routeCandidateFor(index)
      if (candidate) candidates.push(candidate)
    }
    return candidates
  }

  function chooseRoute() {
    const candidates = collectRouteCandidates()
    if (candidates.length === 0) {
      return [SKY_SOURCE_NODES[0], SKY_SOURCE_NODES[1]] as const
    }

    const visibleSources = candidates.filter(
      (candidate) => candidate.radius <= ROUTE_SOURCE_MAX_RADIUS,
    )
    const sourcePool =
      visibleSources.length > 0 ? visibleSources : candidates
    let source = targetIndex
    const carriedConstellation =
      source >= 0 ? skyMap.nodeGroups[source] : -1
    const carriedSources = sourcePool.filter(
      (candidate) =>
        skyMap.nodeGroups[candidate.index] === carriedConstellation &&
        candidate.index !== source,
    )
    const carriedPool =
      carriedSources.length > 0
        ? carriedSources
        : sourcePool.filter(
            (candidate) =>
              skyMap.nodeGroups[candidate.index] === carriedConstellation,
          )
    let sourceCandidate =
      carriedPool[Math.floor(Math.random() * carriedPool.length)] ??
      (source >= 0 ? routeCandidateFor(source) : undefined)
    if (sourceCandidate) source = sourceCandidate.index
    if (
      !sourceCandidate ||
      sourceCandidate.radius > ROUTE_SOURCE_MAX_RADIUS
    ) {
      sourceCandidate =
        sourcePool[Math.floor(Math.random() * sourcePool.length)]
      source = sourceCandidate.index
    }

    setNodeDirection(source, scoredSourceDirection)
    const sourceGroup = skyMap.nodeGroups[source]
    const previousSourceGroup =
      previousRouteSourceIndex >= 0
        ? skyMap.nodeGroups[previousRouteSourceIndex]
        : -1
    const hasIncomingDirection =
      previousRouteSourceIndex >= 0 && previousRouteSourceIndex !== source
    if (hasIncomingDirection) {
      setNodeDirection(
        previousRouteSourceIndex,
        scoredPreviousSourceDirection,
      )
      scoredBacktrackTangent
        .copy(scoredPreviousSourceDirection)
        .addScaledVector(
          scoredSourceDirection,
          -scoredPreviousSourceDirection.dot(scoredSourceDirection),
        )
        .normalize()
    }
    const measuredCandidates = candidates.flatMap((candidate) => {
      if (candidate.index === source) return []
      const targetGroup = skyMap.nodeGroups[candidate.index]
      if (targetGroup === sourceGroup) return []
      const distance = angularDistanceBetweenNodes(source, candidate.index)
      const cameraRotation = Math.max(
        0,
        candidate.viewDistance - ROUTE_TARGET_VISIBLE_OFFSET,
      )
      if (
        cameraRotation < ROUTE_MIN_CAMERA_ROTATION ||
        cameraRotation > ROUTE_MAX_CAMERA_ROTATION
      ) {
        return []
      }
      setNodeDirection(candidate.index, scoredTargetDirection)
      scoredOutgoingTangent
        .copy(scoredTargetDirection)
        .addScaledVector(
          scoredSourceDirection,
          -scoredTargetDirection.dot(scoredSourceDirection),
        )
        .normalize()
      const backtrackDot = hasIncomingDirection
        ? scoredOutgoingTangent.dot(scoredBacktrackTangent)
        : -1
      interpolateDirection(
        uniforms.uForward.value,
        scoredTargetDirection,
        cameraRotation / candidate.viewDistance,
        scoredFinalForward,
      )
      return [
        {
          cameraRotation,
          backtrackDot,
          candidate,
          distance,
          finalSourceDistance: angularDistanceBetweenDirections(
            scoredSourceDirection,
            scoredFinalForward,
          ),
          targetGroup,
        },
      ]
    })
    const scoredCandidates = measuredCandidates.flatMap((metrics) => {
      const {
        backtrackDot,
        cameraRotation,
        candidate,
        distance,
        finalSourceDistance,
        targetGroup,
      } = metrics
      if (
        distance < ROUTE_MIN_DISTANCE ||
        distance > ROUTE_MAX_DISTANCE ||
        finalSourceDistance < ROUTE_FINAL_SOURCE_MIN_DISTANCE
      ) {
        return []
      }
      const distanceScore =
        (distance - ROUTE_MIN_DISTANCE) /
        (ROUTE_MAX_DISTANCE - ROUTE_MIN_DISTANCE)
      const rotationScore = Math.max(
        0,
        1 -
          Math.abs(cameraRotation - ROUTE_PREFERRED_CAMERA_ROTATION) /
            ROUTE_PREFERRED_CAMERA_ROTATION,
      )
      const directionScore =
        sectorGap(sourceCandidate.sector, candidate.sector) / 4
      const continuationScore = (1 - backtrackDot) * 0.5
      const sourceExitScore = Math.min(
        1,
        (finalSourceDistance - ROUTE_FINAL_SOURCE_MIN_DISTANCE) /
          (ROUTE_MAX_DISTANCE - ROUTE_FINAL_SOURCE_MIN_DISTANCE),
      )
      const outboundScore = Math.min(
        1,
        Math.max(
          0,
          (candidate.radius - ROUTE_SOURCE_MAX_RADIUS) /
            (ROUTE_OUTBOUND_RADIUS - ROUTE_SOURCE_MAX_RADIUS),
        ),
      )
      return [
        {
          backtrackDot,
          candidate,
          score:
            distanceScore * 2 +
            rotationScore * 0.7 +
            sourceExitScore * 0.55 +
            directionScore * 0.35 +
            continuationScore * 0.6 +
            outboundScore * 0.1,
          targetGroup,
        },
      ]
    })
    const nonReversingCandidates = scoredCandidates.filter(
      ({ backtrackDot, targetGroup }) =>
        backtrackDot <= ROUTE_MAX_BACKTRACK_DOT &&
        targetGroup !== previousSourceGroup,
    )
    const freshCandidates = nonReversingCandidates.filter(
      ({ targetGroup }) => !recentConstellationGroups.includes(targetGroup),
    )
    const diverseCandidates =
      freshCandidates.length > 0
        ? freshCandidates
        : nonReversingCandidates.length > 0
          ? nonReversingCandidates
          : scoredCandidates
    const directionallySeparated = diverseCandidates.filter(
      ({ candidate }) =>
        sectorGap(sourceCandidate.sector, candidate.sector) >=
        ROUTE_MIN_SECTOR_GAP,
    )
    const routePool =
      directionallySeparated.length > 0
        ? directionallySeparated
        : diverseCandidates
    routePool.sort((first, second) => second.score - first.score)
    const finalists = routePool.slice(0, ROUTE_SCORE_POOL_SIZE)
    const [fallback] = measuredCandidates
      .filter(
        ({ distance, finalSourceDistance }) =>
          distance >= ROUTE_MIN_DISTANCE &&
          finalSourceDistance >= ROUTE_FINAL_SOURCE_MIN_DISTANCE,
      )
      .sort((first, second) => second.distance - first.distance)
    const target =
      finalists[Math.floor(Math.random() * finalists.length)]?.candidate ??
      fallback?.candidate ??
      sourceCandidate

    return [source, target.index] as const
  }

  function cameraRotationForTarget(viewDistance: number) {
    return Math.min(
      ROUTE_MAX_CAMERA_ROTATION,
      Math.max(0, viewDistance - ROUTE_TARGET_VISIBLE_OFFSET),
    )
  }

  function interpolateDirection(
    first: Vector3,
    second: Vector3,
    progress: number,
    target: Vector3,
  ) {
    const clampedProgress = Math.min(1, Math.max(0, progress))
    const angle = angularDistanceBetweenDirections(first, second)
    if (angle < 0.0001) return target.copy(first)
    const denominator = Math.sin(angle)
    if (Math.abs(denominator) < 0.0001) {
      return target.copy(first).lerp(second, clampedProgress).normalize()
    }
    return target
      .copy(first)
      .multiplyScalar(Math.sin((1 - clampedProgress) * angle) / denominator)
      .addScaledVector(
        second,
        Math.sin(clampedProgress * angle) / denominator,
      )
      .normalize()
  }

  function setBasisFromOrientation(
    orientation: Quaternion,
    right: Vector3,
    up: Vector3,
    forward: Vector3,
  ) {
    right.copy(baseRight).applyQuaternion(orientation)
    up.copy(baseUp).applyQuaternion(orientation)
    forward.copy(baseForward).applyQuaternion(orientation)
  }

  function applyViewState() {
    setBasisFromOrientation(
      viewOrientation,
      uniforms.uRight.value,
      uniforms.uUp.value,
      uniforms.uForward.value,
    )
    uniforms.uMapScale.value = mapScaleForViewRadius(viewRadius)
  }

  function applyTrailState() {
    setBasisFromOrientation(
      trailOrientation,
      uniforms.uTrailRight.value,
      uniforms.uTrailUp.value,
      uniforms.uTrailForward.value,
    )
    uniforms.uTrailMapScale.value = mapScaleForViewRadius(trailViewRadius)
  }

  function syncTrailView() {
    trailOrientation.copy(viewOrientation)
    trailViewRadius = viewRadius
    applyTrailState()
    uniforms.uTrailOpacity.value = 0
  }

  function updateTrailView(
    deltaMilliseconds: number,
    releaseOpacity: number,
    cameraProgress: number,
  ) {
    if (cameraProgress <= 0) {
      uniforms.uTrailOpacity.value = 0
      return
    }
    if (releaseOpacity <= 0) {
      if (uniforms.uTrailOpacity.value > 0) syncTrailView()
      return
    }
    const response =
      1 - Math.exp((-TRAIL_RESPONSE * deltaMilliseconds) / 1000)
    trailOrientation.slerp(viewOrientation, response)
    trailViewRadius += (viewRadius - trailViewRadius) * response
    applyTrailState()
    const angularLag = trailOrientation.angleTo(viewOrientation)
    const radiusLag = Math.abs(viewRadius - trailViewRadius)
    uniforms.uTrailOpacity.value =
      Math.min(1, Math.max(0, (angularLag + radiusLag * 0.7) / 0.008)) *
      releaseOpacity
  }

  function updateRouteView(progress: number) {
    if (progress === lastCameraProgress) return
    lastCameraProgress = progress
    const settledProgress = cameraMotionProgress(progress)
    viewOrientation
      .copy(routeStartOrientation)
      .slerp(routeEndOrientation, settledProgress)
    const widened = zoomEnvelope(progress)
    viewRadius =
      BASE_VIEW_RADIUS + (routeWideViewRadius - BASE_VIEW_RADIUS) * widened
    applyViewState()
  }

  function configureRouteTiming(cameraRotation: number) {
    const nominalCameraDuration = cameraRotation / CAMERA_ANGULAR_SPEED
    const rotationRange =
      ROUTE_MAX_CAMERA_ROTATION - ROUTE_MIN_CAMERA_ROTATION
    const rotationRatio = Math.min(
      1,
      Math.max(
        0,
        (cameraRotation - ROUTE_MIN_CAMERA_ROTATION) / rotationRange,
      ),
    )
    routeWideViewRadius =
      BASE_VIEW_RADIUS +
      CAMERA_MIN_WIDENING +
      (CAMERA_MAX_WIDENING - CAMERA_MIN_WIDENING) * rotationRatio
    const targetArrivalProgress = inverseImpulseProgress(
      targetDistance / signalTravelDistance,
      ROUTE_VELOCITY_APEX,
      ROUTE_TERMINAL_VELOCITY,
    )
    signalDuration = signalTravelDistance / SIGNAL_SPEED
    let targetArrivalTime = targetArrivalProgress * signalDuration
    const minimumTargetArrival =
      CAMERA_MIN_ROUTE_LEAD + nominalCameraDuration - CAMERA_CAPTURE_LAG
    if (targetArrivalTime < minimumTargetArrival) {
      signalDuration *= minimumTargetArrival / targetArrivalTime
      targetArrivalTime = minimumTargetArrival
    }
    const nominalCameraStart =
      targetArrivalTime + CAMERA_CAPTURE_LAG - nominalCameraDuration
    cameraStartDelay = Math.min(
      CAMERA_MAX_ROUTE_LEAD,
      Math.max(CAMERA_MIN_ROUTE_LEAD, nominalCameraStart),
    )
    cameraDuration =
      targetArrivalTime + CAMERA_CAPTURE_LAG - cameraStartDelay

    const cameraApexTime =
      cameraStartDelay + cameraDuration * CAMERA_VELOCITY_APEX
    foregroundContractStart = FOREGROUND_CONTRACT_DELAY
    const desiredContractDuration =
      cameraApexTime -
      foregroundContractStart -
      FOREGROUND_CONTRACT_APEX_LEAD
    const contractDuration = Math.min(
      FOREGROUND_CONTRACT_MAX_DURATION,
      Math.max(FOREGROUND_CONTRACT_MIN_DURATION, desiredContractDuration),
    )
    foregroundContractEnd = foregroundContractStart + contractDuration
    foregroundReturnStart = cameraApexTime + FOREGROUND_RETURN_LAG
    foregroundReturnEnd =
      cameraStartDelay + cameraDuration + FOREGROUND_SETTLE_LAG
    trailReleaseStart =
      cameraStartDelay + cameraDuration * TRAIL_RELEASE_PROGRESS
    trailReleaseDuration = Math.max(
      1,
      cameraStartDelay +
        cameraDuration -
        TRAIL_CAPTURE_LEAD -
        trailReleaseStart,
    )
  }

  function setRoute(source: number, target: number) {
    lastCameraProgress = -1
    const starDistance = starGeometry.getAttribute(
      'aDistance',
    ) as BufferAttribute
    const starTargetDistance = starGeometry.getAttribute(
      'aTargetDistance',
    ) as BufferAttribute
    const edgeStartDistance = edgeGeometry.getAttribute(
      'aDistanceStart',
    ) as InstancedBufferAttribute
    const edgeEndDistance = edgeGeometry.getAttribute(
      'aDistanceEnd',
    ) as InstancedBufferAttribute
    const edgeTargetStartDistance = edgeGeometry.getAttribute(
      'aTargetDistanceStart',
    ) as InstancedBufferAttribute
    const edgeTargetEndDistance = edgeGeometry.getAttribute(
      'aTargetDistanceEnd',
    ) as InstancedBufferAttribute
    const locator = starGeometry.getAttribute('aLocator') as BufferAttribute
    const previousSource = sourceIndex
    sourceIndex = source
    targetIndex = target
    uniforms.uSourceConstellation.value = skyMap.nodeGroups[sourceIndex]
    uniforms.uTargetConstellation.value = skyMap.nodeGroups[targetIndex]
    setNodeDirection(sourceIndex, uniforms.uRouteStart.value)
    setNodeDirection(targetIndex, uniforms.uRouteEnd.value)
    uniforms.uRouteBend.value.crossVectors(
      uniforms.uRouteStart.value,
      uniforms.uRouteEnd.value,
    )
    if (uniforms.uRouteBend.value.lengthSq() < 0.0001) {
      uniforms.uRouteBend.value.copy(uniforms.uUp.value)
    } else {
      uniforms.uRouteBend.value.normalize()
      if (uniforms.uRouteBend.value.dot(uniforms.uUp.value) < 0) {
        uniforms.uRouteBend.value.multiplyScalar(-1)
      }
    }

    if (previousSource !== sourceIndex) {
      if (previousSource >= 0) locator.setX(previousSource, 0)
      locator.setX(sourceIndex, 1)
      locator.needsUpdate = true
    }

    const sourceOffset = sourceIndex * 3
    const targetNodeOffset = targetIndex * 3
    const sourceConstellation = skyMap.nodeGroups[sourceIndex]
    const targetConstellation = skyMap.nodeGroups[targetIndex]
    let constellationRevealDistance = 0
    let targetConstellationRadius = 0
    for (let index = 0; index < skyMap.magnitudes.length; index += 1) {
      const distance = angularDistanceFromNode(sourceOffset, index)
      const targetDistanceForNode = angularDistanceFromNode(
        targetNodeOffset,
        index,
      )
      nodeDistances[index] = distance
      starDistance.setX(index, distance)
      starTargetDistance.setX(index, targetDistanceForNode)
      if (
        skyMap.nodeGroups[index] === sourceConstellation ||
        skyMap.nodeGroups[index] === targetConstellation
      ) {
        constellationRevealDistance = Math.max(
          constellationRevealDistance,
          distance,
        )
      }
      if (skyMap.nodeGroups[index] === targetConstellation) {
        targetConstellationRadius = Math.max(
          targetConstellationRadius,
          targetDistanceForNode,
        )
      }
    }
    for (let index = 0; index < edgeCount; index += 1) {
      edgeStartDistance.setX(
        index,
        nodeDistances[skyMap.edgeNodes[index * 2]],
      )
      edgeEndDistance.setX(
        index,
        nodeDistances[skyMap.edgeNodes[index * 2 + 1]],
      )
      edgeTargetStartDistance.setX(
        index,
        starTargetDistance.getX(skyMap.edgeNodes[index * 2]),
      )
      edgeTargetEndDistance.setX(
        index,
        starTargetDistance.getX(skyMap.edgeNodes[index * 2 + 1]),
      )
    }
    starDistance.needsUpdate = true
    starTargetDistance.needsUpdate = true
    edgeStartDistance.needsUpdate = true
    edgeEndDistance.needsUpdate = true
    edgeTargetStartDistance.needsUpdate = true
    edgeTargetEndDistance.needsUpdate = true
    targetDistance = nodeDistances[targetIndex]
    uniforms.uTargetDistance.value = targetDistance
    uniforms.uRouteLength.value = targetDistance
    signalFadeStartDistance = Math.max(
      targetDistance + SIGNAL_CONTINUATION_DISTANCE,
      constellationRevealDistance + SIGNAL_CONTINUATION_DISTANCE,
      targetDistance -
        DESTINATION_CONSTELLATION_LEAD +
        targetConstellationRadius +
        SIGNAL_CONTINUATION_DISTANCE,
    )
    signalTravelDistance = signalFadeStartDistance + SIGNAL_FADE_DISTANCE
    routeStartOrientation.copy(viewOrientation)
    routeViewStartForward.copy(uniforms.uForward.value)
    setNodeDirection(targetIndex, routeTargetDirection)
    const targetViewDistance = angularDistanceBetweenDirections(
      routeViewStartForward,
      routeTargetDirection,
    )
    const cameraRotation = cameraRotationForTarget(targetViewDistance)
    const targetViewProgress =
      targetViewDistance > 0.0001 ? cameraRotation / targetViewDistance : 0
    interpolateDirection(
      routeViewStartForward,
      routeTargetDirection,
      targetViewProgress,
      routeViewEndForward,
    )
    routeOrientationDelta.setFromUnitVectors(
      routeViewStartForward,
      routeViewEndForward,
    )
    routeEndOrientation
      .copy(routeStartOrientation)
      .premultiply(routeOrientationDelta)
      .normalize()
    configureRouteTiming(cameraRotation)
    previousRouteSourceIndex = sourceIndex
    const existingTargetGroup =
      recentConstellationGroups.indexOf(targetConstellation)
    if (existingTargetGroup >= 0) {
      recentConstellationGroups.splice(existingTargetGroup, 1)
    }
    recentConstellationGroups.unshift(targetConstellation)
    recentConstellationGroups.length = Math.min(
      recentConstellationGroups.length,
      ROUTE_HISTORY_LENGTH,
    )
  }

  function retirePreviousConstellation() {
    const sourceGroup = skyMap.nodeGroups[sourceIndex]
    const targetGroup = skyMap.nodeGroups[targetIndex]
    const heldSourceGroup = uniforms.uHeldSourceConstellation.value
    const heldTargetGroup = uniforms.uHeldTargetConstellation.value
    const retiringGroup =
      [heldSourceGroup, heldTargetGroup].find(
        (group) =>
          group >= 0 && group !== sourceGroup && group !== targetGroup,
      ) ?? -1
    uniforms.uRetiringConstellation.value = retiringGroup
    uniforms.uRetireProgress.value = retiringGroup < 0 ? 1 : 0
  }

  function holdCurrentConstellations() {
    uniforms.uHeldSourceConstellation.value =
      uniforms.uSourceConstellation.value
    uniforms.uHeldTargetConstellation.value =
      uniforms.uTargetConstellation.value
  }

  const publishViewStatus = () => {
    if (!callbacks.onViewChange) return
    const now = performance.now()
    if (now - lastViewStatusAt < VIEW_STATUS_INTERVAL) return

    const forward = uniforms.uForward.value
    const rightAscension =
      ((Math.atan2(forward.z, forward.x) * 180) / Math.PI + 360) % 360
    const declination = (Math.asin(forward.y) * 180) / Math.PI
    const scale = uniforms.uMapScale.value
    const statusKey = `${rightAscension.toFixed(2)}:${declination.toFixed(2)}:${scale.toFixed(3)}`
    if (statusKey === lastViewStatusKey) return

    lastViewStatusAt = now
    lastViewStatusKey = statusKey
    callbacks.onViewChange({ declination, rightAscension, scale })
  }
  const render = () => {
    routeMesh.visible = uniforms.uPulseActive.value > 0.001
    trailMesh.visible = uniforms.uTrailOpacity.value > 0.001
    publishViewStatus()
    renderer.render(scene, camera)
  }
  const updateSignalColor = (selectNewColor = false) => {
    const palette = darkMode ? SIGNAL_PALETTES.dark : SIGNAL_PALETTES.light
    if (selectNewColor || signalColorIndex < 0) {
      let next = Math.floor(Math.random() * palette.length)
      if (next === signalColorIndex && palette.length > 1) {
        next = (next + 1) % palette.length
      }
      signalColorIndex = next
    }
    uniforms.uSignalInk.value.setHex(
      palette[signalColorIndex],
      three.SRGBColorSpace,
    )
  }
  const updateTheme = (dark: boolean) => {
    darkMode = dark
    uniforms.uInk.value.setHex(
      dark ? 0xe6e6e6 : 0x1b3851,
      three.SRGBColorSpace,
    )
    uniforms.uBaseAlpha.value = dark ? 0.18 : 0.26
    uniforms.uBackgroundAlpha.value = dark ? 2 : 0.24
    uniforms.uBackgroundInk.value.setHex(
      dark ? 0xe6e6e6 : 0x294c67,
      three.SRGBColorSpace,
    )
    uniforms.uSurveyMode.value = dark ? 0 : 1
    updateSignalColor()
  }
  const resize = () => {
    const bounds = target.getBoundingClientRect()
    const width = Math.max(1, bounds.width)
    const height = Math.max(1, bounds.height)
    const pixelRatio = choosePixelRatio(width, height)

    renderer.setPixelRatio(pixelRatio)
    renderer.setSize(width, height, false)
    uniforms.uResolution.value.set(width * pixelRatio, height * pixelRatio)
    uniforms.uPixelRatio.value = pixelRatio
    uniforms.uAspect.value = width / height
    uniforms.uHalfWidth.value = 1.32 * pixelRatio
    uniforms.uTrailMaxLength.value = TRAIL_MAX_LENGTH * pixelRatio
    if (sourceIndex < 0 || targetIndex < 0) {
      const [source, routeTarget] = chooseRoute()
      setRoute(source, routeTarget)
    }
    render()
  }
  const stopFrame = () => {
    if (frame) cancelAnimationFrame(frame)
    frame = 0
  }
  const stopTimer = () => {
    if (idleTimer) window.clearTimeout(idleTimer)
    idleTimer = 0
  }
  const endSpread = () => {
    if (!spreading) return
    spreading = false
    callbacks.onSpreadEnd?.()
  }
  const stop = () => {
    stopFrame()
    stopTimer()
    pulseRunning = false
    endSpread()
  }
  const enterIdle = () => {
    pulseRunning = false
    stopFrame()
    if (!currentConstellationsHeld) holdCurrentConstellations()
    currentConstellationsHeld = true
    uniforms.uRetiringConstellation.value = -1
    uniforms.uRetireProgress.value = 1
    uniforms.uPulseActive.value = 0
    uniforms.uSourceActivation.value = 0
    uniforms.uPulseDistance.value = 0
    uniforms.uRoutePulseDistance.value = 0
    uniforms.uLocatorProgress.value = 0
    uniforms.uLocatorScale.value = 1
    uniforms.uTrailOpacity.value = 0
    endSpread()
    if (targetIndex >= 0) {
      updateRouteView(1)
    }
    syncTrailView()
    render()
    if (active && !disposed) {
      idleTimer = window.setTimeout(beginPulse, 2600 + Math.random() * 3000)
    }
  }
  const animate = (now: number) => {
    if (!active || disposed || !pulseRunning) return
    if (
      previousRenderTime > 0 &&
      now - previousRenderTime < minimumFrameDuration * 0.9
    ) {
      frame = requestAnimationFrame(animate)
      return
    }

    const frameDelta =
      previousRenderTime > 0
        ? Math.min(50, now - previousRenderTime)
        : minimumFrameDuration
    previousRenderTime = now
    const phaseElapsed = now - phaseStartedAt
    if (signalPhase === 'locating') {
      const locatorProgress = criticallyDampedProgress(
        phaseElapsed / LOCATOR_DURATION,
      )
      uniforms.uLocatorProgress.value = locatorProgress
      uniforms.uLocatorScale.value =
        LOCATOR_INITIAL_SCALE +
        (1 - LOCATOR_INITIAL_SCALE) * locatorProgress
      render()
      if (phaseElapsed < LOCATOR_DURATION) {
        frame = requestAnimationFrame(animate)
        return
      }
      signalPhase = 'collapsing'
      phaseStartedAt = now
      uniforms.uLocatorProgress.value = 1
      uniforms.uLocatorScale.value = 1
      frame = requestAnimationFrame(animate)
      return
    }

    if (signalPhase === 'collapsing') {
      const collapseProgress = criticallyDampedProgress(
        phaseElapsed / LOCATOR_COLLAPSE_DURATION,
      )
      const locatorScale = 1 - collapseProgress
      uniforms.uLocatorProgress.value = 1
      uniforms.uLocatorScale.value = locatorScale
      uniforms.uSourceActivation.value = collapseProgress
      render()
      if (locatorScale > LOCATOR_DOT_SCALE) {
        frame = requestAnimationFrame(animate)
        return
      }
      signalPhase = 'spreading'
      phaseStartedAt = now
      signalStartedAt = now
      sourceActivationAtSpread = collapseProgress
      uniforms.uLocatorProgress.value = 0
      uniforms.uLocatorScale.value = 1
      uniforms.uPulseActive.value = 1
      spreading = true
      callbacks.onSpreadStart?.({ colorIndex: signalColorIndex })
      frame = requestAnimationFrame(animate)
      return
    }

    const pulseElapsed = now - signalStartedAt
    if (pulseElapsed >= signalDuration) {
      enterIdle()
      return
    }
    const timelineProgress = pulseElapsed / signalDuration
    const pulseDistance =
      signalTravelDistance * signalProgress(timelineProgress)
    const routePulseDistance =
      signalTravelDistance * routeProgress(timelineProgress)
    const sourceRelease = criticallyDampedProgress(
      pulseElapsed / SOURCE_RELEASE_DURATION,
    )
    const cameraProgress = Math.min(
      1,
      Math.max(0, (pulseElapsed - cameraStartDelay) / cameraDuration),
    )
    const trailOpacity = trailReleaseOpacity(
      (pulseElapsed - trailReleaseStart) / trailReleaseDuration,
    )
    const fadeProgress = criticallyDampedProgress(
      (pulseDistance - signalFadeStartDistance) / SIGNAL_FADE_DISTANCE,
    )
    uniforms.uRetireProgress.value = criticallyDampedProgress(
      pulseElapsed / CONSTELLATION_RETIRE_DURATION,
    )
    if (
      !currentConstellationsHeld &&
      pulseDistance >= signalFadeStartDistance
    ) {
      holdCurrentConstellations()
      currentConstellationsHeld = true
    }
    if (
      !foregroundContractStarted &&
      pulseElapsed >= foregroundContractStart
    ) {
      foregroundContractStarted = true
      callbacks.onForegroundContractStart?.({
        duration: Math.max(0, foregroundContractEnd - pulseElapsed),
      })
    }
    if (!foregroundReturnStarted && pulseElapsed >= foregroundReturnStart) {
      foregroundReturnStarted = true
      callbacks.onForegroundReturnStart?.({
        duration: Math.max(0, foregroundReturnEnd - pulseElapsed),
      })
    }
    updateRouteView(cameraProgress)
    updateTrailView(frameDelta, trailOpacity, cameraProgress)
    uniforms.uPulseDistance.value = pulseDistance
    uniforms.uRoutePulseDistance.value = routePulseDistance
    uniforms.uPulseActive.value = 1 - fadeProgress
    uniforms.uSourceActivation.value =
      sourceActivationAtSpread * (1 - sourceRelease)
    render()
    frame = requestAnimationFrame(animate)
  }
  function beginPulse() {
    if (!active || disposed) return
    stopTimer()
    pulseRunning = true
    const now = performance.now()
    previousRenderTime = 0
    signalPhase = 'locating'
    phaseStartedAt = now
    foregroundContractStarted = false
    foregroundReturnStarted = false
    sourceActivationAtSpread = 0
    currentConstellationsHeld = false
    uniforms.uPulseActive.value = 0
    uniforms.uSourceActivation.value = 0
    uniforms.uPulseDistance.value = 0
    uniforms.uRoutePulseDistance.value = 0
    uniforms.uLocatorProgress.value = 0
    uniforms.uLocatorScale.value = LOCATOR_INITIAL_SCALE
    syncTrailView()
    updateSignalColor(true)
    const [source, routeTarget] = chooseRoute()
    setRoute(source, routeTarget)
    retirePreviousConstellation()
    stopFrame()
    frame = requestAnimationFrame(animate)
  }
  const syncActivity = () => {
    const nextActive = requestedActive && !reducedMotion.matches
    if (active === nextActive) return
    stop()
    active = nextActive
    if (nextActive) {
      beginPulse()
      return
    }
    uniforms.uPulseActive.value = 0
    uniforms.uSourceActivation.value = 0
    uniforms.uPulseDistance.value = 0
    uniforms.uRoutePulseDistance.value = 0
    uniforms.uLocatorProgress.value = 0
    uniforms.uLocatorScale.value = 1
    viewRadius = BASE_VIEW_RADIUS
    applyViewState()
    syncTrailView()
    render()
  }
  const resizeObserver = new ResizeObserver(resize)
  const handleReducedMotion = () => {
    syncActivity()
  }

  updateTheme(initialDark)
  resizeObserver.observe(target)
  reducedMotion.addEventListener('change', handleReducedMotion)
  resize()

  return {
    setActive(nextActive) {
      requestedActive = nextActive
      syncActivity()
    },
    setTheme(nextDark) {
      if (darkMode === nextDark) return
      updateTheme(nextDark)
      render()
    },
    destroy() {
      disposed = true
      stop()
      resizeObserver.disconnect()
      reducedMotion.removeEventListener('change', handleReducedMotion)
      scene.remove(
        backgroundMesh,
        edgeMesh,
        routeMesh,
        trailMesh,
        starPoints,
      )
      backgroundGeometry.dispose()
      edgeGeometry.dispose()
      routeGeometry.dispose()
      starGeometry.dispose()
      trailGeometry.dispose()
      backgroundMaterial.dispose()
      edgeMaterial.dispose()
      routeMaterial.dispose()
      starMaterial.dispose()
      trailMaterial.dispose()
      backdropTexture.dispose()
      renderer.dispose()
    },
  }
}
