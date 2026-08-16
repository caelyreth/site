import {
  Color,
  type IUniform,
  Mesh,
  PlaneGeometry,
  ShaderMaterial,
  Vector2,
} from 'three'

import {
  ground_fragment_shader,
  ground_vertex_shader,
  trail_fragment_shader,
  trail_vertex_shader,
} from './shader-sources'

export interface TrailUniforms extends Record<string, IUniform> {
  uAspect: { value: number }
  uGroundHorizon: { value: number }
  uHalfWidth: { value: number }
  uOrbitAngle: { value: number }
  uReflection: { value: number }
  uResolution: { value: Vector2 }
  uTrailAlpha: { value: number }
  uTrailOrbitAngle: { value: number }
}

export interface TrailPass {
  material: ShaderMaterial
  uniforms: TrailUniforms
}

export function create_trail_pass(reflection: boolean): TrailPass {
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

export function create_ground_plane() {
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
