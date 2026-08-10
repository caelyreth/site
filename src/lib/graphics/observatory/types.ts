/* oxlint-disable typescript/prefer-readonly-parameter-types -- callback payloads follow mutable framework contracts. */
import type * as SkyDataModule from '$lib/data/sky-map-data.generated'

export type SkyMapPayload = typeof SkyDataModule

export type SkyMapEngine = {
  destroy: () => void
  set_active: (active: boolean) => void
  set_theme: (dark: boolean) => void
}

export type SkyMapViewStatus = {
  declination: number
  right_ascension: number
  scale: number
}

export type SkyMapPulseStatus = {
  color_index: number
  roller_direction: -1 | 1
}

export type SkyMapLayerMotionStatus = {
  duration: number
}

export type SkyMapRollerMotionStatus = {
  direction: -1 | 1
  duration: number
  sequence: number
}

export type SkyMapEngineEvent =
  | { type: 'destination_arrival' }
  | { type: 'foreground_contract_start'; status: SkyMapLayerMotionStatus }
  | { type: 'foreground_return_start'; status: SkyMapLayerMotionStatus }
  | { type: 'roller_motion'; status: SkyMapRollerMotionStatus }
  | { type: 'spread_end' }
  | { type: 'spread_start'; status: SkyMapPulseStatus }
  | { type: 'view_change'; status: SkyMapViewStatus }

export type SkyMapEngineCallbacks = {
  on_event?: (event: SkyMapEngineEvent) => void
}

export type DecodedSkyMap = {
  directions: Float32Array
  magnitudes: Float32Array
  edge_nodes: Uint16Array
  edge_groups: Uint16Array
  edge_weights: Float32Array
  node_groups: Int16Array
}

export type RouteCandidate = {
  index: number
  radius: number
  sector: number
  view_distance: number
}
