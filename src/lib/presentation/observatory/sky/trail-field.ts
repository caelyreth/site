import {
  type BufferAttribute,
  Float32BufferAttribute,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
} from 'three'

import { TRAIL_FIELD_COUNT, TRAIL_RIBBON_SEGMENTS } from './config'

export interface TrailField {
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

export function create_trail_field(): TrailField {
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

export function create_trail_geometry(field: TrailField) {
  const geometry = new InstancedBufferGeometry()
  geometry.setIndex(field.indices)
  geometry.setAttribute('aTint', field.tints)
  for (const [name, attribute] of field.attributes) {
    geometry.setAttribute(name, attribute)
  }
  geometry.instanceCount = TRAIL_FIELD_COUNT
  return geometry
}
