import {
  Camera,
  Color,
  Mesh,
  Scene,
  SRGBColorSpace,
  WebGLRenderer,
} from 'three'

import { TRAIL_FIELD_COUNT } from './config'
import { create_ground_plane, create_trail_pass } from './materials'
import { get_theme, type Theme } from './theme'
import { create_trail_field, create_trail_geometry } from './trail-field'

export function create_renderer(
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

  function apply_theme(theme: Theme) {
    sky_pass.uniforms.uTrailAlpha.value = theme.trail_alpha
    ground_pass.uniforms.uTrailAlpha.value = theme.trail_alpha * 0.3
    const tint = new Color()
    for (let index = 0; index < TRAIL_FIELD_COUNT; index += 1) {
      tint.setHex(
        theme.trail_inks[
          trail_field.tint_indices[index] % theme.trail_inks.length
        ],
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
    sky_pass.uniforms.uOrbitAngle.value = angle
    sky_pass.uniforms.uTrailOrbitAngle.value = trail_angle
    ground_pass.uniforms.uOrbitAngle.value = angle
    ground_pass.uniforms.uTrailOrbitAngle.value = trail_angle
  }

  function set_theme(dark: boolean) {
    apply_theme(get_theme(dark))
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
