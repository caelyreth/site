import { cubicOut as cubic_out } from 'svelte/easing'

export const text_refresh_in = {
  duration: 280,
  easing: cubic_out,
  opacity: 0,
  y: 3,
}

export const text_refresh_out = {
  duration: 280,
  easing: cubic_out,
  opacity: 0,
  y: -3,
}
