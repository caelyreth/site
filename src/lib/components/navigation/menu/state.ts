import { createContext } from 'svelte'

export interface MenuState {
  is_open: boolean
}

export const [get_menu_state, set_menu_state] = createContext<MenuState>()
