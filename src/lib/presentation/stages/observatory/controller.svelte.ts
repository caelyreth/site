import type { StageProps } from '$lib/presentation/contract'
import {
  signal_status_labels,
  sky_map_scene_theme,
} from '$lib/presentation/surfaces/sky-map/runtime/scene-theme'
import type {
  SkyMapRuntimeEvent,
  SkyMapSignalStatus,
  SkyMapViewStatus,
} from '$lib/presentation/surfaces/sky-map/runtime/types'
import { useTheme as use_theme } from 'svelte-themes'

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
  const scene_theme = $derived(
    sky_map_scene_theme(theme.resolvedTheme === 'dark'),
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
    const colors = scene_theme.signal_colors
    return colors[color_index] ?? colors[0]
  }

  function label_for(color_index: number) {
    return signal_status_labels[color_index] ?? signal_status_labels[0]
  }

  return {
    color_for,
    handle_runtime_event,
    label_for,
    state,
  }
}
