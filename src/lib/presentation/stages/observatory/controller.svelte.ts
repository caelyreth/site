import type { StageProps } from '$lib/presentation/contract'
import {
  SIGNAL_STATUS_LABELS,
  TRANSMISSION_COLORS,
} from '$lib/presentation/stages/observatory/runtime/signal-colors'
import { useTheme as use_theme } from 'svelte-themes'

import type {
  SkyMapRuntimeEvent,
  SkyMapSignalStatus,
  SkyMapViewStatus,
} from './runtime/types'

interface Transmission {
  color_index: number
  sequence: number
}

interface SignalState {
  active: boolean
  signal_color_index: number
}

interface PresentationState {
  pulse: SignalState
  transmissions: Transmission[]
  view_status: SkyMapViewStatus
}

type SignalCallback = StageProps['on_signal']

export function create_observatory_controller(
  get_on_signal: () => SignalCallback,
) {
  const theme = use_theme()
  let next_transmission_sequence = 1
  const state = $state<PresentationState>({
    pulse: {
      active: false,
      signal_color_index: 0,
    },
    transmissions: [],
    view_status: {
      declination: 42,
      right_ascension: 322,
      scale: 0.48,
    },
  })
  const transmission_colors = $derived(
    theme.resolvedTheme === 'dark'
      ? TRANSMISSION_COLORS.dark
      : TRANSMISSION_COLORS.light,
  )

  $effect(() => {
    const on_signal = get_on_signal()
    on_signal?.(
      state.pulse.active
        ? { color: color_for(state.pulse.signal_color_index) }
        : undefined,
    )
    return () => on_signal?.(undefined)
  })

  function handle_runtime_event(event: SkyMapRuntimeEvent) {
    if (event.type === 'signal_start') {
      start_signal(event.status)
      return
    }
    if (event.type === 'signal_end') {
      end_signal()
      return
    }
    if (event.type === 'view_change') state.view_status = event.status
  }

  function start_signal({ color_index }: SkyMapSignalStatus) {
    state.pulse.active = true
    state.pulse.signal_color_index = color_index
    state.transmissions = [
      { color_index, sequence: next_transmission_sequence },
      ...state.transmissions,
    ].slice(0, 3)
    next_transmission_sequence += 1
  }

  function end_signal() {
    state.pulse.active = false
  }

  function color_for(color_index: number) {
    return transmission_colors[color_index] ?? transmission_colors[0]
  }

  function label_for(color_index: number) {
    return SIGNAL_STATUS_LABELS[color_index] ?? SIGNAL_STATUS_LABELS[0]
  }

  return {
    color_for,
    handle_runtime_event,
    label_for,
    state,
  }
}
