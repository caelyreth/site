import type { SkyMapRuntimeEvent, SkyMapViewStatus } from './runtime/types'

export interface SkyMapTransmission {
  color: string
  label: string
  opacity: number
  sequence: number
}

export interface SkyMapSurfaceState {
  signal_active: boolean
  signal_color: string
  transmissions: SkyMapTransmission[]
  view_status: SkyMapViewStatus
}

export interface SkyMapSurfaceProps {
  on_event: (event: SkyMapRuntimeEvent) => void
  state: SkyMapSurfaceState
}
