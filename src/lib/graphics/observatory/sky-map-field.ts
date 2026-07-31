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
} from './shaders'

type SkyData = typeof SkyDataModule
type FieldController = {
  destroy: () => void
  setActive: (active: boolean) => void
  setTheme: (dark: boolean) => void
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
}

const SIGNAL_PALETTES = {
  light: [0x765d56, 0x756c4f, 0x596f5d, 0x4f6f75, 0x596a87, 0x6b607b],
  dark: [0xc2a097, 0xbdb187, 0x9caf9b, 0x8fb2b5, 0x96a8c4, 0xab9db8],
} as const
const EDGE_WEIGHT_BY_CLASS = [1, 0.76, 0.56] as const
const PULSE_HEAD_WIDTH = 0.18
const LOCATOR_DURATION = 1100
const LOCATOR_COLLAPSE_DURATION = 520
const LOCATOR_INITIAL_SCALE = 2
const LOCATOR_DOT_SCALE = 0.08
const SIGNAL_SPEED = 0.52 / 1000
const SOURCE_RELEASE_DURATION = LOCATOR_COLLAPSE_DURATION
const CONSTELLATION_RETIRE_DURATION = 900
const DAMPING_STIFFNESS = 5.5
const BASE_MAP_SCALE = 0.48
const MAP_ZOOM_OUT_FACTOR = 0.31
const ROUTE_CANDIDATE_MAGNITUDE = 3.6
const ROUTE_CENTER_RADIUS = 0.22
const ROUTE_SOURCE_MAX_RADIUS = 0.44
const ROUTE_OUTBOUND_RADIUS = 0.54
const ROUTE_TARGET_VISIBLE_OFFSET = 0.72
const ROUTE_MIN_SECTOR_GAP = 3
const ROUTE_MIN_DISTANCE = 0.8
const ROUTE_MAX_DISTANCE = (150 * Math.PI) / 180
const ROUTE_TARGET_OFFSET = 0.9
const ROUTE_MAX_FOLLOW = 0.44
const ROUTE_RIBBON_SEGMENTS = 48
const SIGNAL_CONTINUATION_DISTANCE = 0.16
const SIGNAL_FADE_DISTANCE = 0.26
const DESTINATION_CONSTELLATION_LEAD = 0.42
const TAU = Math.PI * 2
const BACKDROP_SIZE = 256
const BACKDROP_CELL_SIZE = 1
const BACKDROP_CELL_COUNT = BACKDROP_SIZE / BACKDROP_CELL_SIZE
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
  const nativeRatio = Math.min(window.devicePixelRatio || 1, 2)
  const pixelBudget = 3_200_000
  const budgetRatio = Math.sqrt(pixelBudget / Math.max(1, width * height))
  return Math.max(1, Math.min(nativeRatio, budgetRatio))
}

function criticallyDampedProgress(value: number) {
  const progress = Math.min(1, Math.max(0, value))
  const response =
    1 -
    (1 + DAMPING_STIFFNESS * progress) *
      Math.exp(-DAMPING_STIFFNESS * progress)
  const settledResponse =
    1 - (1 + DAMPING_STIFFNESS) * Math.exp(-DAMPING_STIFFNESS)
  return Math.min(1, response / settledResponse)
}

