import type { SkyMapRuntimeEvent, SkyMapViewStatus } from './runtime/types'

export interface SkyMapSurfaceState {
  signal_active: boolean
  signal_color: string
  view_status: SkyMapViewStatus
}

export interface SkyMapSurfaceProps {
  on_event: (event: SkyMapRuntimeEvent) => void
  state: SkyMapSurfaceState
}
