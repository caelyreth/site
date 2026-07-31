/* oxlint-disable complexity, typescript/prefer-readonly-parameter-types -- WebGL setup and pulse state share one lifecycle. */
import type * as SkyDataModule from '$lib/data/sky-map-data.generated'
import type * as ThreeModule from 'three'

import {
  edgeFragmentShader,
  edgeVertexShader,
  starFragmentShader,
  starVertexShader,
} from './shaders'

type Three = typeof ThreeModule
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
  edgeWeights: Float32Array
}

const SIGNAL_PALETTES = {
  light: [0x765d56, 0x756c4f, 0x596f5d, 0x4f6f75, 0x596a87, 0x6b607b],
  dark: [0xc2a097, 0xbdb187, 0x9caf9b, 0x8fb2b5, 0x96a8c4, 0xab9db8],
} as const
const EDGE_WEIGHT_BY_CLASS = [1, 0.76, 0.56] as const
const PULSE_HEAD_WIDTH = 0.1

function decodeSkyMap(skyData: SkyData): SkyMap {
  const { SKY_EDGES, SKY_NODES, SKY_NODE_STRIDE } = skyData
  const nodeCount = SKY_NODES.length / SKY_NODE_STRIDE
  const edgeCount = SKY_EDGES.length / 3
  const directions = new Float32Array(nodeCount * 3)
  const magnitudes = new Float32Array(nodeCount)
  const edgeNodes = new Uint16Array(edgeCount * 2)
  const edgeWeights = new Float32Array(edgeCount)

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
  }

  return { directions, magnitudes, edgeNodes, edgeWeights }
}

function choosePixelRatio(width: number, height: number) {
  const nativeRatio = Math.min(window.devicePixelRatio || 1, 2)
  const pixelBudget = 3_200_000
  const budgetRatio = Math.sqrt(pixelBudget / Math.max(1, width * height))
  return Math.max(1, Math.min(nativeRatio, budgetRatio))
}

