import { createContext } from 'svelte'

export interface MenuController {
  is_open: boolean
  open: () => void
}

export const [get_menu_controller, set_menu_controller] =
  createContext<MenuController>()
