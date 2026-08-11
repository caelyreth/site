import type { StageProps } from '$lib/presentation/contract'
import { preload_sky_map_engine } from '$lib/presentation/stages/observatory/runtime/load-engine'
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

type AperturePhase = 'expanded' | 'contracting' | 'returning'

type Transmission = Readonly<{
  color_index: number
  sequence: number
}>

type PresentationState = {
  field_visible: boolean
  pulse: {
    active: boolean
    phase: AperturePhase
    roller_motion: {
      direction: -1 | 1
      duration: number
      sequence: number
    }
    scale_duration: number
    signal_color_index: number
    typing_paused: boolean
  }
  shutters_loaded: boolean
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
    field_visible: false,
    pulse: {
      active: false,
      phase: 'expanded',
      roller_motion: { direction: 1, duration: 0, sequence: 0 },
      scale_duration: 1000,
      signal_color_index: 0,
      typing_paused: false,
    },
    shutters_loaded: false,
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

  function preload() {
    // Download the lazy renderer while the aperture opens.
    void preload_sky_map_engine().catch(() => {})
  }

  function handle_runtime_event(event: SkyMapRuntimeEvent) {
    if (event.type === 'route_arrival') {
      state.pulse.typing_paused = false
      return
    }
    if (event.type === 'signal_start') {
      start_signal(event.status)
      return
    }
    if (event.type === 'signal_end') {
      end_signal()
      return
    }
    handle_status_event(event)
  }

  function handle_status_event(
    event: Exclude<
      SkyMapRuntimeEvent,
      { type: 'route_arrival' | 'signal_end' | 'signal_start' }
    >,
  ) {
    if (event.type === 'focus_contract_start') {
      state.pulse.scale_duration = event.status.duration
      state.pulse.phase = 'contracting'
      return
    }
    if (event.type === 'focus_return_start') {
      state.pulse.scale_duration = event.status.duration
      state.pulse.phase = 'returning'
      return
    }
    if (event.type === 'route_motion') {
      state.pulse.roller_motion = event.status
      return
    }
    state.view_status = event.status
  }

  function start_signal({
    color_index,
    route_motion_direction,
  }: SkyMapSignalStatus) {
    state.pulse.active = true
    state.pulse.phase = 'expanded'
    state.pulse.typing_paused = true
    state.pulse.signal_color_index = color_index
    state.pulse.roller_motion = {
      ...state.pulse.roller_motion,
      direction: route_motion_direction,
    }
    state.transmissions = [
      { color_index, sequence: next_transmission_sequence },
      ...state.transmissions,
    ].slice(0, 3)
    next_transmission_sequence += 1
  }

  function end_signal() {
    state.pulse.active = false
    state.pulse.phase = 'expanded'
    state.pulse.typing_paused = false
  }

  function reveal_sky_map() {
    state.shutters_loaded = true
    state.field_visible = true
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
    preload,
    reveal_sky_map,
    state,
  }
}
