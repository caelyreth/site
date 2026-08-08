import { createContext } from 'svelte'

export type StationState = {
  scroll_progress: number
}

export const [get_station_state, set_station_state] =
  createContext<StationState>()
