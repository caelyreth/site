import {
  Camera,
  Color,
  Float32BufferAttribute,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  Mesh,
  Scene,
  ShaderMaterial,
  SRGBColorSpace,
  Vector2,
  WebGLRenderer,
} from 'three'

import { TRAIL_FIELD_COUNT, TRAIL_RIBBON_SEGMENTS } from './constants'
import { sky_map_scene_theme } from './scene-theme'
import { trail_fragment_shader, trail_vertex_shader } from './shaders'

function create_ribbon_geometry(segment_count: number) {
  const ribbon = [] as number[]
  const indices = [] as number[]
  for (let point = 0; point <= segment_count; point += 1) {
    const along = point / segment_count
    ribbon.push(along, -1, 0, along, 1, 0)
  }
  for (let segment = 0; segment < segment_count; segment += 1) {
    const start = segment * 2
    const end = start + 2
    indices.push(start, start + 1, end, end, start + 1, end + 1)
  }
  return { indices, ribbon }
}

function create_random() {
  let seed = 0x71e2a9d5
  return () => {
    seed = (seed * 1_664_525 + 1_013_904_223) >>> 0
    return seed / 4_294_967_296
  }
}

export function create_sky_map_renderer(
  target: HTMLCanvasElement,
  initial_dark = false,
) {
  let renderer: WebGLRenderer
  try {
    renderer = new WebGLRenderer({
      alpha: true,
      antialias: false,
      canvas: target,
      powerPreference: 'low-power',
    })
  } catch {
    return undefined
  }

  renderer.setClearColor(0x000000, 0)
  renderer.outputColorSpace = SRGBColorSpace
  renderer.sortObjects = false

  const random = create_random()
  const trail_seeds = new Float32Array(TRAIL_FIELD_COUNT * 2)
  const trail_depths = new Float32Array(TRAIL_FIELD_COUNT)
  const trail_orbit_offsets = new Float32Array(TRAIL_FIELD_COUNT)
  const trail_strengths = new Float32Array(TRAIL_FIELD_COUNT)
  const trail_width_factors = new Float32Array(TRAIL_FIELD_COUNT)
  const trail_tint_indices = new Uint8Array(TRAIL_FIELD_COUNT)

  for (let index = 0; index < TRAIL_FIELD_COUNT; index += 1) {
    const seed = index * 2
    const depth = Math.pow(random(), 0.62)
    trail_seeds[seed] = random()
    trail_seeds[seed + 1] = random()
    trail_depths[index] = depth
    trail_orbit_offsets[index] = random() * Math.PI * 2
    trail_strengths[index] = 0.24 + Math.pow(random(), 1.8) * 0.56
    trail_width_factors[index] = 0.3 + Math.pow(random(), 1.45) * 0.7
    trail_tint_indices[index] = Math.floor(random() * 6)
  }

  const uniforms = {
    uResolution: { value: new Vector2(1, 1) },
    uHalfWidth: { value: 1.32 },
    uOrbitAngle: { value: 0 },
    uTrailOrbitAngle: { value: 0 },
    uTrailAlpha: { value: 1 },
  }
  const material = new ShaderMaterial({
    depthTest: false,
    depthWrite: false,
    fragmentShader: trail_fragment_shader,
    toneMapped: false,
    transparent: true,
    uniforms,
    vertexShader: trail_vertex_shader,
  })

  const trail_geometry = new InstancedBufferGeometry()
  const { indices, ribbon } = create_ribbon_geometry(TRAIL_RIBBON_SEGMENTS)
  trail_geometry.setAttribute(
    'position',
    new Float32BufferAttribute(ribbon, 3),
  )
  trail_geometry.setIndex(indices)
  trail_geometry.setAttribute(
    'aSeed',
    new InstancedBufferAttribute(trail_seeds, 2),
  )
  trail_geometry.setAttribute(
    'aDepth',
    new InstancedBufferAttribute(trail_depths, 1),
  )
  trail_geometry.setAttribute(
    'aOrbitOffset',
    new InstancedBufferAttribute(trail_orbit_offsets, 1),
  )
  trail_geometry.setAttribute(
    'aStrength',
    new InstancedBufferAttribute(trail_strengths, 1),
  )
  trail_geometry.setAttribute(
    'aWidthFactor',
    new InstancedBufferAttribute(trail_width_factors, 1),
  )
  const trail_tints = new InstancedBufferAttribute(
    new Float32Array(TRAIL_FIELD_COUNT * 3),
    3,
  )
  trail_geometry.setAttribute('aTint', trail_tints)
  trail_geometry.instanceCount = TRAIL_FIELD_COUNT

  const scene = new Scene()
  const camera = new Camera()
  const trail_mesh = new Mesh(trail_geometry, material)
  trail_mesh.frustumCulled = false
  scene.add(trail_mesh)

  function update_trail_tints(dark: boolean) {
    const palette = sky_map_scene_theme(dark).trail_inks
    const tint = new Color()
    for (let index = 0; index < TRAIL_FIELD_COUNT; index += 1) {
      tint.setHex(
        palette[trail_tint_indices[index] % palette.length],
        SRGBColorSpace,
      )
      trail_tints.setXYZ(index, tint.r, tint.g, tint.b)
    }
    trail_tints.needsUpdate = true
  }

  function set_orbit(angle: number, trail_angle: number) {
    uniforms.uOrbitAngle.value = angle
    uniforms.uTrailOrbitAngle.value = trail_angle
  }

  function set_theme(dark: boolean) {
    const theme = sky_map_scene_theme(dark)
    uniforms.uTrailAlpha.value = theme.trail_alpha
    update_trail_tints(dark)
  }

  function resize(width: number, height: number, pixel_ratio: number) {
    renderer.setPixelRatio(pixel_ratio)
    renderer.setSize(width, height, false)
    uniforms.uResolution.value.set(
      width * pixel_ratio,
      height * pixel_ratio,
    )
    uniforms.uHalfWidth.value = 1.32 * pixel_ratio
  }

  function draw() {
    renderer.render(scene, camera)
  }

  function dispose() {
    scene.remove(trail_mesh)
    trail_geometry.dispose()
    material.dispose()
    renderer.dispose()
  }

  set_theme(initial_dark)

  return {
    dispose,
    draw,
    resize,
    set_orbit,
    set_theme,
  }
}
