import {
  type BufferAttribute,
  Camera,
  Color,
  Float32BufferAttribute,
  type IUniform,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  Mesh,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  SRGBColorSpace,
  Vector2,
  WebGLRenderer,
} from 'three'

import { TRAIL_FIELD_COUNT, TRAIL_RIBBON_SEGMENTS } from './constants'
import { sky_map_scene_theme } from './scene-theme'
import {
  ground_fragment_shader,
  ground_vertex_shader,
  trail_fragment_shader,
  trail_vertex_shader,
} from './shaders'

interface TrailUniforms extends Record<string, IUniform> {
  uAspect: { value: number }
  uGroundHorizon: { value: number }
  uHalfWidth: { value: number }
  uOrbitAngle: { value: number }
  uReflection: { value: number }
  uResolution: { value: Vector2 }
  uTrailAlpha: { value: number }
  uTrailOrbitAngle: { value: number }
}

interface TrailPass {
  material: ShaderMaterial
  uniforms: TrailUniforms
}

interface TrailField {
  attributes: readonly (readonly [string, BufferAttribute])[]
  indices: number[]
  tint_indices: Uint8Array
  tints: InstancedBufferAttribute
}

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

function create_trail_pass(reflection: boolean): TrailPass {
  const uniforms: TrailUniforms = {
    uAspect: { value: 1 },
    uGroundHorizon: { value: 0.64 },
    uHalfWidth: { value: 1.32 },
    uOrbitAngle: { value: 0 },
    uReflection: { value: reflection ? 1 : 0 },
    uResolution: { value: new Vector2(1, 1) },
    uTrailAlpha: { value: 1 },
    uTrailOrbitAngle: { value: 0 },
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
  return { material, uniforms }
}

function create_trail_field(): TrailField {
  const random = create_random()
  const trail_seeds = new Float32Array(TRAIL_FIELD_COUNT * 2)
  const trail_depths = new Float32Array(TRAIL_FIELD_COUNT)
  const trail_orbit_offsets = new Float32Array(TRAIL_FIELD_COUNT)
  const trail_strengths = new Float32Array(TRAIL_FIELD_COUNT)
  const trail_width_factors = new Float32Array(TRAIL_FIELD_COUNT)
  const tint_indices = new Uint8Array(TRAIL_FIELD_COUNT)

  for (let index = 0; index < TRAIL_FIELD_COUNT; index += 1) {
    const seed = index * 2
    const depth = Math.pow(random(), 0.62)
    trail_seeds[seed] = random()
    trail_seeds[seed + 1] = random()
    trail_depths[index] = depth
    trail_orbit_offsets[index] = random() * Math.PI * 2
    trail_strengths[index] = 0.24 + Math.pow(random(), 1.8) * 0.56
    trail_width_factors[index] = 0.3 + Math.pow(random(), 1.45) * 0.7
    tint_indices[index] = Math.floor(random() * 6)
  }

  const { indices, ribbon } = create_ribbon_geometry(TRAIL_RIBBON_SEGMENTS)
  return {
    attributes: [
      ['aDepth', new InstancedBufferAttribute(trail_depths, 1)],
      [
        'aOrbitOffset',
        new InstancedBufferAttribute(trail_orbit_offsets, 1),
      ],
      ['aSeed', new InstancedBufferAttribute(trail_seeds, 2)],
      ['aStrength', new InstancedBufferAttribute(trail_strengths, 1)],
      [
        'aWidthFactor',
        new InstancedBufferAttribute(trail_width_factors, 1),
      ],
      ['position', new Float32BufferAttribute(ribbon, 3)],
    ],
    indices,
    tint_indices,
    tints: new InstancedBufferAttribute(
      new Float32Array(TRAIL_FIELD_COUNT * 3),
      3,
    ),
  }
}

function create_trail_geometry(field: TrailField) {
  const geometry = new InstancedBufferGeometry()
  geometry.setIndex(field.indices)
  geometry.setAttribute('aTint', field.tints)
  for (const [name, attribute] of field.attributes) {
    geometry.setAttribute(name, attribute)
  }
  geometry.instanceCount = TRAIL_FIELD_COUNT
  return geometry
}

function create_ground_plane() {
  const uniforms = {
    uGroundAlpha: { value: 1 },
    uGroundHorizon: { value: 0.64 },
    uGroundInk: { value: new Color() },
    uGroundLight: { value: new Color() },
  }
  const material = new ShaderMaterial({
    depthTest: false,
    depthWrite: false,
    fragmentShader: ground_fragment_shader,
    toneMapped: false,
    transparent: true,
    uniforms,
    vertexShader: ground_vertex_shader,
  })
  const geometry = new PlaneGeometry(2, 2)
  const mesh = new Mesh(geometry, material)
  mesh.frustumCulled = false
  return { geometry, material, mesh, uniforms }
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

  const trail_field = create_trail_field()
  const sky_pass = create_trail_pass(false)
  const ground_pass = create_trail_pass(true)
  const ground_plane = create_ground_plane()
  const sky_geometry = create_trail_geometry(trail_field)
  const ground_geometry = create_trail_geometry(trail_field)

  const scene = new Scene()
  const camera = new Camera()
  const ground_mesh = new Mesh(ground_geometry, ground_pass.material)
  const sky_mesh = new Mesh(sky_geometry, sky_pass.material)
  ground_mesh.frustumCulled = false
  sky_mesh.frustumCulled = false
  scene.add(ground_plane.mesh, ground_mesh, sky_mesh)

  function update_trail_tints(dark: boolean) {
    const theme = sky_map_scene_theme(dark)
    const palette = theme.trail_inks
    const tint = new Color()
    for (let index = 0; index < TRAIL_FIELD_COUNT; index += 1) {
      tint.setHex(
        palette[trail_field.tint_indices[index] % palette.length],
        SRGBColorSpace,
      )
      trail_field.tints.setXYZ(index, tint.r, tint.g, tint.b)
    }
    trail_field.tints.needsUpdate = true
    ground_plane.uniforms.uGroundAlpha.value = theme.ground_alpha
    ground_plane.uniforms.uGroundInk.value.setHex(
      theme.ground_ink,
      SRGBColorSpace,
    )
    ground_plane.uniforms.uGroundLight.value.setHex(
      theme.ground_light,
      SRGBColorSpace,
    )
  }

  function set_orbit(angle: number, trail_angle: number) {
    for (const pass of [ground_pass, sky_pass]) {
      pass.uniforms.uOrbitAngle.value = angle
      pass.uniforms.uTrailOrbitAngle.value = trail_angle
    }
  }

  function set_theme(dark: boolean) {
    const theme = sky_map_scene_theme(dark)
    sky_pass.uniforms.uTrailAlpha.value = theme.trail_alpha
    ground_pass.uniforms.uTrailAlpha.value = theme.trail_alpha * 0.3
    update_trail_tints(dark)
  }

  function resize(width: number, height: number, pixel_ratio: number) {
    renderer.setPixelRatio(pixel_ratio)
    renderer.setSize(width, height, false)
    for (const pass of [ground_pass, sky_pass]) {
      pass.uniforms.uAspect.value = width / height
      pass.uniforms.uResolution.value.set(
        width * pixel_ratio,
        height * pixel_ratio,
      )
      pass.uniforms.uHalfWidth.value = 1.32 * pixel_ratio
    }
  }

  function draw() {
    renderer.render(scene, camera)
  }

  function dispose() {
    scene.remove(ground_plane.mesh, ground_mesh, sky_mesh)
    ground_plane.geometry.dispose()
    ground_plane.material.dispose()
    ground_geometry.dispose()
    sky_geometry.dispose()
    ground_pass.material.dispose()
    sky_pass.material.dispose()
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
