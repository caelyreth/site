import { createContext } from 'svelte'

export type StationState = {
  scrollProgress: number
}

export const [getStationState, setStationState] =
  createContext<StationState>()
