<script lang="ts">
  import type { StageProps } from '$lib/presentation/contract'
  import VfdTube from '$lib/presentation/parts/vfd-tube/view.svelte'
  import type { SkyMapSurfaceState } from '$lib/presentation/surfaces/sky-map/contract'
  import SkyMapSurface from '$lib/presentation/surfaces/sky-map/view.svelte'

  import { create_observatory_controller } from './controller.svelte'

  /* oxlint-disable prefer-const -- Stage callback can update with its host. */
  let { on_signal }: StageProps = $props()
  const controller = create_observatory_controller(() => on_signal)
  const signal_color = $derived(
    controller.color_for(controller.state.pulse.signal_color_index),
  )
  const tube_readout = $derived(
    format_tube_readout(controller.state.view_status),
  )
  const surface_state = $derived<SkyMapSurfaceState>({
    signal_active: controller.state.pulse.active,
    signal_color,
    view_status: controller.state.view_status,
  })

  function format_tube_readout({
    declination,
    right_ascension,
  }: SkyMapSurfaceState['view_status']) {
    const right_ascension_degrees = Math.round(right_ascension)
      .toString()
      .padStart(3, '0')
    const declination_degrees = Math.round(declination)
    const declination_sign = declination_degrees < 0 ? '-' : '+'
    const declination_magnitude = Math.abs(declination_degrees)
      .toString()
      .padStart(2, '0')
    return `R${right_ascension_degrees}*D${declination_sign}${declination_magnitude}`
  }
</script>

<div class="observatory-stage">
  <SkyMapSurface
    on_event={controller.handle_runtime_event}
    state={surface_state}
  />
  <VfdTube
    active={surface_state.signal_active}
    color={signal_color}
    readout={tube_readout}
  />
</div>

<style>
  .observatory-stage {
    position: absolute;
    inset: 0;
    overflow: hidden;
  }
</style>
