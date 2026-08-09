import { createContext } from 'svelte'

export type StationState = {
  is_ready: boolean
  scroll_progress: number
}

export const [get_station_state, set_station_state] =
  createContext<StationState>()
