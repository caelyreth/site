/* oxlint-disable complexity, typescript/prefer-readonly-parameter-types -- WebGL resource construction must retain shared shader resources. */
import {
  BufferAttribute,
  BufferGeometry,
  Camera,
  Color,
  DataTexture,
  Float32BufferAttribute,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
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
  BACKDROP_CELL_COUNT,
  BACKDROP_CELL_SIZE,
  BACKDROP_SIZE,
  BASE_VIEW_RADIUS,
  DESTINATION_CONSTELLATION_LEAD,
  PULSE_HEAD_WIDTH,
  ROUTE_RIBBON_SEGMENTS,
  TRAIL_FIELD_SAMPLE_RATE,
  TRAIL_MAX_LENGTH,
} from './constants'
import { decode_sky_map } from './decoder'
import { brightness_for_magnitude, map_scale_for_view_radius } from './motion'
import {
  background_fragment_shader,
  background_vertex_shader,
  edge_fragment_shader,
  edge_vertex_shader,
  route_fragment_shader,
  route_vertex_shader,
  star_fragment_shader,
  star_vertex_shader,
  trail_fragment_shader,
  trail_vertex_shader,
} from './shaders'
import type { SkyMapPayload } from './types'

function create_backdrop_texture() {
  const pixels = new Uint8Array(BACKDROP_SIZE * BACKDROP_SIZE * 4)
  let seed = 0x8f3d91a7
  const random = () => {
    seed = (seed * 1_664_525 + 1_013_904_223) >>> 0
    return seed / 4_294_967_296
  }
  const cell_brightness = new Uint8Array(
    BACKDROP_CELL_COUNT * BACKDROP_CELL_COUNT,
  )
  for (let cell = 0; cell < cell_brightness.length; cell += 1) {
    if (random() >= 0.06) continue
    cell_brightness[cell] =
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
    const brightness = cell_brightness[cell]
    const offset = pixel * 4
    pixels[offset] = brightness
    pixels[offset + 1] = brightness
    pixels[offset + 2] = brightness
    pixels[offset + 3] = 255
  }

  const texture = new DataTexture(pixels, BACKDROP_SIZE, BACKDROP_SIZE)
  texture.generateMipmaps = true
  texture.magFilter = NearestFilter
  texture.minFilter = LinearMipmapLinearFilter
  texture.unpackAlignment = 1
  texture.wrapS = RepeatWrapping
  texture.needsUpdate = true
  return texture
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

export function create_sky_map_renderer(
  target: HTMLCanvasElement,
  sky_data: SkyMapPayload,
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

  const sky_map = decode_sky_map(sky_data)
  const { SKY_VIEW_BASIS } = sky_data
  const star_brightnesses = new Float32Array(sky_map.magnitudes.length)
  const trail_directions = [] as number[]
  const trail_strengths = [] as number[]
  const trail_width_factors = [] as number[]
  let trail_seed = 0x71e2a9d5
  for (let index = 0; index < sky_map.magnitudes.length; index += 1) {
    const brightness = brightness_for_magnitude(sky_map.magnitudes[index])
    star_brightnesses[index] = brightness
    trail_seed = (trail_seed * 1_664_525 + 1_013_904_223) >>> 0
    const selected = trail_seed / 4_294_967_296 < TRAIL_FIELD_SAMPLE_RATE
    if (sky_map.node_groups[index] < 0 && !selected) continue
    const direction = index * 3
    trail_directions.push(
      sky_map.directions[direction],
      sky_map.directions[direction + 1],
      sky_map.directions[direction + 2],
    )
    trail_strengths.push(0.16 + Math.pow(brightness, 0.72) * 0.38)
    trail_width_factors.push(Math.pow(brightness, 0.68))
  }

  const backdrop_texture = create_backdrop_texture()
  const uniforms = {
    uResolution: { value: new Vector2(1, 1) },
    uPixelRatio: { value: 1 },
    uAspect: { value: 1 },
    uMapScale: { value: map_scale_for_view_radius(BASE_VIEW_RADIUS) },
    uRight: {
      value: new Vector3(SKY_VIEW_BASIS[0], SKY_VIEW_BASIS[1], SKY_VIEW_BASIS[2]),
    },
    uUp: {
      value: new Vector3(SKY_VIEW_BASIS[3], SKY_VIEW_BASIS[4], SKY_VIEW_BASIS[5]),
    },
    uForward: {
      value: new Vector3(SKY_VIEW_BASIS[6], SKY_VIEW_BASIS[7], SKY_VIEW_BASIS[8]),
    },
    uHalfWidth: { value: 1.32 },
    uPulseDistance: { value: 0 },
    uRoutePulseDistance: { value: 0 },
    uPulseActive: { value: 0 },
    uTargetDistance: { value: 0 },
    uDestinationConstellationLead: { value: DESTINATION_CONSTELLATION_LEAD },
    uSourceActivation: { value: 0 },
    uHeadWidth: { value: PULSE_HEAD_WIDTH },
    uTailWidth: { value: 0.46 },
    uSourceRadius: { value: 0.04 },
    uLocatorProgress: { value: 0 },
    uLocatorScale: { value: 1 },
    uRouteStart: { value: new Vector3() },
    uRouteEnd: { value: new Vector3() },
    uRouteBend: { value: new Vector3() },
    uRouteLength: { value: 0 },
    uSourceConstellation: { value: -1 },
    uTargetConstellation: { value: -1 },
    uHeldSourceConstellation: { value: -1 },
    uHeldTargetConstellation: { value: -1 },
    uRetiringConstellation: { value: -1 },
    uRetireProgress: { value: 1 },
    uBackdrop: { value: backdrop_texture },
    uBackgroundAlpha: { value: 1 },
    uBackgroundInk: { value: new Color(0x000000) },
    uInk: { value: new Color(0xffffff) },
    uSignalInk: { value: new Color(0xffffff) },
    uBaseAlpha: { value: 0.2 },
    uSurveyMode: { value: initial_dark ? 0 : 1 },
    uTrailMapScale: { value: map_scale_for_view_radius(BASE_VIEW_RADIUS) },
    uTrailMaxLength: { value: TRAIL_MAX_LENGTH },
    uTrailOpacity: { value: 0 },
    uTrailRight: {
      value: new Vector3(SKY_VIEW_BASIS[0], SKY_VIEW_BASIS[1], SKY_VIEW_BASIS[2]),
    },
    uTrailUp: {
      value: new Vector3(SKY_VIEW_BASIS[3], SKY_VIEW_BASIS[4], SKY_VIEW_BASIS[5]),
    },
    uTrailForward: {
      value: new Vector3(SKY_VIEW_BASIS[6], SKY_VIEW_BASIS[7], SKY_VIEW_BASIS[8]),
    },
  }
  const material_options = {
    depthTest: false,
    depthWrite: false,
    toneMapped: false,
    transparent: true,
    uniforms,
  }
  const background_material = new ShaderMaterial({
    ...material_options,
    fragmentShader: background_fragment_shader,
    vertexShader: background_vertex_shader,
  })
  const edge_material = new ShaderMaterial({
    ...material_options,
    fragmentShader: edge_fragment_shader,
    vertexShader: edge_vertex_shader,
  })
  const route_material = new ShaderMaterial({
    ...material_options,
    fragmentShader: route_fragment_shader,
    vertexShader: route_vertex_shader,
  })
  const star_material = new ShaderMaterial({
    ...material_options,
    fragmentShader: star_fragment_shader,
    vertexShader: star_vertex_shader,
  })
  const trail_material = new ShaderMaterial({
    ...material_options,
    fragmentShader: trail_fragment_shader,
    vertexShader: trail_vertex_shader,
  })

  const { indices: edge_indices, ribbon: edge_ribbon } = create_ribbon_geometry(4)
  const { indices: route_indices, ribbon: route_ribbon } = create_ribbon_geometry(
    ROUTE_RIBBON_SEGMENTS,
  )
  const edge_count = sky_map.edge_nodes.length / 2
  const starts = new Float32Array(edge_count * 3)
  const ends = new Float32Array(edge_count * 3)
  for (let index = 0; index < edge_count; index += 1) {
    const start_node = sky_map.edge_nodes[index * 2] * 3
    const end_node = sky_map.edge_nodes[index * 2 + 1] * 3
    starts.set(sky_map.directions.subarray(start_node, start_node + 3), index * 3)
    ends.set(sky_map.directions.subarray(end_node, end_node + 3), index * 3)
  }

  const edge_geometry = new InstancedBufferGeometry()
  edge_geometry.setAttribute('position', new Float32BufferAttribute(edge_ribbon, 3))
  edge_geometry.setIndex(edge_indices)
  edge_geometry.setAttribute('aStart', new InstancedBufferAttribute(starts, 3))
  edge_geometry.setAttribute('aEnd', new InstancedBufferAttribute(ends, 3))
  edge_geometry.setAttribute(
    'aDistanceStart',
    new InstancedBufferAttribute(new Float32Array(edge_count), 1),
  )
  edge_geometry.setAttribute(
    'aDistanceEnd',
    new InstancedBufferAttribute(new Float32Array(edge_count), 1),
  )
  edge_geometry.setAttribute(
    'aTargetDistanceStart',
    new InstancedBufferAttribute(new Float32Array(edge_count), 1),
  )
  edge_geometry.setAttribute(
    'aTargetDistanceEnd',
    new InstancedBufferAttribute(new Float32Array(edge_count), 1),
  )
  edge_geometry.setAttribute('aWeight', new InstancedBufferAttribute(sky_map.edge_weights, 1))
  edge_geometry.setAttribute(
    'aConstellation',
    new InstancedBufferAttribute(sky_map.edge_groups, 1),
  )
  edge_geometry.instanceCount = edge_count

  const route_geometry = new BufferGeometry()
  route_geometry.setAttribute('position', new Float32BufferAttribute(route_ribbon, 3))
  route_geometry.setIndex(route_indices)

  const trail_geometry = new InstancedBufferGeometry()
  trail_geometry.setAttribute(
    'position',
    new Float32BufferAttribute([0, -1, 0, 0, 1, 0, 1, -1, 0, 1, 1, 0], 3),
  )
  trail_geometry.setIndex([0, 1, 2, 2, 1, 3])
  trail_geometry.setAttribute(
    'aDirection',
    new InstancedBufferAttribute(new Float32Array(trail_directions), 3),
  )
  trail_geometry.setAttribute(
    'aStrength',
    new InstancedBufferAttribute(new Float32Array(trail_strengths), 1),
  )
  trail_geometry.setAttribute(
    'aWidthFactor',
    new InstancedBufferAttribute(new Float32Array(trail_width_factors), 1),
  )
  trail_geometry.instanceCount = trail_strengths.length

  const background_geometry = new BufferGeometry()
  background_geometry.setAttribute(
    'position',
    new Float32BufferAttribute([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1], 2),
  )

  const star_geometry = new BufferGeometry()
  star_geometry.setAttribute('position', new BufferAttribute(sky_map.directions, 3))
  star_geometry.setAttribute('aBrightness', new BufferAttribute(star_brightnesses, 1))
  star_geometry.setAttribute(
    'aDistance',
    new BufferAttribute(new Float32Array(sky_map.magnitudes.length), 1),
  )
  star_geometry.setAttribute(
    'aTargetDistance',
    new BufferAttribute(new Float32Array(sky_map.magnitudes.length), 1),
  )
  star_geometry.setAttribute(
    'aLocator',
    new BufferAttribute(new Float32Array(sky_map.magnitudes.length), 1),
  )
  star_geometry.setAttribute('aConstellation', new BufferAttribute(sky_map.node_groups, 1))

  const scene = new Scene()
  const camera = new Camera()
  const background_mesh = new Mesh(background_geometry, background_material)
  background_mesh.frustumCulled = false
  background_mesh.renderOrder = -1
  const edge_mesh = new Mesh(edge_geometry, edge_material)
  edge_mesh.frustumCulled = false
  const route_mesh = new Mesh(route_geometry, route_material)
  route_mesh.frustumCulled = false
  route_mesh.renderOrder = 0.75
  const trail_mesh = new Mesh(trail_geometry, trail_material)
  trail_mesh.frustumCulled = false
  trail_mesh.renderOrder = 0.25
  const star_points = new Points(star_geometry, star_material)
  star_points.frustumCulled = false
  star_points.renderOrder = 1
  scene.add(background_mesh, edge_mesh, route_mesh, trail_mesh, star_points)

  function draw(before_render?: () => void) {
    route_mesh.visible = uniforms.uPulseActive.value > 0.001
    trail_mesh.visible = uniforms.uTrailOpacity.value > 0.001
    before_render?.()
    renderer.render(scene, camera)
  }

  function dispose() {
    scene.remove(background_mesh, edge_mesh, route_mesh, trail_mesh, star_points)
    background_geometry.dispose()
    edge_geometry.dispose()
    route_geometry.dispose()
    star_geometry.dispose()
    trail_geometry.dispose()
    background_material.dispose()
    edge_material.dispose()
    route_material.dispose()
    star_material.dispose()
    trail_material.dispose()
    backdrop_texture.dispose()
    renderer.dispose()
  }

  return {
    draw,
    dispose,
    edge_geometry,
    renderer,
    sky_map,
    star_geometry,
    uniforms,
  }
}

export type SkyMapRendererResources = NonNullable<
  ReturnType<typeof create_sky_map_renderer>
>
