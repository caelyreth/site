import { cubicOut } from 'svelte/easing'

export const textRefreshIn = {
  duration: 280,
  easing: cubicOut,
  opacity: 0,
  y: 3,
}

export const textRefreshOut = {
  duration: 280,
  easing: cubicOut,
  opacity: 0,
  y: -3,
}