export function createSkyMapField(
  target: HTMLCanvasElement,
  skyData: SkyData,
  initialDark = false,
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
  const backdropTexture = createBackdropTexture()
  const nodeDistances = new Float32Array(skyMap.magnitudes.length)
  const scene = new three.Scene()
  const camera = new three.Camera()
  const uniforms = {
    uResolution: { value: new three.Vector2(1, 1) },
    uPixelRatio: { value: 1 },
    uAspect: { value: 1 },
    uMapScale: { value: BASE_MAP_SCALE },
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
    'aMagnitude',
    new three.BufferAttribute(skyMap.magnitudes, 1),
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
  routeMesh.renderOrder = 0.5
  const starPoints = new three.Points(starGeometry, starMaterial)
  starPoints.frustumCulled = false
  starPoints.renderOrder = 1
  scene.add(backgroundMesh, edgeMesh, routeMesh, starPoints)

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
  let signalColorIndex = -1
  let darkMode = initialDark
  let signalStartedAt = performance.now()
  let currentConstellationsHeld = false
  let targetDistance = Math.PI / 2
  let signalTravelDistance = Math.PI / 2
  let signalFadeStartDistance = Math.PI / 2
  const minimumFrameDuration = 1000 / 60
  const reducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  )
  const worldUp = new three.Vector3(0, 1, 0)
  const settledForward = uniforms.uForward.value.clone()
  const routeStartForward = new three.Vector3()
  const routeEndForward = new three.Vector3()
  const routeForward = new three.Vector3()
  const routeTargetDirection = new three.Vector3()

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
    return { index: nodeIndex, radius: projected.radius, sector }
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

    const boundedCandidates = candidates.filter((candidate) => {
      if (candidate.index === source) return false
      const distance = angularDistanceBetweenNodes(source, candidate.index)
      return (
        distance >= ROUTE_MIN_DISTANCE && distance <= ROUTE_MAX_DISTANCE
      )
    })
    const eligible = boundedCandidates.filter(
      (candidate) =>
        sectorGap(sourceCandidate.sector, candidate.sector) >=
        ROUTE_MIN_SECTOR_GAP,
    )
    const distantCandidates =
      eligible.length > 0 ? eligible : boundedCandidates
    const outboundCandidates = distantCandidates.filter(
      (candidate) => candidate.radius >= ROUTE_OUTBOUND_RADIUS,
    )
    const pool =
      outboundCandidates.length > 0 ? outboundCandidates : distantCandidates
    const target =
      pool[Math.floor(Math.random() * pool.length)] ??
      boundedCandidates.find((candidate) => candidate.index !== source) ??
      sourceCandidate

    return [source, target.index] as const
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

  function setMapView(forward: Vector3, mapScale: number) {
    uniforms.uForward.value.copy(forward).normalize()
    uniforms.uRight.value.crossVectors(uniforms.uForward.value, worldUp)
    if (uniforms.uRight.value.lengthSq() < 0.0001) {
      uniforms.uRight.value.set(1, 0, 0)
    } else {
      uniforms.uRight.value.normalize()
    }
    uniforms.uUp.value
      .crossVectors(uniforms.uRight.value, uniforms.uForward.value)
      .normalize()
    uniforms.uMapScale.value = mapScale
  }

  function updateRouteView(progress: number) {
    interpolateDirection(
      routeStartForward,
      routeEndForward,
      progress,
      routeForward,
    )
    const zoomOut = Math.sin(Math.PI * progress) * MAP_ZOOM_OUT_FACTOR
    setMapView(routeForward, BASE_MAP_SCALE * (1 - zoomOut))
  }

  function setRoute(source: number, target: number) {
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
    routeStartForward.copy(settledForward)
    setNodeDirection(targetIndex, routeTargetDirection)
    const targetViewDistance = angularDistanceBetweenDirections(
      routeStartForward,
      routeTargetDirection,
    )
    const targetOffset = Math.min(
      ROUTE_TARGET_OFFSET,
      targetViewDistance * 0.65,
    )
    const visibleTargetOffset = Math.min(
      targetOffset,
      ROUTE_TARGET_VISIBLE_OFFSET,
    )
    const targetViewProgress =
      targetViewDistance > 0.0001
        ? Math.min(
            1,
            Math.max(
              Math.min(
                ROUTE_MAX_FOLLOW,
                1 - targetOffset / targetViewDistance,
              ),
              1 - visibleTargetOffset / targetViewDistance,
            ),
          )
        : 0
    interpolateDirection(
      routeStartForward,
      routeTargetDirection,
      targetViewProgress,
      routeEndForward,
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

  const render = () => {
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
    const lightness = dark ? 0.9 : 0.18
    uniforms.uInk.value.setRGB(
      lightness,
      lightness,
      lightness,
      three.SRGBColorSpace,
    )
    uniforms.uBaseAlpha.value = dark ? 0.18 : 0.2
    uniforms.uBackgroundAlpha.value = dark ? 2 : 1
    const backgroundLightness = dark ? 0.9 : 0.06
    uniforms.uBackgroundInk.value.setRGB(
      backgroundLightness,
      backgroundLightness,
      backgroundLightness,
      three.SRGBColorSpace,
    )
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
  const stop = () => {
    stopFrame()
    stopTimer()
    pulseRunning = false
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
    uniforms.uLocatorProgress.value = 0
    uniforms.uLocatorScale.value = 1
    if (targetIndex >= 0) {
      updateRouteView(1)
      settledForward.copy(routeEndForward)
    }
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
      frame = requestAnimationFrame(animate)
      return
    }

    const pulseDuration = signalTravelDistance / SIGNAL_SPEED
    const pulseElapsed = now - signalStartedAt
    if (pulseElapsed >= pulseDuration) {
      enterIdle()
      return
    }
    const pulseDistance =
      signalTravelDistance *
      criticallyDampedProgress(pulseElapsed / pulseDuration)
    const sourceRelease = criticallyDampedProgress(
      pulseElapsed / SOURCE_RELEASE_DURATION,
    )
    const mapProgress = Math.min(1, pulseDistance / targetDistance)
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
    updateRouteView(mapProgress)
    uniforms.uPulseDistance.value = pulseDistance
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
    sourceActivationAtSpread = 0
    currentConstellationsHeld = false
    uniforms.uPulseActive.value = 0
    uniforms.uSourceActivation.value = 0
    uniforms.uPulseDistance.value = 0
    uniforms.uLocatorProgress.value = 0
    uniforms.uLocatorScale.value = LOCATOR_INITIAL_SCALE
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
    uniforms.uLocatorProgress.value = 0
    uniforms.uLocatorScale.value = 1
    settledForward.copy(uniforms.uForward.value)
    uniforms.uMapScale.value = BASE_MAP_SCALE
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
      scene.remove(backgroundMesh, edgeMesh, routeMesh, starPoints)
      backgroundGeometry.dispose()
      edgeGeometry.dispose()
      routeGeometry.dispose()
      starGeometry.dispose()
      backgroundMaterial.dispose()
      edgeMaterial.dispose()
      routeMaterial.dispose()
      starMaterial.dispose()
      backdropTexture.dispose()
      renderer.dispose()
    },
  }
}
