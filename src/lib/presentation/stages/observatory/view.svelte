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
  const surface_state = $derived<SkyMapSurfaceState>({
    signal_active: controller.state.pulse.active,
    signal_color,
    transmissions: controller.state.transmissions.map(
      (transmission, index) => ({
        color: controller.color_for(transmission.color_index),
        label: controller.label_for(transmission.color_index),
        opacity: 1 - index * 0.3,
        sequence: transmission.sequence,
      }),
    ),
    view_status: controller.state.view_status,
  })
</script>

<div class="observatory-stage">
  <SkyMapSurface
    on_event={controller.handle_runtime_event}
    state={surface_state}
  />
  <VfdTube active={surface_state.signal_active} color={signal_color} />
</div>

<style>
  .observatory-stage {
    position: absolute;
    inset: 0;
    overflow: hidden;
  }
</style>
