import type * as SkyDataModule from '$lib/data/sky-map-data.generated'

export type SkyMapPayload = typeof SkyDataModule

export type SkyMapEngine = {
  destroy: () => void
  set_active: (active: boolean) => void
  set_theme: (dark: boolean) => void
}

export type SkyMapViewStatus = Readonly<{
  declination: number
  right_ascension: number
  scale: number
}>

export type SkyMapSignalStatus = Readonly<{
  color_index: number
}>

export type SkyMapRuntimeEvent =
  | Readonly<{ type: 'signal_end' }>
  | Readonly<{ type: 'signal_start'; status: SkyMapSignalStatus }>
  | Readonly<{ type: 'view_change'; status: SkyMapViewStatus }>

export type SkyMapEngineCallbacks = Readonly<{
  on_event?: (event: SkyMapRuntimeEvent) => void
}>

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
