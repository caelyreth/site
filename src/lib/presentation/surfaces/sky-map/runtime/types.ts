import type * as SkyDataModule from '$lib/data/sky-map-data.generated'

export type SkyMapPayload = typeof SkyDataModule

export interface SkyMapEngine {
  destroy: () => void
  set_active: (active: boolean) => void
  set_active_viewport: (viewport?: SkyMapViewport) => void
  set_theme: (dark: boolean) => void
}

export interface SkyMapViewport {
  bottom: number
  left: number
  right: number
  top: number
}

export interface SkyMapViewStatus {
  declination: number
  right_ascension: number
  scale: number
}

export interface SkyMapSignalStatus {
  color_index: number
}

export type SkyMapRuntimeEvent =
  | { type: 'signal_end' }
  | { type: 'signal_start'; status: SkyMapSignalStatus }
  | { type: 'view_change'; status: SkyMapViewStatus }

export interface SkyMapEngineCallbacks {
  on_event?: (event: SkyMapRuntimeEvent) => void
}

export interface DecodedSkyMap {
  directions: Float32Array
  magnitudes: Float32Array
  edge_nodes: Uint16Array
  edge_groups: Uint16Array
  edge_weights: Float32Array
  node_groups: Int16Array
}

export interface RouteCandidate {
  in_active_viewport: boolean
  index: number
  radius: number
  sector: number
  view_distance: number
}
