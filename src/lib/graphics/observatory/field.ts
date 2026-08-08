/* oxlint-disable typescript/prefer-readonly-parameter-types -- DOM targets and callback payloads are passed through the public factory. */
import { create_sky_map_controller } from './controller'
import type {
  SkyMapFieldCallbacks,
  SkyMapFieldController,
  SkyMapPayload,
} from './types'

export type {
  SkyMapFieldCallbacks,
  SkyMapFieldController,
  SkyMapLayerMotionStatus,
  SkyMapPulseStatus,
  SkyMapRollerMotionStatus,
  SkyMapViewStatus,
} from './types'

export function create_sky_map_field(
  target: HTMLCanvasElement,
  sky_data: SkyMapPayload,
  initial_dark = false,
  callbacks: SkyMapFieldCallbacks = {},
): SkyMapFieldController {
  return create_sky_map_controller(target, sky_data, initial_dark, callbacks)
}