export function createSkyMapField(
  target: HTMLCanvasElement,
  three: Three,
  skyData: SkyData,
  initialDark = false,
): FieldController {
  let renderer: ThreeModule.WebGLRenderer
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

  const { SKY_SOURCE_NODES, SKY_VIEW_BASIS } = skyData
  const skyMap = decodeSkyMap(skyData)
  const nodeDistances = new Float32Array(skyMap.magnitudes.length)
  const scene = new three.Scene()
  const camera = new three.Camera()
  const uniforms = {
    uResolution: { value: new three.Vector2(1, 1) },
    uPixelRatio: { value: 1 },
    uAspect: { value: 1 },
    uMapScale: { value: 0.48 },
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
    uHeadWidth: { value: PULSE_HEAD_WIDTH },
    uTailWidth: { value: 0.31 },
    uSourceRadius: { value: 0.04 },
    uInk: { value: new three.Color(0xffffff) },
    uSignalInk: { value: new three.Color(0xffffff) },
    uBaseAlpha: { value: 0.2 },
  }
  const edgeMaterial = new three.ShaderMaterial({
    transparent: true,
    depthTest: false,
    depthWrite: false,
    toneMapped: false,
    uniforms,
    vertexShader: edgeVertexShader,
    fragmentShader: edgeFragmentShader,
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
    'aWeight',
    new three.InstancedBufferAttribute(skyMap.edgeWeights, 1),
  )
  edgeGeometry.instanceCount = edgeCount

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

  const edgeMesh = new three.Mesh(edgeGeometry, edgeMaterial)
  edgeMesh.frustumCulled = false
  const starPoints = new three.Points(starGeometry, starMaterial)
  starPoints.frustumCulled = false
  starPoints.renderOrder = 1
  scene.add(edgeMesh, starPoints)

  let requestedActive = false
  let active = false
  let disposed = false
  let frame = 0
  let idleTimer = 0
  let pulseRunning = false
  let previousRenderTime = 0
  let sourceIndex = -1
  let signalColorIndex = -1
  let darkMode = initialDark
  let signalStartedAt = performance.now()
  let maxSignalDistance = Math.PI / 2
  const signalSpeed = 0.72 / 1000
  const minimumFrameDuration = 1000 / 60
  const reducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  )

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

  function isNodeProjectedInside(nodeIndex: number) {
    const nodeOffset = nodeIndex * 3
    const right =
      skyMap.directions[nodeOffset] * SKY_VIEW_BASIS[0] +
      skyMap.directions[nodeOffset + 1] * SKY_VIEW_BASIS[1] +
      skyMap.directions[nodeOffset + 2] * SKY_VIEW_BASIS[2]
    const up =
      skyMap.directions[nodeOffset] * SKY_VIEW_BASIS[3] +
      skyMap.directions[nodeOffset + 1] * SKY_VIEW_BASIS[4] +
      skyMap.directions[nodeOffset + 2] * SKY_VIEW_BASIS[5]
    const forward =
      skyMap.directions[nodeOffset] * SKY_VIEW_BASIS[6] +
      skyMap.directions[nodeOffset + 1] * SKY_VIEW_BASIS[7] +
      skyMap.directions[nodeOffset + 2] * SKY_VIEW_BASIS[8]
    const denominator = Math.max(0.08, 1 + forward)
    const x =
      0.5 - (((2 * right) / denominator) * 0.48) / uniforms.uAspect.value
    const y = 0.5 - ((2 * up) / denominator) * 0.48
    return x >= 0 && x <= 1 && y >= 0 && y <= 1
  }

  function updateSource(now: number, selectNewSource = true) {
    const starDistance = starGeometry.getAttribute(
      'aDistance',
    ) as ThreeModule.BufferAttribute
    const edgeStartDistance = edgeGeometry.getAttribute(
      'aDistanceStart',
    ) as ThreeModule.InstancedBufferAttribute
    const edgeEndDistance = edgeGeometry.getAttribute(
      'aDistanceEnd',
    ) as ThreeModule.InstancedBufferAttribute

    if (selectNewSource || sourceIndex < 0) {
      let next =
        SKY_SOURCE_NODES[
          Math.floor(Math.random() * SKY_SOURCE_NODES.length)
        ]
      if (next === sourceIndex && SKY_SOURCE_NODES.length > 1) {
        const current = SKY_SOURCE_NODES.indexOf(next)
        next = SKY_SOURCE_NODES[(current + 1) % SKY_SOURCE_NODES.length]
      }
      sourceIndex = next
    }

    const sourceOffset = sourceIndex * 3
    maxSignalDistance = 0
    for (let index = 0; index < skyMap.magnitudes.length; index += 1) {
      const distance = angularDistanceFromNode(sourceOffset, index)
      nodeDistances[index] = distance
      starDistance.setX(index, distance)
      if (isNodeProjectedInside(index)) {
        maxSignalDistance = Math.max(maxSignalDistance, distance)
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
    }
    starDistance.needsUpdate = true
    edgeStartDistance.needsUpdate = true
    edgeEndDistance.needsUpdate = true

    if (selectNewSource) {
      signalStartedAt = now
      uniforms.uPulseDistance.value = 0
    }
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
    updateSource(performance.now(), false)
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
    uniforms.uPulseActive.value = 0
    uniforms.uPulseDistance.value = 0
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
    const pulseDistance = (now - signalStartedAt) * signalSpeed
    if (pulseDistance > maxSignalDistance + uniforms.uHeadWidth.value) {
      enterIdle()
      return
    }
    uniforms.uPulseDistance.value = pulseDistance
    render()
    frame = requestAnimationFrame(animate)
  }
  function beginPulse() {
    if (!active || disposed) return
    stopTimer()
    pulseRunning = true
    const now = performance.now()
    previousRenderTime = 0
    uniforms.uPulseActive.value = 1
    updateSignalColor(true)
    updateSource(now)
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
    uniforms.uPulseDistance.value = 0
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
      scene.remove(edgeMesh, starPoints)
      edgeGeometry.dispose()
      starGeometry.dispose()
      edgeMaterial.dispose()
      starMaterial.dispose()
      renderer.dispose()
    },
  }
}
